import React, { JSX, useEffect, useMemo, useState } from 'react';
import {
  chartdata,
  markVisibleNodesAndLinks,
  SankeyData,
  sankeyData,
} from '@/constants/data';
import { useMeasure, useSetState } from 'react-use';

import {
  colorLinkFunc,
  colorRectFunc,
  formatLinkTitleFunc,
  formatRectTitleFunc,
  makeSankeyFunc,
} from './parse';
import { SankeyLabels } from './SankeyLabel';
import { SankeyLinks } from './SankyLink';
import { SankeyRects } from './SankyRect';

interface SankeyChartProps {
  width: number;
  height: number;
}

export const SankeyChart = ({
  width,
  height,
}: SankeyChartProps): JSX.Element | null => {
  const [data, setData] = useState<SankeyData | null>(sankeyData);
  const [visibleData, setVisibleData] = useState<SankeyData>();
  console.log('data', data, visibleData);

  useEffect(() => {
    if (!data) return;
    const visibleData = markVisibleNodesAndLinks('traces');
    setVisibleData(visibleData);
  }, [data]);

  const sankeyGen = useMemo(
    () =>
      makeSankeyFunc({
        width,
        height,
      }),
    [width, height]
  );

  const sankeyResult = useMemo(() => {
    if (!visibleData) return null;

    return sankeyGen(visibleData);
  }, [visibleData, sankeyGen]);

  if (!visibleData || !sankeyResult) return null;

  const { nodes, links } = sankeyResult;
  // Calculate dynamic height based on number of nodes
  // const dynamicHeight = Math.max(nodes.length * 10, height); // 40px per node
  return (
    <>
      <svg width={width} height={height}>
        <SankeyRects
          nodes={nodes}
          colorFunc={colorRectFunc}
          titleFunc={formatRectTitleFunc}
          links={links}
          setVisibleData={setVisibleData}
        />
        <SankeyLinks
          links={links}
          colorFunc={colorLinkFunc}
          titleFunc={formatLinkTitleFunc}
        />
        <SankeyLabels nodes={nodes} width={width} />
      </svg>
      <div
        id="tooltip"
        className="pointer-events-none absolute rounded border bg-white p-2 text-sm shadow-lg"
        style={{
          opacity: 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      ></div>
    </>
  );
};

export const Sankey = (): JSX.Element => {
  const [ref, measurements] = useMeasure<HTMLDivElement>();
  const { width } = measurements;
  // Set default height to 300px if width is not available
  const height = width > 0 ? width * 0.6 : 300; // Maintain aspect ratio

  return (
    // ResizeObserver doesn't work directly on <svg/>
    <div ref={ref}>
      {width > 0 && <SankeyChart width={width} height={height} />}
    </div>
  );
};
