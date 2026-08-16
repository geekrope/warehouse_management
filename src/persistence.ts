export interface IPersistenceAdapter {
    save(data: Uint8Array): Promise<void>;
    load(): Promise<Uint8Array | undefined>;
}

export class DummyPersistenceAdapter implements IPersistenceAdapter {
    async save(_data: Uint8Array): Promise<void> {

    }
    async load(): Promise<Uint8Array | undefined> {
        return undefined;
    }
}

export class IndexedDbAdapter implements IPersistenceAdapter {
    constructor(
        private dbName = "sqlite_db", 
        private storeName = "sqlite_store", 
        private key = "db_binary"
    ) {}

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async save(data: Uint8Array): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).put(data, this.key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async load(): Promise<Uint8Array | undefined> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const request = tx.objectStore(this.storeName).get(this.key);
            
            request.onsuccess = () => resolve(request.result as Uint8Array || undefined);
            request.onerror = () => reject(request.error);
        });
    }
}

export class LocalFileAdapter implements IPersistenceAdapter {
    constructor(private filename: string = "database.sqlite") {}

    async save(data: Uint8Array): Promise<void> {
        const blob = new Blob([data as unknown as BlobPart], { type: "application/x-sqlite3" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async load(): Promise<Uint8Array | undefined> {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".sqlite,.db,.sql";

            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) {
                    resolve(undefined);
                    return;
                }
                const arrayBuffer = await file.arrayBuffer();
                resolve(new Uint8Array(arrayBuffer));
            };

            input.oncancel = () => {
                resolve(undefined);
            };

            input.click();
        });
    }
}