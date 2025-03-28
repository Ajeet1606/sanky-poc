import React, { JSX } from 'react';

import { RectNode } from './SankyRect';

interface SankeyLabelProps {
  x: number;
  y: number;
  dy: string;
  textAnchor?: 'start' | 'middle' | 'end';
  text: string;
  node: RectNode;
}

const getPercentageFraction = (node: RectNode) => {
  const currentValue = node.value ?? 0;
  const parentValue =
    node.targetLinks?.reduce(
      (acc, cur) => acc + ((cur.source as any)?.value ?? 0),
      0
    ) ?? 0;

  //calculate % of parent value
  const percentage = (currentValue / parentValue) * 100;
  return percentage.toFixed(2);
};

export const SankeyLabel = ({
  text,
  node,
  ...textProps
}: SankeyLabelProps): JSX.Element => {
  return (
    <g>
      <text {...textProps} fontSize="12" fontWeight="600" fill="currentColor">
        {/* Node name on first line */}
        <tspan x={textProps.x} dy="0" fontWeight="bold">
          {text}
        </tspan>

        {/* Value on second line */}
        <tspan x={textProps.x} dy="1.2em" fontSize="10" opacity="0.7">
          {`${getPercentageFraction(node)}% (${node.value?.toLocaleString()})`}
        </tspan>
      </text>
    </g>
  );
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

        return (
          <SankeyLabel
            {...textProps}
            text={node.name}
            key={node.name}
            node={node}
          />
        );
      })}
    </g>
  );
};
