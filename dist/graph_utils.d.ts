export declare function dijkstra<T>(graph: Map<T, Map<T, number>>, start: T): Map<T, number>;
export type AdjacencyList = Record<string, number>;
type Vertex = number | "start";
export declare function build_graph(boxes: number[], weights: Map<number, number>, adjacency_list: AdjacencyList): Map<Vertex, Map<Vertex, number>>;
export {};
//# sourceMappingURL=graph_utils.d.ts.map