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

const makeDPath = sankeyLinkHorizontal<SankeyDataNode, SankeyDataLink>();

const renderedLinksCache = new Set<string>();
interface SankeyLinkProps {
  d: string;
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
  d,
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
  }, [d, linkKey]);

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
        d={d}
        stroke={`url(#linkGradient-${uuid})`}
        // stroke={color}
        strokeWidth={strokeWidth}
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
    <g fill="none" strokeOpacity={0.5}>
      {links.map((link) => {
        const d = makeDPath(link);

        if (!d) return null;

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
            d={d}
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
