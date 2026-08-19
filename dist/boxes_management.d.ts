import { Item } from "./types.js";
import { type AdjacencyList } from "./graph_utils.js";
export declare class BoxElement {
    box_id: number;
    box_weight: number;
    container: HTMLDivElement;
    private items_list_container;
    constructor(box_id: number, box_weight: number, item_elements?: HTMLElement[]);
    private bind_drop_events;
}
export declare function render_box_graph(container: HTMLElement, boxes: number[], weights: Map<number, number>, adjacency: AdjacencyList): void;
export declare function render_weights_table(container: HTMLElement, boxes: number[], weights: Map<number, number>, adjacency: AdjacencyList): void;
export declare function create_draggable_item_element(item: Item): HTMLElement;
export declare function refresh_boxes_management(): Promise<void>;
export declare function init_boxes_management(): void;
//# sourceMappingURL=boxes_management.d.ts.map