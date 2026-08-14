import { Item } from "./types.js";
export class DatabaseManager {
    db_driver;
    constructor(db_driver) {
        this.db_driver = db_driver;
    }
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
        const placeholders = titles.map(() => "(?)").join(", ");
        await this.db_driver.run(`INSERT INTO categories 
            (title) 
            VALUES ${placeholders};`, titles);
    }
    async get_categories() {
        return await this.db_driver.query(`SELECT title 
            FROM categories 
            ORDER BY title ASC;`, (obj) => obj.title);
    }
    async add_item(category, item) {
        await this.db_driver.run(`INSERT INTO items 
            (category_id, box_id, expiration_date, status, add_date) 
            VALUES ((SELECT id FROM categories WHERE title = ?), ?, ?, ?, ?);`, [category, item.box_id, item.expiration_date, item.status, Date.now()]);
    }
    async remove_item(id) {
        await this.db_driver.run(`UPDATE items
            SET remove_date = :date
            WHERE id = :id;`, { ":date": Date.now(), ":id": id });
    }
    async update_item(id, args) {
        for (const [key, value] of Object.entries(args)) {
            if (value === undefined || value === null)
                continue;
            await this.db_driver.run(`UPDATE items
                SET ${key} = ?
                WHERE id = ?;`, [value, id]);
        }
    }
    async get_items(category) {
        return await this.db_driver.query(`SELECT I.*
            FROM items AS I
            LEFT JOIN categories as C ON I.category_id = C.id 
            WHERE C.title = :category
            AND remove_date IS NULL;`, Item.from, { ":category": category });
    }
}
//# sourceMappingURL=main.js.map