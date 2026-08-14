export interface IDatabaseDriver {
    query<T>(sql: string, ctor: Constructor<T>, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<void>;
}

export type Constructor<T> = (...args: any[]) => T;

export class SqlJsDriver implements IDatabaseDriver {
    constructor(private db: any) { }

    async query<T>(sql: string, ctor: Constructor<T>, params: unknown[] = []): Promise<T[]> {
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

    async run(sql: string, params: unknown[] = []): Promise<void> {
        this.db.run(sql, params as any[]);
    }
}