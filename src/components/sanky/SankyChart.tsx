import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyCenter } from 'd3-sankey';

interface Node {
  name: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

interface Link {
  source: number | Node;
  target: number | Node;
  value: number;
  width?: number;
}

interface SankeyData {
  nodes: Node[];
  links: Link[];
}

const SankeyDiagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Ensure we're in a browser environment
    if (!svgRef.current) return;

    // Sample data for the Sankey diagram
    const data: SankeyData = {
      nodes: [
        { name: 'Revenue' },
        { name: 'Operating Expenses' },
        { name: 'Marketing' },
        { name: 'R&D' },
        { name: 'Administrative' },
        { name: 'Net Profit' },
      ],
      links: [
        { source: 0, target: 1, value: 500 },
        { source: 1, target: 2, value: 150 },
        { source: 1, target: 3, value: 200 },
        { source: 1, target: 4, value: 150 },
        { source: 0, target: 5, value: 300 },
      ],
    };

    // Set up SVG dimensions
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create Sankey layout
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .size([width, height])
      .nodeAlign(sankeyCenter);

    // Generate the Sankey diagram
    const graph = sankeyGenerator(data as any);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a custom link path generator
    const linkGenerator = d3
      .linkHorizontal()
      .source((d: any) => [d.source.x1, (d.source.y0 + d.source.y1) / 2])
      .target((d: any) => [d.target.x0, (d.target.y0 + d.target.y1) / 2]);

    // Draw links
    const link = svg
      .append('g')
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => color(d.source.index || 0))
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: any) => Math.max(1, d.width || 0))
      // Add click event to links
      .on('click', (event, d: any) => {
        console.log('Clicked Link:', {
          source: d.source.name,
          target: d.target.name,
          value: d.value,
          width: d.width,
        });
      })
      // Add hover effects
      .on('mouseover', function () {
        d3.select(this).attr('stroke-opacity', 0.8);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.5);
      });

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .enter()
      .append('rect')
      .attr('x', (d: any) => d.x0 || 0)
      .attr('y', (d: any) => d.y0 || 0)
      .attr('height', (d: any) => Math.max(0, (d.y1 || 0) - (d.y0 || 0)))
      .attr('width', (d: any) => Math.max(0, (d.x1 || 0) - (d.x0 || 0)))
      .attr('fill', (d: any) => color(d.index || 0))
      // Add click event to nodes
      .on('click', (event, d: any) => {
        console.log('Clicked Node:', {
          name: d.name,
          index: d.index,
          value: d.value,
          x0: d.x0,
          x1: d.x1,
          y0: d.y0,
          y1: d.y1,
        });
      })
      // Add hover effects
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 0.7);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
      });

    // Add node labels
    svg
      .append('g')
      .selectAll('text')
      .data(graph.nodes)
      .enter()
      .append('text')
      .attr('x', (d: any) => ((d.x0 || 0) + (d.x1 || 0)) / 2)
      .attr('y', (d: any) => ((d.y0 || 0) + (d.y1 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.name)
      .attr('font-size', '10px')
      .attr('fill', 'black')
      // Make labels clickable with same behavior as nodes
      .on('click', (event, d: any) => {
        console.log('Clicked Node Label:', {
          name: d.name,
          index: d.index,
          value: d.value,
          x0: d.x0,
          x1: d.x1,
          y0: d.y0,
          y1: d.y1,
        });
      });
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <h2 className="mb-4 text-xl font-bold">
        Company Financial Sankey Diagram
      </h2>
      <p className="mb-2 text-sm text-gray-600">
        Click on nodes or links to see details in the console
      </p>
      <svg ref={svgRef} className="w-full cursor-pointer"></svg>
    </div>
  );
};

export default SankeyDiagram;
