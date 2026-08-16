import { SqlJsDriver } from "./db_driver.js";
import { DatabaseManager } from "./main.js";
import { add_log_entry } from "./dom_utils.js";
import { renderPattern } from "./vocab.js";
import { IndexedDbAdapter } from "./persistence.js";
import { init_intake, refresh_intake } from "./intake.js";
import { init_item_management, refresh_item_management } from "./item_management.js";
import { init_backup } from "./backup.js";
import { init_category_management, refresh_category_management } from "./category_management.js";
let db_manager = undefined;
let categories = [];
export function get_db_manager() {
    if (!db_manager) {
        throw new Error("Database manager not initialized");
    }
    return db_manager;
}
export function get_categories_list() {
    return categories;
}
export async function refresh() {
    if (!db_manager)
        return;
    categories = await db_manager.get_categories();
    await refresh_item_management(categories);
    refresh_category_management(categories);
    refresh_intake(categories);
}
export async function main() {
    try {
        if (!window.initSqlJs)
            throw new Error("SQL.js is not available. Ensure that the SQL.js library is loaded.");
        const SQL = await window.initSqlJs({
            locateFile: (filename) => `src/modules/${filename}`
        });
        const persistenceAdapter = new IndexedDbAdapter();
        const db = new SQL.Database((await persistenceAdapter.load()) || new Uint8Array());
        const driver = new SqlJsDriver(db, persistenceAdapter);
        db_manager = new DatabaseManager(driver);
        await db_manager.init_tables();
        categories = await db_manager.get_categories();
        init_backup();
        init_intake();
        init_item_management();
        init_category_management();
        await refresh();
        add_log_entry(renderPattern("initial_log"), "intakeLog");
        add_log_entry(renderPattern("initial_log"), "storageLog");
        add_log_entry(renderPattern("initial_log"), "categoriesLog");
        add_log_entry(renderPattern("initial_log"), "backupLog");
    }
    catch (error) {
        console.error("Failed to initialize database:", error);
        add_log_entry(renderPattern("initial_log_fail"), "intakeLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "storageLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "categoriesLog", true);
        add_log_entry(renderPattern("initial_log_fail"), "backupLog", true);
    }
}
//# sourceMappingURL=index.js.map