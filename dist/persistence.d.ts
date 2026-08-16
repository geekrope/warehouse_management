export interface IPersistenceAdapter {
    save(data: Uint8Array): Promise<void>;
    load(): Promise<Uint8Array | undefined>;
}
export declare class DummyPersistenceAdapter implements IPersistenceAdapter {
    save(_data: Uint8Array): Promise<void>;
    load(): Promise<Uint8Array | undefined>;
}
export declare class IndexedDbAdapter implements IPersistenceAdapter {
    private dbName;
    private storeName;
    private key;
    constructor(dbName?: string, storeName?: string, key?: string);
    private getDB;
    save(data: Uint8Array): Promise<void>;
    load(): Promise<Uint8Array | undefined>;
}
export declare class LocalFileAdapter implements IPersistenceAdapter {
    private filename;
    constructor(filename?: string);
    save(data: Uint8Array): Promise<void>;
    load(): Promise<Uint8Array | undefined>;
}
//# sourceMappingURL=persistence.d.ts.map