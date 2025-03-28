export interface SankeyDataLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyDataNode {
  name: string;
}

export interface SankeyData {
  nodes: SankeyDataNode[];
  links: SankeyDataLink[];
}

function extractSankeyData(data: any): SankeyData {
  const nodesSet = new Set<string>();
  const links: SankeyDataLink[] = [];

  function traverse(obj: any, parentKey: string | null = null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Split the key to get the individual node names
        const keyParts = key.split('.');
        const currentNode = keyParts[keyParts.length - 1];
        const parentNode =
          keyParts.length > 1 ? keyParts[keyParts.length - 2] : parentKey;

        // Add current node to the set
        nodesSet.add(currentNode);

        // Create a link if there's a parent
        if (parentNode && parentNode !== currentNode) {
          links.push({
            source: parentNode,
            target: currentNode,
            value: obj[key],
          });
        }

        // Continue if value is an object, otherwise it's a leaf
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], currentNode);
        }
      }
    }
  }

  traverse(data);

  // Convert nodesSet to an array of objects
  const nodes = Array.from(nodesSet).map((name) => ({ name }));

  return { nodes, links };
}

// Example usage
const data = {
  nodes: {
    Traces: 10534,
    'Traces.Completed': 8500,
    'Traces.Error': 1030,
    'Traces.Abandoned': 1004,
    'Traces.Completed.Met SLA': 8000,
    'Traces.Completed.Not Met SLA': 2500,
  },
};

export const sankeyData = extractSankeyData(data.nodes);

export const chartdata = {
  links: [
    {
      source: "Agricultural 'waste'",
      target: 'Bio-conversion',
      value: 124.729,
    },
    {
      source: 'Bio-conversion',
      target: 'Liquid',
      value: 0.597,
    },
    {
      source: 'Bio-conversion',
      target: 'Losses',
      value: 26.862,
    },
    {
      source: 'Bio-conversion',
      target: 'Solid',
      value: 280.322,
    },
    {
      source: 'Bio-conversion',
      target: 'Gas',
      value: 81.144,
    },
    {
      source: 'Biofuel imports',
      target: 'Liquid',
      value: 35,
    },
    {
      source: 'Biomass imports',
      target: 'Solid',
      value: 35,
    },
    {
      source: 'Coal imports',
      target: 'Coal',
      value: 11.606,
    },
    {
      source: 'Coal',
      target: 'Solid',
      value: 75.571,
    },
    {
      source: 'Coal reserves',
      target: 'Coal',
      value: 63.965,
    },
    {
      source: 'District heating',
      target: 'Industry',
      value: 10.639,
    },
    {
      source: 'District heating',
      target: 'Heating and cooling - commercial',
      value: 22.505,
    },
    {
      source: 'Electricity grid',
      target: 'Over generation / exports',
      value: 104.453,
    },
    {
      source: 'Electricity grid',
      target: 'H2 conversion',
      value: 27.14,
    },
    {
      source: 'Gas imports',
      target: 'Ngas',
      value: 40.719,
    },
    {
      source: 'Gas',
      target: 'Losses',
      value: 1.401,
    },
    {
      source: 'H2 conversion',
      target: 'H2',
      value: 20.897,
    },
    {
      source: 'Hydro',
      target: 'Electricity grid',
      value: 6.995,
    },
    {
      source: 'Liquid',
      target: 'Domestic aviation',
      value: 14.458,
    },
  ],
  nodes: [
    {
      name: "Agricultural 'waste'",
      category: 'Agricultural',
    },
    {
      name: 'Bio-conversion',
      category: 'Bio-conversion',
    },
    {
      name: 'Liquid',
      category: 'Liquid',
    },
    {
      name: 'Losses',
      category: 'Losses',
    },
    {
      name: 'Solid',
      category: 'Solid',
    },
    {
      name: 'Gas',
      category: 'Gas',
    },
    {
      name: 'Biofuel imports',
      category: 'Biofuel',
    },
    {
      name: 'Biomass imports',
      category: 'Biomass',
    },
    {
      name: 'Coal imports',
      category: 'Coal',
    },
    {
      name: 'Coal',
      category: 'Coal',
    },

    {
      name: 'Coal reserves',
      category: 'Coal',
    },
    {
      name: 'District heating',
      category: 'District',
    },
    {
      name: 'Industry',
      category: 'Industry',
    },
    {
      name: 'H2 conversion',
      category: 'H2',
    },
    {
      name: 'Gas imports',
      category: 'Gas',
    },
    {
      name: 'H2',
      category: 'H2',
    },
    {
      name: 'Hydro',
      category: 'Hydro',
    },
    {
      name: 'Heating and cooling - commercial',
      category: 'Heating',
    },
    {
      name: 'Electricity grid',
      category: 'Electricity',
    },
    {
      name: 'Over generation / exports',
      category: 'Over',
    },
    {
      name: 'Domestic aviation',
      category: 'Domestic',
    },
    {
      name: 'Ngas',
      category: 'Ngas',
    },
  ],
};
