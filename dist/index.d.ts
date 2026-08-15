import { DatabaseManager } from "./main.js";
declare global {
    interface Window {
        initSqlJs: (config?: any) => Promise<any>;
    }
}
export declare function get_db_manager(): DatabaseManager;
export declare function get_categories_list(): string[];
export declare function refresh(): Promise<void>;
export declare function main(): Promise<void>;
//# sourceMappingURL=index.d.ts.map