import { insert, erase } from "./heap.js";
export function dijkstra(graph, start) {
    const distances = new Map();
    const distance_heap = [];
    const less = (a, b) => a.value < b.value;
    insert(distance_heap, { key: start, value: 0 }, less);
    while (distance_heap.length > 0) {
        const current = distance_heap[0];
        erase(distance_heap, 0, less);
        if (distances.has(current.key)) {
            continue;
        }
        distances.set(current.key, current.value);
        const neighbors = graph.get(current.key);
        if (!neighbors)
            continue;
        for (const [neighbor, weight] of neighbors.entries()) {
            if (distances.has(neighbor)) {
                continue;
            }
            insert(distance_heap, { key: neighbor, value: current.value + weight }, less);
        }
    }
    return distances;
}
export function detect_cycle(graph, labels, start) {
    labels.set(start, 1);
    const neighbors = graph.get(start);
    if (!neighbors)
        throw new Error(`Vertex ${start} not found in graph`);
    for (const neighbor of neighbors.keys()) {
        const label = labels.get(neighbor);
        if (label === undefined)
            throw new Error(`Vertex ${neighbor} not found in labels`);
        switch (label) {
            case 0:
                if (detect_cycle(graph, labels, neighbor))
                    return true;
                break;
            case 1:
                return true;
            case 2:
                continue;
        }
    }
    labels.set(start, 2);
    return false;
}
export function build_graph(boxes, weights, adjacency_list) {
    const start_node = "start";
    const graph = new Map();
    const orphans = new Set(boxes);
    graph.set(start_node, new Map());
    for (const box of boxes) {
        graph.set(box, new Map());
    }
    for (const { v, u } of adjacency_list) {
        if (!boxes.includes(v) || !boxes.includes(u)) {
            continue;
        }
        graph.get(v)?.set(u, weights.get(v) || 0);
        orphans.delete(u);
    }
    for (const box of orphans) {
        graph.get("start")?.set(box, 0);
    }
    return graph;
}
//# sourceMappingURL=graph_utils.js.map