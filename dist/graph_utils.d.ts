export declare function dijkstra<T>(graph: Map<T, Map<T, number>>, start: T): Map<T, number>;
export declare function detect_cycle<T>(graph: Map<T, Map<T, number>>, labels: Map<T, number>, start: T): boolean;
export type AdjacencyList<T = number> = {
    v: T;
    u: T;
}[];
export type Vertex<T = number> = T | "start";
export declare function build_graph<T>(boxes: T[], weights: Map<T, number>, adjacency_list: AdjacencyList<T>): Map<Vertex<T>, Map<Vertex<T>, number>>;
//# sourceMappingURL=graph_utils.d.ts.map