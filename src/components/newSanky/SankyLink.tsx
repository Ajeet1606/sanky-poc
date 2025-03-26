import React, { JSX } from 'react';
import { sankeyLinkHorizontal, SankeyLink as SankeyLinkType } from 'd3-sankey';

import { SankeyDataLink, SankeyDataNode } from './data';
import { RectNode } from './SankyRect';

export type PathLink = SankeyLinkType<SankeyDataNode, SankeyDataLink>;

const makeDPath = sankeyLinkHorizontal<SankeyDataNode, SankeyDataLink>();

interface SankeyLinkProps {
  d: string;
  strokeWidth?: number;
  color?: string;
  title?: string;
}

export const SankeyLink = ({
  d,
  color,
  strokeWidth,
  title,
}: SankeyLinkProps): JSX.Element => {
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      <path d={d} stroke={color} strokeWidth={strokeWidth}>
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
  return (
    <g fill="none" strokeOpacity={0.5}>
      {links.map((link) => {
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
          />
        );
      })}
    </g>
  );
};
