export declare function dijkstra<T>(graph: Map<T, Map<T, number>>, start: T): Map<T, number>;
export declare function detect_cycle<T>(graph: Map<T, Map<T, number>>, labels: Map<T, number>, start: T): boolean;
export type AdjacencyList = {
    v: number;
    u: number;
}[];
export type Vertex = number | "start";
export declare function build_graph(boxes: number[], weights: Map<number, number>, adjacency_list: AdjacencyList): Map<Vertex, Map<Vertex, number>>;
//# sourceMappingURL=graph_utils.d.ts.map