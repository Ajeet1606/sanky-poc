export interface SankeyDataLink {
  source: string;
  target: string;
  value: number;
  isVisible: boolean;
}

export interface SankeyDataNode {
  name: string;
  parent: string | null; // Add parent to the node
  isVisible: boolean;
}

export interface SankeyData {
  nodes: SankeyDataNode[];
  links: SankeyDataLink[];
}

export function markVisibleNodesAndLinks(rootName: string): SankeyData {
  const { nodes, links } = sankeyData;

  // Mark root node as visible
  const rootNode = nodes.find(
    (node) => node.name.toLowerCase() === rootName.toLowerCase()
  );
  if (rootNode) {
    // if (rootNode.isVisible) return collapseNode(rootName);
    rootNode.isVisible = true;
  }

  // Mark children of root as visible
  const childNodes = nodes.filter(
    (node) => node.parent?.toLowerCase() === rootName.toLowerCase()
  );
  childNodes.forEach((node) => {
    node.isVisible = true;
  });

  // Mark links connecting visible nodes as visible
  links.forEach((link) => {
    const sourceNode = nodes.find((node) => node.name === link.source);
    const targetNode = nodes.find((node) => node.name === link.target);
    if (
      sourceNode?.isVisible &&
      targetNode?.isVisible &&
      sourceNode.name.toLowerCase() === rootName.toLowerCase()
    ) {
      link.isVisible = true;
    }
  });

  // Filter and return only the visible nodes and links
  const visibleNodes = nodes.filter((node) => node.isVisible);
  const visibleLinks = links.filter((link) => link.isVisible);

  return {
    nodes: visibleNodes,
    links: visibleLinks,
  };
}

export function collapseNode(nodeName: string): SankeyData {
  const { nodes, links } = sankeyData;

  // Mark children of root as visible false
  const childNodes = nodes.filter(
    (node) => node.parent?.toLowerCase() === nodeName.toLowerCase()
  );
  childNodes.forEach((node) => {
    node.isVisible = false;
  });

  // Mark links originating from this node as false.
  links.forEach((link) => {
    const sourceNode = nodes.find((node) => node.name === link.source);
    if (
      sourceNode?.name.toLowerCase() === nodeName.toLowerCase() &&
      sourceNode?.isVisible
    ) {
      link.isVisible = false;
    }
  });

  // Filter and return only the visible nodes and links
  const visibleNodes = nodes.filter((node) => node.isVisible);
  const visibleLinks = links.filter((link) => link.isVisible);

  return {
    nodes: visibleNodes,
    links: visibleLinks,
  };
}

function extractSankeyData(data: any): SankeyData {
  const nodesMap = new Map<string, SankeyDataNode>(); // Map for unique nodes
  const links: SankeyDataLink[] = [];

  function traverse(obj: any, parentKey: string | null = null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Split the key to handle hierarchy
        const keyParts = key.split('.');
        const currentNode = keyParts[keyParts.length - 1]; // Get the leaf node
        const parentNode =
          keyParts.length > 1 ? keyParts[keyParts.length - 2] : parentKey; // Get immediate parent

        // Add current node to the map with parent
        if (!nodesMap.has(currentNode)) {
          nodesMap.set(currentNode, {
            name: currentNode,
            parent: parentNode ?? null,
            isVisible: false,
          });
        }

        // Create a link if there's a valid parent and it's not a duplicate
        if (parentNode && parentNode !== currentNode) {
          links.push({
            source: parentNode,
            target: currentNode,
            value: obj[key],
            isVisible: false,
          });
        }

        // Continue recursion if value is an object, otherwise stop
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], currentNode);
        }
      }
    }
  }

  traverse(data);

  // Convert nodesMap to an array of objects
  const nodes = Array.from(nodesMap.values());

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
    'Traces.Completed.Not Met SLA': 500,
    'Traces.Error.Timeout': 530,
    'Traces.Error.Internal Error': 500,
    'Traces.Abandoned.User Cancellation': 600,
    'Traces.Abandoned.Connection Lost': 404,
    'Traces.Completed.Met SLA.High Priority': 5000,
    'Traces.Completed.Met SLA.Low Priority': 3000,
    'Traces.Completed.Not Met SLA.High Priority': 300,
    'Traces.Completed.Not Met SLA.Low Priority': 200,
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
