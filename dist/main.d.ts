import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";
export declare class DatabaseManager {
    private db_driver;
    constructor(db_driver: IDatabaseDriver);
    init_tables(): Promise<void>;
    private get_category_id;
    add_categories(...title: string[]): Promise<void>;
    get_categories(): Promise<string[]>;
    add_item(category: string, item: Item): Promise<void>;
    remove_item(id: number): Promise<void>;
    get_items(category: string): Promise<Item[]>;
}
//# sourceMappingURL=main.d.ts.map