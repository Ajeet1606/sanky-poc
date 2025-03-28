'use client';

import { Sankey } from '@/components/newSanky';
import SankeyDiagram from '@/components/sanky/SankyChart';

export default function Home() {
  return (
    <div className="mb-10 flex flex-col items-center gap-28">
      <SankeyDiagram />

      <div className="w-3/4 p-4">
        <Sankey />
      </div>
    </div>
  );
}
