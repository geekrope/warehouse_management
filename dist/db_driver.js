export class SqlJsDriver {
    db;
    constructor(db) {
        this.db = db;
    }
    async query(sql, ctor, params = []) {
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
    async run(sql, params = []) {
        this.db.run(sql, params);
    }
}
//# sourceMappingURL=db_driver.js.map