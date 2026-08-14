export class DummyPersistenceAdapter {
    async save(_data) {
    }
    async load() {
        return undefined;
    }
}
export class IndexedDbAdapter {
    dbName;
    storeName;
    key;
    constructor(dbName = "sqlite_db", storeName = "sqlite_store", key = "db_binary") {
        this.dbName = dbName;
        this.storeName = storeName;
        this.key = key;
    }
    async getDB() {
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
    async save(data) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).put(data, this.key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async load() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const request = tx.objectStore(this.storeName).get(this.key);
            request.onsuccess = () => resolve(request.result || undefined);
            request.onerror = () => reject(request.error);
        });
    }
}
//# sourceMappingURL=persistence.js.map