import React, { JSX } from 'react';
import * as d3 from 'd3';
import {
  sankeyLinkHorizontal,
  SankeyLink as SankeyLinkType,
  SankeyNodeMinimal,
} from 'd3-sankey';

import { SankeyDataLink, SankeyDataNode } from './data';
import { RectNode } from './SankyRect';

export type PathLink = SankeyLinkType<SankeyDataNode, SankeyDataLink>;

const makeDPath = sankeyLinkHorizontal<SankeyDataNode, SankeyDataLink>();

interface SankeyLinkProps {
  d: string;
  strokeWidth?: number;
  color?: string;
  title?: string;
  source?: string;
  target?: string;
  link: PathLink;
}

export const SankeyLink = ({
  d,
  color,
  strokeWidth,
  title,
  source,
  target,
  link,
}: SankeyLinkProps): JSX.Element => {
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        id={`path-link-${(link.source as SankeyDataNode & SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>).index}-${(link.target as SankeyDataNode & SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>).index}`}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('link', link);
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
      >
        {/* check if we need this */}
        {title && <title>{title}</title>}
      </path>
    </g>
  );
};

interface SankeyLinksProps {
  links: PathLink[];
  titleFunc?(link: PathLink): string;
  colorFunc?(link: PathLink): string;
}

export const SankeyLinks = ({
  links,
  titleFunc,
  colorFunc,
}: SankeyLinksProps): JSX.Element => {
  console.log(links);

  return (
    <g fill="none" strokeOpacity={0.5}>
      {links.map((link) => {
        console.log('link in links', link);

        const d = makeDPath(link);

        if (!d) return null;

        const strokeWidth = Math.max(1, link.width || 0);
        const { source, target } = link;
        const sourceName =
          typeof source === 'object' ? (source as RectNode).name : source;
        const targetName =
          typeof target === 'object' ? (target as RectNode).name : target;
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
          />
        );
      })}
    </g>
  );
};
