import { Item, item_less } from "./types.js";
import { heapify, partial_heapsort } from "./heap.js";
import { add_log_entry, get_element, CategoryInput, empty_container } from "./dom_utils.js";
import { get_db_manager, refresh, get_category_titles, locate_category } from "./index.js";
import { renderPattern, repr } from "./vocab.js";
const page_size = 5;
let storage_category_input = undefined;
let heap_ptr = -1;
let pages = [];
let items_heap = [];
let current_category = undefined;
let current_page = 0;
function get_category_input() {
    if (!storage_category_input)
        throw new Error("Storage category input is not initialized");
    return storage_category_input;
}
function next_page() {
    if (heap_ptr == -1)
        return; // reached the end of the heap
    const { sorted, ptr } = partial_heapsort(items_heap, heap_ptr, page_size, item_less);
    pages.push(sorted);
    heap_ptr = ptr;
}
function render_item(item) {
    const itemCard = document.createElement("div");
    itemCard.className = "item-card";
    const itemInfo = document.createElement("div");
    itemInfo.className = "item-info";
    const itemDate = document.createElement("div");
    itemDate.className = "item-date";
    const date_str = new Date(item.expiration_date).toLocaleDateString();
    const status_str = renderPattern(item.status === 0 ? "status_0" : "status_1");
    itemDate.textContent = renderPattern("list_item_label", {
        date: date_str,
        status: status_str
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
            const new_status = item.status === 0 ? 1 : 0;
            await get_db_manager().update_item(item.id, { status: new_status });
            const new_status_str = renderPattern(new_status === 0 ? "status_0" : "status_1");
            add_log_entry(renderPattern("log_update_status", {
                meta: repr(item, current_category),
                status: new_status_str
            }), "storageLog");
            await refresh();
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
                meta: repr(item, current_category)
            }), "storageLog");
            await refresh();
        }
        catch (error) {
            console.error("Failed to delete item:", error);
        }
    });
    btnGroup.appendChild(statusBtn);
    btnGroup.appendChild(deleteBtn);
    itemCard.appendChild(itemInfo);
    itemCard.appendChild(btnGroup);
    return itemCard;
}
function pages_count() {
    return Math.ceil(items_heap.length / page_size);
}
function threshold_page() {
    current_page = Math.max(Math.min(current_page, pages_count() - 1), 0);
}
export function render_current_page() {
    const itemsList = get_element("itemsList");
    const pageIndicator = get_element("pageIndicator");
    const itemCount = get_element("itemCount");
    const itemCategory = get_element("itemCategory");
    const prevBtn = get_element("prevPageBtn");
    const nextPageBtn = get_element("nextPageBtn");
    const total_pages = pages_count();
    itemsList.innerHTML = "";
    if (total_pages === 0) {
        const emptyContainer = empty_container();
        itemsList.appendChild(emptyContainer);
    }
    threshold_page();
    while (pages.length <= current_page && items_heap.length > 0) {
        next_page();
    }
    const total_items = items_heap.length;
    itemCategory.textContent = current_category != undefined ? renderPattern("selected_category", { category: current_category.title }) : renderPattern("no_category_selected");
    itemCount.textContent = renderPattern("count_label", { count: total_items });
    pageIndicator.textContent = renderPattern("page_number", { num: `${total_pages === 0 ? 0 : current_page + 1}/${total_pages}` });
    prevBtn.disabled = current_page === 0;
    nextPageBtn.disabled = total_pages === 0 || current_page >= total_pages - 1;
    const current_page_items = pages[current_page] || [];
    for (const item of current_page_items) {
        itemsList.appendChild(render_item(item));
    }
}
async function load_items() {
    const manager = get_db_manager();
    try {
        items_heap = [];
        pages = [];
        heap_ptr = -1;
        if (current_category === undefined) {
            return;
        }
        const items = await manager.get_items(current_category.title);
        items_heap = [...items];
        heap_ptr = items_heap.length - 1;
        heapify(items_heap, item_less);
    }
    catch (error) {
        console.error("Failed to load items:", error);
    }
}
function update_selected_category(new_category) {
    current_category = new_category;
}
export function init_item_management() {
    const storageFilterCard = get_element("storageFilterCard");
    storage_category_input = new CategoryInput("storageCategoryInput", get_category_titles(), renderPattern("item_placeholder"), async (val) => {
        update_selected_category(locate_category(val));
        await load_items();
        render_current_page();
    });
    storageFilterCard.appendChild(storage_category_input.container);
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
export async function refresh_item_management() {
    const category_input = get_category_input();
    category_input.categories = get_category_titles();
    update_selected_category(locate_category(current_category?.title ?? ""));
    await load_items();
    render_current_page();
}
//# sourceMappingURL=item_management.js.map