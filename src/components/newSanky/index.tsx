import React, { JSX, useEffect, useMemo, useState } from 'react';
import {
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
  // Keep track of links that have already been rendered
  const [renderedLinksCache, setRenderedLinksCache] = useState(
    new Set<string>()
  );

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
  return (
    <>
      <svg width={width} height={height} style={{ margin: '0 20' }}>
        <SankeyRects
          nodes={nodes}
          colorFunc={colorRectFunc}
          titleFunc={formatRectTitleFunc}
          links={links}
          visibleData={visibleData}
          setVisibleData={setVisibleData}
          setRenderedLinksCache={setRenderedLinksCache}
        />
        <SankeyLinks
          links={links}
          colorFunc={colorLinkFunc}
          titleFunc={formatLinkTitleFunc}
          renderedLinksCache={renderedLinksCache}
          setRenderedLinksCache={setRenderedLinksCache}
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
