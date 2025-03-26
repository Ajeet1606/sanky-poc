'use client';

import { Sankey } from '@/components/newSanky';
import SankeyDiagram from '@/components/sanky/SankyChart';

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <SankeyDiagram />

      <div className="w-full p-4">
        <Sankey />
      </div>
    </div>
  );
}
