import { format } from 'd3-format';
import { sankey, sankeyCenter, SankeyLayout } from 'd3-sankey';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { SankeyData, SankeyDataLink, SankeyDataNode } from './data';
import { PathLink } from './SankyLink';
import { RectNode } from './SankyRect';

const d3Color = scaleOrdinal(schemeCategory10);

export const colorRectFunc = (dataPoint: RectNode) => d3Color(dataPoint.name);

export const colorLinkFunc = (dataPoint: PathLink) => {
  const name =
    typeof dataPoint.target === 'object'
      ? (dataPoint.target as RectNode).name
      : dataPoint.target;

  return d3Color(name);
};

const d3format = format(',.0f');

export const formatRectTitleFunc = (dataPoint: RectNode) => {
  if (!dataPoint.value) return dataPoint.name;

  return `${dataPoint.name}\n${d3format(dataPoint.value)}`;
};

export const formatLinkTitleFunc = ({
  source,
  target,
  value,
}: PathLink): string => {
  const sourceName =
    typeof source === 'object' ? (source as RectNode).name : source;
  const targetName =
    typeof target === 'object' ? (target as RectNode).name : target;

  return `${sourceName} → ${targetName}\n${d3format(value)}`;
};

interface MakeSankeyInput {
  width: number;
  height: number;
}

const linkComparator = (a: SankeyDataLink, b: SankeyDataLink) => {
  // Sort smaller values to the extremes (sides) and larger values to the middle
  const midValue = 5000; // Adjust this threshold as needed based on your data

  const diffA = Math.abs(a.value - midValue);
  const diffB = Math.abs(b.value - midValue);

  // Place links with values closer to the middle threshold at the center
  if (diffA < diffB) return 1; // Move larger values to the middle
  if (diffA > diffB) return -1; // Move smaller values to the sides
  return 0;
};

export const makeSankeyFunc = ({
  width,
  height,
}: MakeSankeyInput): SankeyLayout<
  SankeyData,
  SankeyDataNode,
  SankeyDataLink
> => {
  const sankeyGen = sankey<SankeyDataNode, SankeyDataLink>()
    .nodeId((d) => d.name)
    .nodeWidth(15)
    .nodePadding(10)
    .nodeAlign(sankeyCenter)
    .extent([
      [1, 5],
      [width - 1, height - 5],
    ])
    .linkSort(linkComparator);

  return sankeyGen;
};
