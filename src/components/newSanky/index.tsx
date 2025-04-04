import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
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
  initializeColorScale,
  makeSankeyFunc,
} from './parse';
import { SankeyLabels } from './SankeyLabel';
import { SankeyLinks } from './SankyLink';
import { SankeyRects } from './SankyRect';

interface SankeyChartProps {
  width: number;
  height: number;
  renderedLinksCache: Set<string>;
  setRenderedLinksCache: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const SankeyChart = ({
  width: containerWidth,
  height: containerHeight,
  renderedLinksCache,
  setRenderedLinksCache,
}: SankeyChartProps): JSX.Element | null => {
  const [data, setData] = useState<SankeyData | null>(sankeyData);
  const [visibleData, setVisibleData] = useState<SankeyData>();

  const padding = { left: 100, right: 100, top: 20, bottom: 20 };
  // Calculate the actual chart dimensions (subtracting padding)
  const width = containerWidth - padding.left - padding.right;
  const height = containerHeight - padding.top - padding.bottom;

  useEffect(() => {
    if (!data) return;
    const visibleData = markVisibleNodesAndLinks('traces');
    setVisibleData(visibleData);
    initializeColorScale(data);
  }, [data]);

  const sankeyGen = useMemo(
    () =>
      makeSankeyFunc({
        width,
        height,
      }),
    [containerWidth, containerHeight]
  );

  const sankeyResult = useMemo(() => {
    if (!visibleData) return null;

    return sankeyGen(visibleData);
  }, [visibleData, sankeyGen]);

  if (!visibleData || !sankeyResult) return null;

  const { nodes, links } = sankeyResult;

  return (
    <>
      <svg width={containerWidth} height={containerHeight}>
        <g transform={`translate(${padding.left}, ${padding.top})`}>
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
        </g>
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
  // Keep track of links that have already been rendered
  const [renderedLinksCache, setRenderedLinksCache] = useState(
    new Set<string>()
  );
  console.log('renderedLinksCache', renderedLinksCache);

  const { width } = measurements;
  // Set default height to 300px if width is not available
  const height = width > 0 ? width * 0.6 : 300; // Maintain aspect ratio

  // useEffect(() => {
  //   setRenderedLinksCache(new Set<string>());
  // }, [width]);

  return (
    // ResizeObserver doesn't work directly on <svg/>
    <div ref={ref}>
      {width > 0 && (
        <SankeyChart
          width={width}
          height={height}
          renderedLinksCache={renderedLinksCache}
          setRenderedLinksCache={setRenderedLinksCache}
        />
      )}
    </div>
  );
};
