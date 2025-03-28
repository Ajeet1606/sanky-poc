import React, { JSX } from 'react';
import { SankeyNode } from 'd3-sankey';

import { SankeyDataLink, SankeyDataNode } from './data';

export type RectNode = SankeyNode<SankeyDataNode, SankeyDataLink>;

interface SankeyRectProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  node: RectNode;
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

export const SankeyRect = ({
  color,
  title,
  node,
  ...rectProps
}: SankeyRectProps): JSX.Element => {
  console.log(node);

  return (
    <rect
      {...rectProps}
      fill={color}
      onClick={(e) => {
        e.stopPropagation();
        console.log('node', node);
      }}
      style={{
        cursor: 'pointer',
      }}
    >
      {title && <title>{title}</title>}
    </rect>
  );
};

interface SankeyRectsProps {
  nodes: RectNode[];
  titleFunc?(node: RectNode): string;
  colorFunc?(node: RectNode): string;
}

export const SankeyRects = ({
  nodes,
  titleFunc,
  colorFunc,
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
          />
        );
      })}
    </g>
  );
};
