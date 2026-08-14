import { SqlJsDriver } from "./db_driver.js";
import { DatabaseManager } from "./main.js";
import { Item } from "./types.js";

declare const initSqlJs: any;

export async function main() {
    const SQL = await initSqlJs({
        locateFile: (file: string) => {
            return `./src/modules/${file}`;
        }
    });
    const db = new SQL.Database();
    const driver = new SqlJsDriver(db);
    const manager = new DatabaseManager(driver);

    manager.init_tables();
    manager.add_categories("Tuna", "Tushonka", "Parasha", "roflany");
    manager.add_item("Tuna", new Item(Date.now() + 1000000, 1));
    manager.add_item("Tushonka", new Item(Date.now() + 10000000, 1));
    manager.add_item("Tushonka", new Item(Date.now() + 1000000000, 2));
    manager.add_item("Tushonka", new Item(Date.now() + 1000000000, 2));
    manager.add_item("Tushonka", new Item(Date.now() + 1000000000, 3));
    manager.add_item("Tushonka", new Item(Date.now() + 1000000000, 3));
    manager.add_item("Tushonka", new Item(Date.now() + 1000000000, 1));
    manager.add_item("Parasha", new Item(Date.now() + 1000000000, 1));
    //manager.add_item("tuhlyatinka", new Item(Date.now() + 1000000000, 1));

    const categories = await manager.get_categories();
    console.log("Categories:", categories); 
    let items = await manager.get_items("Tushonka");
    console.log("Items in Tushonka:", items.map(item => item.repr(true)));

    manager.remove_item(3);
    manager.remove_item(4);

    items = await manager.get_items("Tushonka");
    console.log("Items in Tushonka:", items.map(item => item.repr(true)));
}