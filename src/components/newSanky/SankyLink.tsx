import React, { JSX, useEffect, useRef, useState } from 'react';
import { SankeyDataLink, SankeyDataNode } from '@/constants/data';
import * as d3 from 'd3';
import {
  sankeyLinkHorizontal,
  SankeyLink as SankeyLinkType,
  SankeyNodeMinimal,
} from 'd3-sankey';

import { colorRectFunc } from './parse';
import { RectNode } from './SankyRect';

export type PathLink = SankeyLinkType<SankeyDataNode, SankeyDataLink>;

// const makeDPath = sankeyLinkHorizontal<SankeyDataNode, SankeyDataLink>();

// Custom path generator that creates S-curve/funnel shaped links
const makeCustomDPath = (
  link: PathLink,
  sourceIndex: number,
  numLinks: number
): string => {
  const source = link.source as SankeyNodeMinimal<
    SankeyDataNode,
    SankeyDataLink
  >;
  const target = link.target as SankeyNodeMinimal<
    SankeyDataNode,
    SankeyDataLink
  >;

  // Source coordinates
  const sourceX = source.x1!;
  const sourceY0 = source.y0!;
  const sourceY1 = source.y1!;
  const sourceHeight = sourceY1 - sourceY0;

  // Calculate the link height, assuming equal area for each link
  const linkHeight = sourceHeight / source.sourceLinks?.length!;

  // Calculate the y-coordinate for this link
  const linkY0 = sourceY0 + sourceIndex * linkHeight;
  const linkY1 = linkY0 + linkHeight;

  // Target coordinates
  const targetX = target.x0!;
  const targetY0 = target.y0!;
  const targetY1 = target.y1!;
  const targetHeight = targetY1 - targetY0;

  // Calculate control points for the S-curve
  const xDistance = targetX - sourceX;
  const control1X = sourceX + xDistance * 0.4; // First control point 40% along the way
  const control2X = sourceX + xDistance * 0.6; // Second control point 60% along the way

  // Create the S-curve bezier path
  const path = `M ${sourceX} ${linkY0}
    C ${control1X} ${linkY0}, ${control2X} ${targetY0}, ${targetX} ${targetY0}
    L ${targetX} ${targetY1}
    C ${control2X} ${targetY1}, ${control1X} ${linkY1}, ${sourceX} ${linkY1}
    Z`;

  return path;
};

interface SankeyLinkProps {
  // d: string;
  path: string;
  strokeWidth?: number;
  color?: string;
  title?: string;
  source?: string;
  target?: string;
  link: PathLink;
  renderedLinksCache: Set<string>;
  setRenderedLinksCache: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const SankeyLink = ({
  // d,
  path,
  color,
  strokeWidth,
  title,
  source,
  target,
  link,
  renderedLinksCache,
  setRenderedLinksCache,
}: SankeyLinkProps): JSX.Element => {
  const pathRef = useRef<SVGPathElement>(null);
  // const [pathLength, setPathLength] = useState(0);
  const [animationActive, setAnimationActive] = useState(true);

  const linkKey = `${source}--${target}`;

  const uuid = `${(link.source as SankeyDataNode & SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>).index}-${(link.target as SankeyDataNode & SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>).index}`;

  const sourceNodeColor = colorRectFunc(link.source);
  const targetNodeColor = colorRectFunc(link.target);

  useEffect(() => {
    if (pathRef.current && !renderedLinksCache.has(linkKey)) {
      setRenderedLinksCache((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(linkKey);
        return newSet;
      });
      const length = pathRef.current.getTotalLength();
      // setPathLength(length);

      // Reset animation when component mounts
      if (pathRef.current) {
        pathRef.current.style.strokeDasharray = `${length} ${length}`;
        pathRef.current.style.strokeDashoffset = `${length}`;

        // Trigger animation
        setTimeout(() => {
          if (pathRef.current) {
            pathRef.current.style.transition =
              'stroke-dashoffset 0.5s ease-in-out';
            pathRef.current.style.strokeDashoffset = '0';
          }
        }, 50);
      }
    }
  }, [linkKey]);

  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      {/* Define linear gradient inside <defs> */}
      <defs>
        <linearGradient
          id={`linkGradient-${uuid}`}
          x1={
            (link.source as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .x1
          }
          y1={
            (link.source as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .y0! +
            ((link.source as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .y1! -
              (link.source as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
                .y0!) /
              2
          }
          x2={
            (link.target as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .x0
          }
          y2={
            (link.target as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .y0! +
            ((link.target as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
              .y1! -
              (link.target as SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>)
                .y0!) /
              2
          }
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={sourceNodeColor} />
          <stop offset="100%" stopColor={targetNodeColor} />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={path}
        // stroke={`url(#linkGradient-${uuid})`}
        // strokeWidth={strokeWidth}
        fill={`url(#linkGradient-${uuid})`}
        id={`path-link-${uuid}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.strokeOpacity = '1';
          const tooltip = d3.select('#tooltip');
          const tooltipWidth = 120; // Approx width of tooltip
          const xPos = e.pageX + 10;
          const yPos = e.pageY - 28;

          tooltip
            .style(
              'left',
              `${Math.min(xPos, window.innerWidth - tooltipWidth)}px`
            )
            .style('top', `${Math.max(10, yPos)}px`)
            .style('opacity', 1)
            .html(`${source} → ${target}`);
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.strokeOpacity = '0.5';
          d3.select('#tooltip').style('opacity', 0);
        }}
      ></path>
    </g>
  );
};

interface SankeyLinksProps {
  links: PathLink[];
  titleFunc?(link: PathLink): string;
  colorFunc?(link: PathLink): string;
  renderedLinksCache: Set<string>;
  setRenderedLinksCache: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const SankeyLinks = ({
  links,
  titleFunc,
  colorFunc,
  renderedLinksCache,
  setRenderedLinksCache,
}: SankeyLinksProps): JSX.Element => {
  return (
    <g fillOpacity={0.5}>
      {links.map((link, index) => {
        const customPath = makeCustomDPath(link, index, links.length);
        // const d = makeDPath(link)

        if (!customPath) return null;

        const strokeWidth = Math.max(1, link.width || 0);
        const { source, target } = link;
        const sourceName =
          typeof source === 'object'
            ? (source as RectNode).name
            : (source as string);
        const targetName =
          typeof target === 'object'
            ? (target as RectNode).name
            : (target as string);
        const key = `${sourceName}--${targetName}`;

        return (
          <SankeyLink
            key={key}
            // d={d}
            path={customPath}
            color={colorFunc?.(link)}
            title={titleFunc?.(link)}
            strokeWidth={strokeWidth}
            source={sourceName}
            target={targetName}
            link={link}
            renderedLinksCache={renderedLinksCache}
            setRenderedLinksCache={setRenderedLinksCache}
          />
        );
      })}
    </g>
  );
};
