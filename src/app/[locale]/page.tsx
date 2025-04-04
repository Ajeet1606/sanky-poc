'use client';

import { Sankey } from '@/components/newSanky';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-28 bg-[#021117] pb-10 pl-10">
      <div className="mt-20 w-[80%] p-4">
        <Sankey />
      </div>
    </div>
  );
}
