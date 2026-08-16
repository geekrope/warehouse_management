import { Item } from "./types.js";
export class DatabaseManager {
    db_driver;
    constructor(db_driver) {
        this.db_driver = db_driver;
    }
    //TODO: add category metadata  
    async init_tables() {
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE);`);
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            box_id INTEGER NOT NULL,
            expiration_date INTEGER NOT NULL,
            status INTEGER NOT NULL,
            add_date INTEGER NOT NULL,
            remove_date INTEGER DEFAULT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id));`);
    }
    async get_category_id(category) {
        const category_id = await this.db_driver.query(`SELECT id 
            FROM categories 
            WHERE title = :category;`, (obj) => obj.id, { ":category": category });
        if (category_id.length === 0) {
            throw new Error(`Category "${category}" does not exist.`);
        }
        return category_id[0];
    }
    async add_categories(...titles) {
        const values_clause = titles.map(() => "(?)").join(", ");
        await this.db_driver.run(`INSERT INTO categories 
            (title) 
            VALUES ${values_clause};`, titles);
    }
    async remove_category(title) {
        await this.db_driver.run(`DELETE FROM categories
            WHERE title = :title;`, { ":title": title });
    }
    async get_categories() {
        return await this.db_driver.query(`SELECT title 
            FROM categories 
            ORDER BY title ASC;`, (obj) => obj.title);
    }
    async add_items(category, ...item) {
        const category_id = await this.get_category_id(category);
        const flattened_values = item.flatMap(i => [category_id, i.box_id, i.expiration_date, i.status, Date.now()]);
        const clause = item.map(() => "(?, ?, ?, ?, ?)").join(", ");
        await this.db_driver.run(`INSERT INTO items 
            (category_id, box_id, expiration_date, status, add_date) 
            VALUES ${clause};`, flattened_values);
    }
    async remove_item(id) {
        await this.db_driver.run(`UPDATE items
            SET remove_date = :date
            WHERE id = :id;`, { ":date": Date.now(), ":id": id });
    }
    async update_item(id, args) {
        const entries = Object.entries(args).filter(([_, val]) => val !== undefined);
        if (entries.length === 0)
            return;
        const keys = entries.map(([key, _]) => key);
        const values = entries.map(([_, value]) => value);
        const set_clause = keys.map(key => `${key} = ?`).join(", ");
        await this.db_driver.run(`UPDATE items
            SET ${set_clause}
            WHERE id = ?;`, values.concat([id]));
    }
    async get_items(category) {
        return await this.db_driver.query(`SELECT I.*
            FROM items AS I
            LEFT JOIN categories as C ON I.category_id = C.id 
            WHERE C.title = :category
            AND remove_date IS NULL;`, Item.from, { ":category": category });
    }
    async get_boxes() {
        return await this.db_driver.query(`SELECT DISTINCT box_id
            FROM items
            WHERE remove_date IS NULL
            ORDER BY box_id ASC;`, (obj) => obj.box_id);
    }
    async get_box_content(box_id) {
        return await this.db_driver.query(`SELECT I.*, C.title AS category
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.box_id = :box_id AND I.remove_date IS NULL
            ORDER BY C.title;`, (obj) => ({ item: Item.from(obj), category: obj.category }), { ":box_id": box_id });
    }
    async get_snapshot(threshold) {
        return await this.db_driver.query(`SELECT C.title as title, COUNT(*) AS count
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.add_date <= :threshold AND (I.remove_date IS NULL OR I.remove_date > :threshold)
            GROUP BY C.title;`, (obj) => ({ category: obj.title, count: obj.count }), { ":threshold": threshold });
    }
}
//# sourceMappingURL=main.js.map