import { LocalFileAdapter, IndexedDbAdapter } from "./persistence.js";
import type { IPersistenceAdapter } from "./persistence.js";
import { add_log_entry, get_element } from "./dom_utils.js";
import { renderPattern } from "./vocab.js";

async function transfer(from: IPersistenceAdapter, to: IPersistenceAdapter): Promise<void> {
    const data = await from.load();
    if (data === undefined) return;
    await to.save(data);
}

async function import_backup() {
    const adapter = new LocalFileAdapter("database_backup.sqlite");
    const indexed_db_adapter = new IndexedDbAdapter();

    await transfer(adapter, indexed_db_adapter);

    add_log_entry(renderPattern("log_import"), "backupLog");
    
    setTimeout(() => window.location.reload(), 1000);
}

async function export_backup() {
    const adapter = new LocalFileAdapter("database_backup.sqlite");
    const indexed_db_adapter = new IndexedDbAdapter();

    await transfer(indexed_db_adapter, adapter);

    add_log_entry(renderPattern("log_export"), "backupLog");
}

export function init_backup() {
    const importBtn = get_element<HTMLButtonElement>("importBtn");
    const exportBtn = get_element<HTMLButtonElement>("exportBtn");

    importBtn.onclick = import_backup;
    exportBtn.onclick = export_backup;
}