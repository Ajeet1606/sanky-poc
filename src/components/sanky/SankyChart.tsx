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
  // Sample data for the Sankey diagram
  const data: SankeyData = {
    nodes: [
      { name: 'Traces' },
      { name: 'Error' },
      { name: 'Completed' },
      { name: 'Abandoned' },
      { name: 'Met SLA' },
      { name: 'Didnt Met SLA' },
    ],
    links: [
      { source: 0, target: 1, value: 10 },
      { source: 0, target: 2, value: 40 },
      { source: 0, target: 3, value: 20 },
      { source: 2, target: 4, value: 70 },
      { source: 2, target: 5, value: 30 },
    ],
  };
  // Set up SVG dimensions
  const margin = { top: 10, right: 50, bottom: 10, left: 10 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const drawSankeyDiagram = () => {
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
    // Create a color scale to assign a color to each node
    // The color scale is an ordinal scale that will assign a color
    // to each node based on its index in the nodes array
    // The color palette is a standard categorical color scheme
    // provided by D3 (https://github.com/d3/d3-scale-chromatic#schemeCategory10)
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Custom link path generator
    // This function will generate the path for each link
    // The link path is a horizontal line that connects the
    // source node to the target node
    // The x-coordinate of the source node is the x0 of the link
    // The y-coordinate of the source node is the midpoint of y0 and y1
    // The x-coordinate of the target node is the x1 of the link
    // The y-coordinate of the target node is the midpoint of y0 and y1
    const linkGenerator = d3
      .linkHorizontal()
      .source((d: any) => [d.source.x1, (d.source.y0 + d.source.y1) / 2])
      .target((d: any) => [d.target.x0, (d.target.y0 + d.target.y1) / 2]);

    // Draw links
    // The links are horizontal lines that connect the source node
    // to the target node. The x-coordinate of the source node is
    // the x0 of the link, the y-coordinate of the source node is
    // the midpoint of y0 and y1, the x-coordinate of the target node
    // is the x1 of the link, and the y-coordinate of the target node
    // is the midpoint of y0 and y1
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
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('stroke-opacity', 0.8);
        const tooltip = d3.select('#tooltip');
        const tooltipWidth = 120; // Approx width of tooltip
        const xPos = event.pageX + 10;
        const yPos = event.pageY - 28;

        tooltip
          .style(
            'left',
            `${Math.min(xPos, window.innerWidth - tooltipWidth)}px`
          )
          .style('top', `${Math.max(10, yPos)}px`)
          .style('opacity', 1)
          .html(`${d.source.name} → ${d.target.name} : ${d.value}`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.5);
        // Hide tooltip
        d3.select('#tooltip').style('opacity', 0);
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
      .attr('x', (d: any) => d.x1 + 6)
      .attr('y', (d: any) => (d.y0 || 0) + ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr('text-anchor', 'start')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.name)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
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

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    legend
      .selectAll('rect')
      .data(data.nodes)
      .enter()
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('y', (d, i) => i * 15)
      .attr('fill', (d: any) => color(d.index || 0));

    legend
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('x', 15)
      .attr('y', (d, i) => i * 15 + 9)
      .text((d) => d.name)
      .attr('font-size', '10px')
      .attr('fill', '#333');
  };
  useEffect(() => {
    // Ensure we're in a browser environment
    if (!svgRef.current) return;

    drawSankeyDiagram();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Redraw the diagram on resize
      drawSankeyDiagram();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="mx-20 w-screen max-w-2xl p-4">
      <h2 className="mb-4 text-xl font-bold">Sankey Diagram</h2>

      <svg ref={svgRef} className="w-full cursor-pointer"></svg>

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
    </div>
  );
};

export default SankeyDiagram;
