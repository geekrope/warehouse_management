import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";
import { type Category } from "./types.js";
import { type AdjacencyList } from "./graph_utils.js";
export declare class DatabaseManager {
    private db_driver;
    constructor(db_driver: IDatabaseDriver);
    init_tables(): Promise<void>;
    get_category_ids(...categories: string[]): Promise<Map<string, number>>;
    add_categories(...categories: Category[]): Promise<void>;
    remove_category(title: string): Promise<void>;
    get_categories(): Promise<Category[]>;
    add_items(...item: Item[]): Promise<void>;
    remove_item(id: number): Promise<void>;
    update_item(id: number, args: Partial<Item>): Promise<void>;
    get_items(category: string): Promise<Item[]>;
    get_boxes(): Promise<number[]>;
    get_box_weights(): Promise<{
        box_id: number;
        total_weight: number;
    }[]>;
    get_box_content(box_id: number): Promise<Item[]>;
    get_box_adjacency(): Promise<AdjacencyList>;
    add_box_connections(adjacency: AdjacencyList): Promise<void>;
    remove_box_connection(v: number, u: number): Promise<void>;
    get_snapshot(threshold: number): Promise<{
        category: string;
        count: number;
    }[]>;
}
//# sourceMappingURL=main.d.ts.map