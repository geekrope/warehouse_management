import {} from "./persistence.js";
export class SqlJsDriver {
    db;
    persistence;
    constructor(db, persistence) {
        this.db = db;
        this.persistence = persistence;
    }
    async query(sql, ctor, params) {
        const results = this.db.exec(sql, params);
        if (results.length === 0) {
            return [];
        }
        const { columns, values } = results[0];
        return values.map((row) => {
            const obj = {};
            columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return ctor(obj);
        });
    }
    async run(sql, params) {
        this.db.run(sql, params);
        await this.save();
    }
    async save() {
        const data = this.db.export();
        await this.persistence.save(data);
    }
}
//# sourceMappingURL=db_driver.js.map