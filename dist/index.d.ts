import { DatabaseManager } from "./main.js";
import { type Category } from "./types.js";
declare global {
    interface Window {
        initSqlJs: (config?: any) => Promise<any>;
    }
}
export declare function get_db_manager(): DatabaseManager;
export declare function get_categories_list(): Category[];
export declare function get_category_titles(): string[];
export declare function locate_category(category_title: string): Category | undefined;
export declare function refresh(): Promise<void>;
export declare function main(): Promise<void>;
//# sourceMappingURL=index.d.ts.map