import type { IPersistenceAdapter } from "./persistence.js";

export type SqlParams = any[] | Record<string, any>;
export type Constructor<T> = (...args: any[]) => T;

export interface IDatabaseDriver {
    query<T>(sql: string, ctor: Constructor<T>, params?: SqlParams): Promise<T[]>;
    run(sql: string, params?: SqlParams): Promise<void>;
}

export class SqlJsDriver implements IDatabaseDriver {
    constructor(private db: any, private persistence: IPersistenceAdapter) { 
        db.run(`PRAGMA foreign_keys = ON;`);
    }

    async query<T>(sql: string, ctor: Constructor<T>, params: SqlParams): Promise<T[]> {
        const results = this.db.exec(sql, params);

        if (results.length === 0) {
            return [];
        }

        const {columns, values} = results[0];

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
    }

    public async save(): Promise<void> {
        const data: Uint8Array = this.db.export();
        await this.persistence.save(data);
    }
}