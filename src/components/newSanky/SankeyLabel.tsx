import React, { JSX } from 'react';

import { RectNode } from './SankyRect';

interface SankeyLabelProps {
  x: number;
  y: number;
  dy: string;
  textAnchor?: 'start' | 'middle' | 'end';
  text: string;
}

export const SankeyLabel = ({
  text,
  ...textProps
}: SankeyLabelProps): JSX.Element => {
  return <text {...textProps}>{text}</text>;
};

const isFullRectNode = (node: RectNode): node is Required<RectNode> => {
  return (
    node.x0 !== undefined &&
    node.x1 !== undefined &&
    node.y0 !== undefined &&
    node.y1 !== undefined
  );
};

const getTextProps = (
  { x0, x1, y0, y1 }: Required<RectNode>,
  width: number
) => {
  const x = x0 < width / 2 ? x1 + 6 : x0 - 6;
  const y = (y1 + y0) / 2;

  const textAnchor = x0 < width / 2 ? 'start' : 'end';

  return {
    x,
    y,
    textAnchor,
    dy: '0.35em',
  } as const;
};

interface SankeyLabelsProps {
  nodes: RectNode[];
  width: number;
}

export const SankeyLabels = ({
  nodes,
  width,
}: SankeyLabelsProps): JSX.Element => {
  return (
    <g style={{ fontSize: 10 }}>
      {nodes.map((node) => {
        if (!isFullRectNode(node)) return null;
        const textProps = getTextProps(node, width);

        return <SankeyLabel {...textProps} text={node.name} key={node.name} />;
      })}
    </g>
  );
};
