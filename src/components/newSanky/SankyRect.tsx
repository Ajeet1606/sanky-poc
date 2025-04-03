import React, { JSX } from 'react';
import {
  collapseNode,
  markVisibleNodesAndLinks,
  SankeyData,
  SankeyDataLink,
  SankeyDataNode,
} from '@/constants/data';
import * as d3 from 'd3';
import { SankeyNode, SankeyNodeMinimal } from 'd3-sankey';

import { PathLink } from './SankyLink';

export type RectNode = SankeyNode<SankeyDataNode, SankeyDataLink>;

interface SankeyRectProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  node: RectNode;
  links: PathLink[];
  visibleData: SankeyData;
  setVisibleData: React.Dispatch<React.SetStateAction<SankeyData | undefined>>;
  setRenderedLinksCache: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const getCoordinates = (node: RectNode) => {
  const { x0, x1, y0, y1 } = node;
  const width = x0 !== undefined && x1 !== undefined ? x1 - x0 : undefined;
  const height = y0 !== undefined && y1 !== undefined ? y1 - y0 : undefined;

  return {
    x: x0,
    y: y0,
    width,
    height,
  };
};

const highlightLink = (
  node: RectNode,
  links: PathLink[],
  highlight: boolean
) => {
  if (!node || !links) return;

  const nodeIndex = node.index;
  const connectedLinks = links.filter((link) => {
    const sourceIndex = (
      link.source as SankeyDataNode &
        SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>
    ).index;
    const targetIndex = (
      link.target as SankeyDataNode &
        SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>
    ).index;

    return sourceIndex === nodeIndex || targetIndex === nodeIndex;
  });

  connectedLinks.forEach((link) => {
    const sourceIndex = (
      link.source as SankeyDataNode &
        SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>
    ).index;
    const targetIndex = (
      link.target as SankeyDataNode &
        SankeyNodeMinimal<SankeyDataNode, SankeyDataLink>
    ).index;

    const linkId = `path-link-${sourceIndex}-${targetIndex}`;
    const linkElement = document.getElementById(linkId);

    if (linkElement) {
      linkElement.style.strokeOpacity = highlight ? '1' : '0.5';
    }
  });
};

export const SankeyRect = ({
  color,
  title,
  node,
  links,
  visibleData,
  setVisibleData,
  setRenderedLinksCache,
  ...rectProps
}: SankeyRectProps): JSX.Element => {
  return (
    <rect
      rx="4"
      {...rectProps}
      fill={color}
      onClick={(e) => {
        e.stopPropagation();
        if (node.name === 'Traces') return;
        const isNotALeafNode = visibleData.links.some(
          (link) => link.source.name === node.name
        );

        const updatedVisibleData = isNotALeafNode
          ? collapseNode(node.name, setRenderedLinksCache)
          : markVisibleNodesAndLinks(node.name);
        setVisibleData(updatedVisibleData);
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = '1';
        highlightLink(node, links, true);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = '0.8';
        highlightLink(node, links, false);
      }}
      style={{
        cursor: 'pointer',
        opacity: 0.8,
      }}
    >
      {title && <title>{title}</title>}
    </rect>
  );
};

interface SankeyRectsProps {
  nodes: RectNode[];
  links: SankeyDataLink[];
  titleFunc?(node: RectNode): string;
  colorFunc?(node: RectNode): string;
  visibleData: SankeyData;
  setVisibleData: React.Dispatch<React.SetStateAction<SankeyData | undefined>>;
  setRenderedLinksCache: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const SankeyRects = ({
  nodes,
  links,
  titleFunc,
  colorFunc,
  visibleData,
  setVisibleData,
  setRenderedLinksCache,
}: SankeyRectsProps): JSX.Element => {
  return (
    <g stroke="#000">
      {nodes.map((node) => {
        const coords = getCoordinates(node);
        return (
          <SankeyRect
            {...coords}
            key={node.name}
            color={colorFunc?.(node)}
            title={titleFunc?.(node)}
            node={node}
            links={links}
            visibleData={visibleData}
            setVisibleData={setVisibleData}
            setRenderedLinksCache={setRenderedLinksCache}
          />
        );
      })}
    </g>
  );
};
