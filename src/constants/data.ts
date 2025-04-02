export interface SankeyDataLink {
  source: SankeyDataNode;
  target: SankeyDataNode;
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

// this function is called in two sceanrios:
// - initial render: to mark first 2 levels as visible (root and its children): for expantion
// - when a node is clicked.: to mark its children and links as visible: for expantion
export function markVisibleNodesAndLinks(rootName: string): SankeyData {
  console.log('expand...', rootName);

  const { nodes, links } = sankeyData;

  // Mark root node as visible: for initial render only.
  const rootNode = nodes.find(
    (node) => node.name.toLowerCase() === rootName.toLowerCase()
  );
  if (rootNode) {
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
    const sourceNode = nodes.find((node) => node.name === link.source.name);
    const targetNode = nodes.find((node) => node.name === link.target.name);
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
  console.log('collapse...', nodeName);

  const { nodes, links } = sankeyData;

  // Mark children of root as visible false
  const childNodes = getAllChildNodesInHierarchy(nodeName, nodes);

  childNodes.forEach((node) => {
    node.isVisible = false;
  });

  // Mark links originating from this node as false.
  links.forEach((link) => {
    const sourceNode = nodes.find((node) => node.name === link.source.name);
    if (
      childNodes.some((node) => node.name === sourceNode?.name) ||
      sourceNode?.name === nodeName
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

function getAllChildNodesInHierarchy(
  nodeName: string,
  nodes: SankeyDataNode[]
): SankeyDataNode[] {
  const childNodes: SankeyDataNode[] = [];
  const childNodesOfNode = nodes.filter(
    (node) =>
      node.parent?.toLowerCase() === nodeName.toLowerCase() && node.isVisible
  );
  childNodesOfNode.forEach((node) => {
    childNodes.push(node);
    childNodes.push(...getAllChildNodesInHierarchy(node.name, nodes));
  });
  return childNodes;
}

function extractSankeyData(data: any): SankeyData {
  const nodesMap = new Map<string, SankeyDataNode>(); // Map for unique nodes
  const links: SankeyDataLink[] = [];

  function traverse(obj: any, parentKey: string | null = null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Split the key to handle hierarchy
        const keyParts = key.split('.');
        const currentNodeName = keyParts[keyParts.length - 1]; // Get the leaf node
        const parentNode =
          keyParts.length > 1 ? keyParts[keyParts.length - 2] : parentKey; // Get immediate parent

        // Add current node to the map with parent
        if (!nodesMap.has(currentNodeName)) {
          nodesMap.set(currentNodeName, {
            name: currentNodeName,
            parent: parentNode ?? null,
            isVisible: false,
          });
        }

        // Create a link if there's a valid parent and it's not a duplicate
        if (parentNode && parentNode !== currentNodeName) {
          links.push({
            source: nodesMap.get(parentNode)!, // Safe to assume node exists
            target: nodesMap.get(currentNodeName)!, // Safe to assume node exists
            value: obj[key],
            isVisible: false,
          });
        }

        // Continue recursion if value is an object, otherwise stop
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], currentNodeName);
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
    'Traces.Completed.Not Met SLA.Doable': 300,
    'Traces.Completed.Not Met SLA.Not Doable': 200,
  },
};

export const sankeyData = extractSankeyData(data.nodes);
