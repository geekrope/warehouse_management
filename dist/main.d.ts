import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";
export declare class DatabaseManager {
    private db_driver;
    constructor(db_driver: IDatabaseDriver);
    init_tables(): Promise<void>;
    get_category_id(category: string): Promise<number>;
    add_categories(...titles: string[]): Promise<void>;
    remove_category(title: string): Promise<void>;
    get_categories(): Promise<string[]>;
    add_items(category: string, ...item: Item[]): Promise<void>;
    remove_item(id: number): Promise<void>;
    update_item(id: number, args: Partial<Item>): Promise<void>;
    get_items(category: string): Promise<Item[]>;
    get_boxes(): Promise<number[]>;
    get_box_content(box_id: number): Promise<{
        item: Item;
        category: string;
    }[]>;
    get_snapshot(threshold: number): Promise<{
        category: string;
        count: number;
    }[]>;
}
//# sourceMappingURL=main.d.ts.map