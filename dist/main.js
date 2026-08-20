import { Item } from "./types.js";
import {} from "./types.js";
import {} from "./graph_utils.js";
export class DatabaseManager {
    db_driver;
    constructor(db_driver) {
        this.db_driver = db_driver;
    }
    async init_tables() {
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            weight REAL DEFAULT NULL);`);
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS boxes (
            id INTEGER PRIMARY KEY)`);
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            box_id INTEGER NOT NULL,
            expiration_date INTEGER NOT NULL,
            status INTEGER NOT NULL,
            add_date INTEGER NOT NULL,
            remove_date INTEGER DEFAULT NULL,
            FOREIGN KEY (box_id) REFERENCES boxes(id),
            FOREIGN KEY (category_id) REFERENCES categories(id));`);
        await this.db_driver.run(`CREATE TABLE IF NOT EXISTS box_adjacency (
            v INTEGER NOT NULL,
            u INTEGER NOT NULL,
            FOREIGN KEY (v) REFERENCES boxes(id),
            FOREIGN KEY (u) REFERENCES boxes(id))`);
        await this.db_driver.run(`CREATE TRIGGER IF NOT EXISTS box_emplace_insert
            BEFORE INSERT ON items
            FOR EACH ROW
            WHEN (SELECT COUNT(*) FROM boxes WHERE id = NEW.box_id) = 0
            BEGIN
                INSERT INTO boxes (id) VALUES (NEW.box_id);
            END;`);
        await this.db_driver.run(`CREATE TRIGGER IF NOT EXISTS box_emplace_update
            BEFORE UPDATE ON items
            FOR EACH ROW
            WHEN (SELECT COUNT(*) FROM boxes WHERE id = NEW.box_id) = 0
            BEGIN
                INSERT INTO boxes (id) VALUES (NEW.box_id);
            END;`);
    }
    async get_category_ids(...categories) {
        categories = Array.from(new Set(categories));
        if (categories.length === 0)
            return new Map();
        const where_clause = categories.map(() => "?").join(", ");
        const category_ids = await this.db_driver.query(`SELECT title, id 
            FROM categories 
            WHERE title IN (${where_clause});`, (obj) => { return { key: obj.title, value: obj.id }; }, categories);
        return new Map(category_ids.map(({ key, value }) => [key, value]));
    }
    async add_categories(...categories) {
        const values_clause = categories.map(() => "(?, ?)").join(", ");
        const values = categories.flatMap(cat => [cat.title, cat.weight]);
        await this.db_driver.run(`INSERT INTO categories 
            (title, weight) 
            VALUES ${values_clause};`, values);
    }
    async remove_category(title) {
        await this.db_driver.run(`DELETE FROM categories
            WHERE title = :title;`, { ":title": title });
    }
    async get_categories() {
        return await this.db_driver.query(`SELECT title, weight 
            FROM categories 
            ORDER BY title ASC;`, (obj) => { return { title: obj.title, weight: obj.weight }; });
    }
    async add_items(...item) {
        if (item.length === 0)
            return;
        const category_map = await this.get_category_ids(...item.map(i => i.category));
        for (const i of item) {
            if (!category_map.has(i.category)) {
                throw new Error(`Category "${i.category}" does not exist.`);
            }
        }
        const flattened_values = item.flatMap(i => [category_map.get(i.category), i.box_id, i.expiration_date, i.status, Date.now()]);
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
        const { category, ...rest } = args;
        const update_obj = { ...rest };
        if (category !== undefined) {
            const category_map = await this.get_category_ids(category);
            const category_id = category_map.get(category);
            if (category_id === undefined) {
                throw new Error(`Category "${category}" does not exist.`);
            }
            update_obj["category_id"] = category_id;
        }
        const entries = Object.entries(update_obj).filter(([_, val]) => val !== undefined);
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
        return await this.db_driver.query(`SELECT I.*, C.title AS category
            FROM items AS I
            LEFT JOIN categories as C ON I.category_id = C.id 
            WHERE C.title = :category
            AND remove_date IS NULL;`, Item.from, { ":category": category });
    }
    async get_boxes() {
        return await this.db_driver.query(`SELECT id AS box_id
            FROM boxes
            ORDER BY box_id ASC;`, (obj) => obj.box_id);
    }
    async get_box_weights() {
        return await this.db_driver.query(`SELECT I.box_id as box_id, SUM(COALESCE(C.weight, 0)) AS total_weight
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.remove_date IS NULL
            GROUP BY I.box_id`, (obj) => { return { box_id: obj.box_id, total_weight: obj.total_weight }; });
    }
    async get_box_content(box_id) {
        return await this.db_driver.query(`SELECT I.*, C.title AS category
            FROM items AS I
            JOIN categories AS C ON I.category_id = C.id
            WHERE I.box_id = :box_id AND I.remove_date IS NULL
            ORDER BY C.title;`, Item.from, { ":box_id": box_id });
    }
    async get_box_adjacency() {
        const edges = await this.db_driver.query(`SELECT v, u
            FROM box_adjacency;`, (obj) => { return { v: obj.v, u: obj.u }; });
        return edges;
    }
    async add_box(box_id) {
        await this.db_driver.run(`INSERT INTO boxes (id) VALUES (:box_id);`, { ":box_id": box_id });
    }
    async add_box_connections(adjacency) {
        if (adjacency.length === 0)
            return;
        const values_clause = adjacency.map(() => "(?, ?)").join(", ");
        const values = adjacency.flatMap(({ v, u }) => [v, u]);
        await this.db_driver.run(`INSERT INTO box_adjacency 
            (v, u) 
            VALUES ${values_clause};`, values);
    }
    async remove_box_connection(v, u) {
        await this.db_driver.run(`DELETE FROM box_adjacency WHERE v = :v AND u = :u;`, { ":v": v, ":u": u });
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