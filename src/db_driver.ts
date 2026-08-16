import type { IPersistenceAdapter } from "./persistence.js";

export type SqlParams = any[] | Record<string, any>;
export type Constructor<T> = (...args: any[]) => T;

export interface IDatabaseDriver {
    query<T>(sql: string, ctor: Constructor<T>, params?: SqlParams): Promise<T[]>;
    run(sql: string, params?: SqlParams): Promise<void>;
}

export class SqlJsDriver implements IDatabaseDriver {
    constructor(private db: any, private persistence: IPersistenceAdapter) { }

    async enable_foreign_keys(): Promise<void> {
        await this.db.run("PRAGMA foreign_keys = ON;");
    }

    async assert_foreign_keys_enabled(): Promise<void> {
        const result = this.db.exec("PRAGMA foreign_keys;");
        if (result.length === 0 || result[0].values[0][0] !== 1) throw new Error("Foreign key constraints are not enabled in the database.");
    }

    async query<T>(sql: string, ctor: Constructor<T>, params: SqlParams): Promise<T[]> {
        const results = this.db.exec(sql, params);

        if (results.length === 0) {
            return [];
        }

        const { columns, values } = results[0];
        await this.assert_foreign_keys_enabled();

        return values.map((row: Array<any>) => {
            const obj: Record<string, any> = {};

            columns.forEach((col: string, index: number) => {
                obj[col] = row[index];
            });

            return ctor(obj);
        });
    }

    async run(sql: string, params: SqlParams): Promise<void> {
        this.db.run(sql, params);
        await this.save();
        await this.enable_foreign_keys()  // enable foreign key constraints, as it automatically disables on every update.
        await this.assert_foreign_keys_enabled();
    }

    public async save(): Promise<void> {
        const data: Uint8Array = this.db.export();
        await this.persistence.save(data);
    }
}