import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";

export class DatabaseManager {
    constructor(private db_driver: IDatabaseDriver) { }

    public async init_tables(): Promise<void> {
        await this.db_driver.run(
            `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE);`
        );

        await this.db_driver.run(
            `CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            box_id INTEGER NOT NULL,
            expiration_date INTEGER NOT NULL,
            status INTEGER NOT NULL,
            add_date INTEGER NOT NULL,
            remove_date INTEGER DEFAULT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id));`
        );
    }

    public async get_category_id(category: string): Promise<number> {
        const category_id = await this.db_driver.query(
            `SELECT id 
            FROM categories 
            WHERE title = :category;`,
            (obj: any) => obj.id,
            {":category": category}
        );

        if (category_id.length === 0) {
            throw new Error(`Category "${category}" does not exist.`);
        }

        return category_id[0];
    }

    public async add_categories(...titles: string[]): Promise<void> {
        const placeholders = titles.map(() => "(?)").join(", ");

        await this.db_driver.run(
            `INSERT INTO categories 
            (title) 
            VALUES ${placeholders};`,
            titles
        );
    }

    public async get_categories(): Promise<string[]> {
        return await this.db_driver.query<string>(
            `SELECT title 
            FROM categories 
            ORDER BY title ASC;`,
            (obj: any) => obj.title
        );
    }

    public async add_item(category: string, item: Item): Promise<void> {
        await this.db_driver.run(
            `INSERT INTO items 
            (category_id, box_id, expiration_date, status, add_date) 
            VALUES ((SELECT id FROM categories WHERE title = ?), ?, ?, ?, ?);`,
            [category, item.box_id, item.expiration_date, item.status, Date.now()]
        );
    }

    public async remove_item(id: number): Promise<void> {
        await this.db_driver.run(
            `UPDATE items
            SET remove_date = :date
            WHERE id = :id;`,
            {":date": Date.now(), ":id": id}
        );
    }

    public async update_item(id: number, args: Partial<Item>): Promise<void> {
        for (const [key, value] of Object.entries(args)) {
            if(value === undefined || value === null) continue;
            
            await this.db_driver.run(
                `UPDATE items
                SET ${key} = ?
                WHERE id = ?;`,
                [value, id]
            );
        }
    }

    public async get_items(category: string): Promise<Item[]> {
        return await this.db_driver.query<Item>(
            `SELECT I.*
            FROM items AS I
            LEFT JOIN categories as C ON I.category_id = C.id 
            WHERE C.title = :category
            AND remove_date IS NULL;`,
            Item.from,
            {":category": category});
    }
}
