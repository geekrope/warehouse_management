import { SqlJsDriver } from "./db_driver.js";
import { DatabaseManager } from "./main.js";
import { Item } from "./types.js";
import { get_element } from "./dom_utils.js";
import { erase, heapify } from "./heap.js";
import { renderPattern } from "./vocab.js";
import { IndexedDbAdapter } from "./persistence.js";
let db_manager = undefined;
const page_size = 5;
let categories = [];
let current_category = "";
let pages = [];
let items_heap = [];
let current_page = 0;
function get_db_manager() {
    if (!db_manager) {
        throw new Error("Database manager not initialized");
    }
    return db_manager;
}
function add_log_entry(message, is_error = false) {
    const log_element = get_element("intakeLog");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    if (is_error)
        entry.style.color = "red";
    log_element.appendChild(entry);
    log_element.scrollTop = log_element.scrollHeight;
}
function update_category_datalist(filter_value = "") {
    const datalist = get_element("categoryDatalist");
    datalist.innerHTML = "";
    const filtered = categories.filter(cat => cat.toLowerCase().includes(filter_value.toLowerCase()));
    for (const cat of filtered) {
        const option = document.createElement("option");
        option.value = cat;
        datalist.appendChild(option);
    }
}
function next_page() {
    pages.push([]);
    for (let i = 0; i < page_size; i++) {
        if (items_heap.length === 0)
            break;
        pages[pages.length - 1].push(items_heap[0]);
        erase(items_heap, 0);
    }
}
function render_current_page() {
    const itemsList = get_element("itemsList");
    const pageIndicator = get_element("pageIndicator");
    const itemCount = get_element("itemCount");
    const prevBtn = get_element("prevPageBtn");
    const nextPageBtn = get_element("nextPageBtn");
    const totalPages = pages_count();
    threshold_page();
    while (pages.length <= current_page && items_heap.length > 0) {
        next_page();
    }
    const totalItems = pages.flat().length + items_heap.length;
    itemCount.textContent = renderPattern("count_label", { count: totalItems });
    pageIndicator.textContent = renderPattern("page_number", { num: `${totalPages === 0 ? 0 : current_page + 1}/${totalPages}` });
    prevBtn.disabled = current_page == 0;
    nextPageBtn.disabled = totalPages === 0 || current_page >= totalPages - 1;
    itemsList.innerHTML = "";
    const currentPageItems = pages[current_page] || [];
    for (const item of currentPageItems) {
        const itemCard = document.createElement("div");
        itemCard.className = "item-card";
        const itemInfo = document.createElement("div");
        itemInfo.className = "item-info";
        const itemDate = document.createElement("div");
        itemDate.className = "item-date";
        const dateStr = new Date(item.expiration_date).toLocaleDateString();
        const statusStr = renderPattern(item.status === 0 ? "status_0" : "status_1");
        itemDate.textContent = renderPattern("list_item_label", {
            date: dateStr,
            status: statusStr
        });
        const itemMeta = document.createElement("div");
        itemMeta.className = "item-meta";
        itemMeta.textContent = `${renderPattern("box")} ${item.box_id}`;
        itemInfo.appendChild(itemDate);
        itemInfo.appendChild(itemMeta);
        const btnGroup = document.createElement("div");
        btnGroup.className = "button-group";
        btnGroup.style.marginTop = "0";
        const statusBtn = document.createElement("button");
        statusBtn.className = item.status === 0 ? "btn-secondary" : "btn-success";
        statusBtn.textContent = renderPattern(item.status === 0 ? "status_action_0" : "status_action_1");
        statusBtn.addEventListener("click", async () => {
            try {
                if (item.id == undefined)
                    throw new Error("Item ID not defined");
                const newStatus = item.status === 0 ? 1 : 0;
                await get_db_manager().update_item(item.id, { status: newStatus });
                const newStatusStr = renderPattern(newStatus === 0 ? "status_0" : "status_1");
                add_log_entry(renderPattern("log_update_status", {
                    cat: current_category,
                    meta: item.repr(),
                    status: newStatusStr
                }));
                await load_items(current_category);
                render_current_page();
            }
            catch (error) {
                console.error("Failed to update status:", error);
            }
        });
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-danger";
        deleteBtn.textContent = renderPattern("btn_delete");
        deleteBtn.addEventListener("click", async () => {
            try {
                if (item.id == undefined)
                    throw new Error("Item ID not defined");
                await get_db_manager().remove_item(item.id);
                add_log_entry(renderPattern("log_delete", {
                    cat: current_category,
                    meta: item.repr()
                }));
                await load_items(current_category);
                render_current_page();
            }
            catch (error) {
                console.error("Failed to delete item:", error);
            }
        });
        btnGroup.appendChild(statusBtn);
        btnGroup.appendChild(deleteBtn);
        itemCard.appendChild(itemInfo);
        itemCard.appendChild(btnGroup);
        itemsList.appendChild(itemCard);
    }
}
function pages_count() {
    return Math.ceil((pages.flat().length + items_heap.length) / page_size);
}
function threshold_page() {
    current_page = Math.max(Math.min(current_page, pages_count() - 1), 0);
}
async function load_items(category) {
    const manager = get_db_manager();
    try {
        const items = await manager.get_items(category);
        pages = [];
        items_heap = [...items];
        heapify(items_heap);
    }
    catch (error) {
        console.error("Failed to load items:", error);
    }
}
function log_item_addition(success, category, expiryDate, boxNumber) {
    if (success && category && expiryDate && boxNumber !== undefined) {
        const dateStr = expiryDate.toLocaleDateString();
        add_log_entry(renderPattern("log_add_item", {
            cat: category,
            date: dateStr,
            box: boxNumber
        }));
    }
    else {
        add_log_entry(renderPattern("log_add_fail"), true);
    }
}
async function add_item() {
    const manager = get_db_manager();
    const categoryInput = get_element("categoryInput");
    const expiryDateInput = get_element("expiryDate");
    const boxNumberInput = get_element("boxNumber");
    const statusSelect = get_element("status");
    const category = categoryInput.value.trim();
    const expiry_date = expiryDateInput.valueAsDate;
    const box_number = boxNumberInput.valueAsNumber;
    const status = parseInt(statusSelect.value, 10);
    try {
        if (!category || expiry_date === null || isNaN(box_number))
            throw new Error("Invalid input values");
        if (!categories.includes(category))
            throw new Error("Category does not exist");
        await manager.add_item(category, new Item(expiry_date.getTime(), box_number, status));
        current_category = category;
        await load_items(category);
        render_current_page();
        log_item_addition(true, category, expiry_date, box_number);
    }
    catch (error) {
        console.error("Failed to add item:", error);
        log_item_addition(false);
    }
}
async function add_category() {
    const manager = get_db_manager();
    const newCategoryInput = get_element("newCategory");
    const categoryInput = get_element("categoryInput");
    const category = newCategoryInput.value.trim();
    try {
        if (!category)
            throw new Error("Category cannot be empty");
        if (categories.includes(category))
            throw new Error("Category already exists");
        await manager.add_categories(category);
        categories = await manager.get_categories();
        update_category_datalist(categoryInput.value);
        newCategoryInput.value = "";
        categoryInput.value = category;
        current_category = category;
        current_page = 0;
        await load_items(current_category);
        render_current_page();
        add_log_entry(renderPattern("log_add_cat", { val: category }));
    }
    catch (error) {
        console.error("Failed to add category:", error);
        add_log_entry(renderPattern("log_add_cat_fail"), true);
    }
}
function setup_event_listeners() {
    const intakeForm = get_element("intakeForm");
    intakeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await add_item();
    });
    const categoryForm = get_element("categoryForm");
    categoryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await add_category();
    });
    const categoryInput = get_element("categoryInput");
    categoryInput.addEventListener("input", async () => {
        update_category_datalist(categoryInput.value);
        const val = categoryInput.value.trim();
        if (val && categories.includes(val) && val !== current_category) {
            current_category = val;
            current_page = 0;
            await load_items(current_category);
            render_current_page();
        }
    });
    categoryInput.addEventListener("change", async () => {
        const val = categoryInput.value.trim();
        if (val && val !== current_category) {
            current_category = val;
            await load_items(current_category);
            render_current_page();
        }
    });
    const prevPageBtn = get_element("prevPageBtn");
    prevPageBtn.addEventListener("click", () => {
        if (current_page > 0) {
            current_page--;
            render_current_page();
        }
    });
    const nextPageBtn = get_element("nextPageBtn");
    nextPageBtn.addEventListener("click", () => {
        if (current_page < pages_count() - 1) {
            current_page++;
            render_current_page();
        }
    });
}
export async function main() {
    if (!window.initSqlJs) {
        console.error("SQL.js not loaded. Check that sql-wasm.js script tag exists in index.html");
        return;
    }
    try {
        const SQL = await window.initSqlJs({
            locateFile: (filename) => `src/modules/${filename}`
        });
        const persistenceAdapter = new IndexedDbAdapter();
        const db = new SQL.Database((await persistenceAdapter.load()) || new Uint8Array());
        const driver = new SqlJsDriver(db, persistenceAdapter);
        db_manager = new DatabaseManager(driver);
        await db_manager.init_tables();
        categories = await db_manager.get_categories();
        update_category_datalist();
        setup_event_listeners();
        render_current_page();
        add_log_entry(renderPattern("initial_log"));
    }
    catch (error) {
        console.error("Failed to initialize database:", error);
        add_log_entry(renderPattern("initial_log_fail"), true);
    }
}
//# sourceMappingURL=index.js.map