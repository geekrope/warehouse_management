import { SqlJsDriver } from "./db_driver.js";
import { DatabaseManager } from "./main.js";
import { add_log_entry } from "./dom_utils.js";
import { renderPattern } from "./vocab.js";
import { IndexedDbAdapter } from "./persistence.js";
import { init_intake, refresh_intake } from "./intake.js";
import { init_item_management, refresh_item_management } from "./item_management.js";
import { init_backup } from "./backup.js";
import { init_boxes_management, refresh_boxes_management } from "./boxes_management.js";
import { init_category_management, refresh_category_management } from "./category_management.js";
import { type Category } from "./types.js";

declare global {
    interface Window {
        initSqlJs: (config?: any) => Promise<any>;
    }
}

let db_manager: DatabaseManager | undefined = undefined;
let categories: Category[] = [];

export function get_db_manager(): DatabaseManager {
    if (!db_manager) {
        throw new Error("Database manager not initialized");
    }
    return db_manager;
}

export function get_categories_list(): Category[] {
    return categories;
}

export function get_category_titles(): string[] {
    return categories.map(cat => cat.title);
}

export function locate_category(category_title: string): Category | undefined {
    return categories.find(cat => cat.title === category_title);
}

// TODO: reinitialize each page when focus is regained
export async function refresh(): Promise<void> {
    if (!db_manager) return;

    categories = await db_manager.get_categories();

    await refresh_item_management();
    refresh_category_management();
    refresh_intake();
    await refresh_boxes_management();
}

export async function main(): Promise<void> {
    try {
        if (!window.initSqlJs) throw new Error("SQL.js is not available. Ensure that the SQL.js library is loaded.");

        const SQL = await window.initSqlJs({
            locateFile: (filename: string) => `src/modules/${filename}`
        });

        const persistence_adapter = new IndexedDbAdapter();
        const db = new SQL.Database((await persistence_adapter.load()) || new Uint8Array());

        const driver = new SqlJsDriver(db, persistence_adapter);        
        db_manager = new DatabaseManager(driver);

        await driver.enable_foreign_keys();
        await db_manager.init_tables();
        categories = await db_manager.get_categories();

        init_backup();
        init_intake();
        init_item_management();
        init_boxes_management();
        init_category_management();

        await refresh();

        add_log_entry(renderPattern("initial_log"), "intakeLog");
        add_log_entry(renderPattern("initial_log"), "storageLog");
        add_log_entry(renderPattern("initial_log"), "categoriesLog");
        add_log_entry(renderPattern("initial_log"), "backupLog");

        console.log(db.exec("SELECT * FROM Items;"));
        console.log(await db_manager.get_category_ids("1", "тушенка", "тушенка", "тушенка", "1"));
    } catch (error) {
        console.error("Failed to initialize database:", error);
        add_log_entry(renderPattern("initial_log_fail"), "intakeLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "storageLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "categoriesLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "backupLog", true);
    }
}