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
  const percentageValue = getPercentageFraction(node);

  return (
    <g>
      <text {...textProps} fontSize="12" fontWeight="600" fill="currentColor">
        {/* Node name on first line */}
        <tspan x={textProps.x} dy="0" fontWeight="bold">
          {text}
        </tspan>

        {/* Value on second line */}
        <tspan x={textProps.x} dy="1.2em" fontSize="10" opacity="0.7">
          {isNaN(+percentageValue) || percentageValue === 'Infinity'
            ? `${node.value?.toLocaleString()}`
            : `${percentageValue}% (${node.value?.toLocaleString()})`}
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

const getTextProps = (node: Required<RectNode>, width: number) => {
  // Determine if this is a root/source node (has no incoming links)
  const isRootNode = node.targetLinks.length === 0;

  // Position root nodes' labels on the left, all others on the right
  const position: 'left' | 'right' = isRootNode ? 'left' : 'right';

  // Calculate position based on the determined side
  const x = position === 'right' ? node.x1 + 6 : node.x0 - 6;
  const textAnchor = position === 'right' ? 'start' : 'end';
  const y = (node.y1 + node.y0) / 2;
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
