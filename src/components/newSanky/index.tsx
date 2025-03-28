import React, { JSX, useEffect, useMemo, useState } from 'react';
import { chartdata, sankeyData } from '@/constants/data';
import { useMeasure } from 'react-use';

import { getData, SankeyData } from './data';
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

  // useEffect(() => {
  //   getData().then(setData);
  // }, []);

  const sankeyGen = useMemo(
    () =>
      makeSankeyFunc({
        width,
        height,
      }),
    [width, height]
  );

  const sankeyResult = useMemo(() => {
    if (!data) return null;

    return sankeyGen(data);
  }, [data, sankeyGen]);

  if (!data || !sankeyResult) return null;

  const { nodes, links } = sankeyResult;
  return (
    <>
      <svg width={width} height={height}>
        <SankeyRects
          nodes={nodes}
          colorFunc={colorRectFunc}
          titleFunc={formatRectTitleFunc}
          links={links}
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

  return (
    // ResizeObserver doesn't work directly on <svg/>
    <div ref={ref}>
      {width > 0 && <SankeyChart width={width} height={200} />}
    </div>
  );
};
