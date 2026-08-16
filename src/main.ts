import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";

export class DatabaseManager {
    constructor(private db_driver: IDatabaseDriver) { }

    //TODO: add category metadata  
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
            { ":category": category }
        );

        if (category_id.length === 0) {
            throw new Error(`Category "${category}" does not exist.`);
        }

        return category_id[0];
    }

    public async add_categories(...titles: string[]): Promise<void> {
        const values_clause = titles.map(() => "(?)").join(", ");

        await this.db_driver.run(
            `INSERT INTO categories 
            (title) 
            VALUES ${values_clause};`,
            titles
        );
    }

    public async remove_category(title: string): Promise<void> {
        await this.db_driver.run(
            `DELETE FROM categories
            WHERE title = :title;`,
            { ":title": title }
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

    public async add_items(category: string, ...item: Item[]): Promise<void> {
        const category_id = await this.get_category_id(category);
        const flattened_values = item.flatMap(i => [category_id, i.box_id, i.expiration_date, i.status, Date.now()]);
        const clause = item.map(() => "(?, ?, ?, ?, ?)").join(", ");
        await this.db_driver.run(
            `INSERT INTO items 
            (category_id, box_id, expiration_date, status, add_date) 
            VALUES ${clause};`,
            flattened_values
        );
    }

    public async remove_item(id: number): Promise<void> {
        await this.db_driver.run(
            `UPDATE items
            SET remove_date = :date
            WHERE id = :id;`,
            { ":date": Date.now(), ":id": id }
        );
    }

    public async update_item(id: number, args: Partial<Item>): Promise<void> {
        const entries = Object.entries(args).filter(
            ([_, val]) => val !== undefined
        );

        if (entries.length === 0) return;

        const keys = entries.map(([key, _]) => key);        
        const values = entries.map(([_, value]) => value);  
        const set_clause = keys.map(key => `${key} = ?`).join(", ");

        await this.db_driver.run(
            `UPDATE items
            SET ${set_clause}
            WHERE id = ?;`,
            values.concat([id])
        );
    }

    public async get_items(category: string): Promise<Item[]> {
        return await this.db_driver.query<Item>(
            `SELECT I.*
            FROM items AS I
            LEFT JOIN categories as C ON I.category_id = C.id 
            WHERE C.title = :category
            AND remove_date IS NULL;`,
            Item.from,
            { ":category": category });
    }

    public async get_boxes(): Promise<number[]> {
        return await this.db_driver.query<number>(
            `SELECT DISTINCT box_id
            FROM items
            WHERE remove_date IS NULL
            ORDER BY box_id ASC;`,
            (obj: any) => obj.box_id as number,
        );
    }

    public async get_box_content(box_id: number): Promise<{item: Item, category: string}[]> {
        return await this.db_driver.query<{item: Item, category: string}>(
            `SELECT I.*, C.title AS category
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.box_id = :box_id AND I.remove_date IS NULL
            ORDER BY C.title;`,
            (obj: any) => ({ item: Item.from(obj), category: obj.category as string }),
            {":box_id": box_id }
        );
    }

    public async get_snapshot(threshold: number): Promise<{category: string, count: number}[]> {
        return await this.db_driver.query<{category: string, count: number}>(
            `SELECT C.title as title, COUNT(*) AS count
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.add_date <= :threshold AND (I.remove_date IS NULL OR I.remove_date > :threshold)
            GROUP BY C.title;`,
            (obj: any) => ({ category: obj.title as string, count: obj.count as number }),
            {":threshold": threshold }
        );
    }
}
