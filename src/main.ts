import type { IDatabaseDriver } from "./db_driver.js";
import { Item } from "./types.js";
import type { Category } from "./types.js";

export class DatabaseManager {
    constructor(private db_driver: IDatabaseDriver) { }

    //TODO: add category metadata  
    public async init_tables(): Promise<void> {
        await this.db_driver.run(
            `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            weight REAL DEFAULT NULL);`
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

    public async add_categories(...categories: Category[]): Promise<void> {
        const values_clause = categories.map(() => "(?, ?)").join(", ");
        const values = categories.flatMap(cat => [cat.title, cat.weight]);

        await this.db_driver.run(
            `INSERT INTO categories 
            (title, weight) 
            VALUES ${values_clause};`,
            values
        );
    }

    public async remove_category(title: string): Promise<void> {
        await this.db_driver.run(
            `DELETE FROM categories
            WHERE title = :title;`,
            { ":title": title }
        );
    }

    public async get_categories(): Promise<Category[]> {
        return await this.db_driver.query<Category>(
            `SELECT title, weight 
            FROM categories 
            ORDER BY title ASC;`,
            (obj: any) => { return {title: obj.title as string, weight: obj.weight as number | undefined} }
        );
    }

    public async add_items(...item: Item[]): Promise<void> {
        if (item.length === 0) return;
        const category_map = new Map<string, number>();
        for (const i of item) {
            if (!category_map.has(i.category)) {
                const category_id = await this.get_category_id(i.category);
                category_map.set(i.category, category_id);
            }
        }
        const flattened_values = item.flatMap(i => [category_map.get(i.category)!, i.box_id, i.expiration_date, i.status, Date.now()]);
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
        const { category, ...rest } = args;
        const update_obj: Record<string, any> = { ...rest };
        if (category !== undefined) {
            update_obj.category_id = await this.get_category_id(category);
        }

        const entries = Object.entries(update_obj).filter(
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
            `SELECT I.*, C.title AS category
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

    public async get_box_weights(): Promise<{box_id: number, total_weight: number}[]> {
        return await this.db_driver.query<{box_id: number, total_weight: number}>(
            `SELECT I.box_id as box_id, SUM(COALESCE(C.weight, 0)) AS total_weight
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            GROUP BY I.box_id`,
            (obj: any) => { return { box_id: obj.box_id as number, total_weight: obj.total_weight as number };}
        );
    }

    public async get_box_content(box_id: number): Promise<Item[]> {
        return await this.db_driver.query<Item>(
            `SELECT I.*, C.title AS category
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.box_id = :box_id AND I.remove_date IS NULL
            ORDER BY C.title;`,
            Item.from,
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
