export interface IDatabaseDriver {
    query<T>(sql: string, ctor: Constructor<T>, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<void>;
}
export type Constructor<T> = (...args: any[]) => T;
export declare class SqlJsDriver implements IDatabaseDriver {
    private db;
    constructor(db: any);
    query<T>(sql: string, ctor: Constructor<T>, params?: unknown[]): Promise<T[]>;
    run(sql: string, params?: unknown[]): Promise<void>;
}
//# sourceMappingURL=db_driver.d.ts.map