'use client';

import { Sankey } from '@/components/newSanky';

export default function Home() {
  return (
    <div className="mb-10 ml-10 flex flex-col items-center gap-28">
      <div className="mt-20 w-full p-4">
        <Sankey />
      </div>
    </div>
  );
}
