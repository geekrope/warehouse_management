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
export function build_graph(boxes, weights, adjacency_list) {
    const start_node = "start";
    const graph = new Map();
    const orphans = new Set(boxes);
    graph.set(start_node, new Map());
    for (const box of boxes) {
        graph.set(box, new Map());
    }
    for (const [box, neighbor] of Object.entries(adjacency_list)) {
        const box_num = parseInt(box);
        if (!boxes.includes(box_num) || !boxes.includes(neighbor)) {
            continue;
        }
        graph.get(box_num)?.set(neighbor, weights.get(box_num) || 0);
        orphans.delete(neighbor);
    }
    for (const box of orphans) {
        graph.get("start")?.set(box, 0);
    }
    return graph;
}
//# sourceMappingURL=graph_utils.js.map