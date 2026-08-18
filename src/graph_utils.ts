import { insert, erase } from "./heap.js";

export function dijkstra<T>(graph: Map<T, Map<T, number>>, start: T): Map<T, number> {
    const distances = new Map<T, number>();
    const distance_heap: { key: T, value: number }[] = [];
    const less = (a: { key: T, value: number }, b: { key: T, value: number }) => a.value < b.value;

    insert(distance_heap, { key: start, value: 0 }, less);

    while (distance_heap.length > 0) {
        const current = distance_heap[0];
        erase(distance_heap, 0, less);

        if (distances.has(current.key)) { continue; }
        distances.set(current.key, current.value);

        const neighbors = graph.get(current.key);
        if (!neighbors) continue;

        for (const [neighbor, weight] of neighbors.entries()) {
            if (distances.has(neighbor)) { continue; }
            insert(distance_heap, { key: neighbor, value: current.value + weight }, less);
        }
    }

    return distances;
}

export function detect_cycle<T>(graph: Map<T, Map<T, number>>, labels: Map<T, number>, start: T): boolean {
    labels.set(start, 1);

    const neighbors = graph.get(start);
    if (!neighbors) throw new Error(`Vertex ${start} not found in graph`);

    for (const neighbor of neighbors.keys()) {
        const label = labels.get(neighbor);

        if (label === undefined) throw new Error(`Vertex ${neighbor} not found in labels`);

        switch (label) {
            case 0:
                if (detect_cycle(graph, labels, neighbor)) return true;
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

export type AdjacencyList = Record<string, number>;

type Vertex = number | "start";

export function build_graph(boxes: number[], weights: Map<number, number>, adjacency_list: AdjacencyList): Map<Vertex, Map<Vertex, number>> {
    const start_node: Vertex = "start";
    const graph = new Map<Vertex, Map<Vertex, number>>();
    const orphans: Set<number> = new Set(boxes);

    graph.set(start_node, new Map<Vertex, number>());

    for (const box of boxes) {
        graph.set(box, new Map<Vertex, number>());
    }

    for (const [box, neighbor] of Object.entries(adjacency_list)) {
        const box_num = parseInt(box);
        if(!boxes.includes(box_num) || !boxes.includes(neighbor)) {
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