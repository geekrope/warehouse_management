import { Item } from "./types.js";
import { erase, heapify } from "./heap.js";
import { add_log_entry, get_element, CategoryInput } from "./dom_utils.js";
import { get_db_manager, refresh, get_categories_list } from "./index.js";
import { renderPattern } from "./vocab.js";

const page_size: number = 5;

let storage_category_input: CategoryInput | undefined = undefined;
let pages: Item[][] = [];
let items_heap: Item[] = [];
let current_category: string | undefined = undefined;
let current_page: number = 0;

function get_category_input(): CategoryInput {
    if (!storage_category_input) throw new Error("Storage category input is not initialized");
    return storage_category_input;
}

function next_page() {
    pages.push([]);

    for (let i = 0; i < page_size; i++) {
        if (items_heap.length === 0) break;

        pages[pages.length - 1].push(items_heap[0]);
        erase(items_heap, 0);
    }
}

function render_item(item: Item): HTMLElement {
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
            if (item.id == undefined) throw new Error("Item ID not defined");

            const newStatus = item.status === 0 ? 1 : 0;
            await get_db_manager().update_item(item.id, { status: newStatus });
            const newStatusStr = renderPattern(newStatus === 0 ? "status_0" : "status_1");

            add_log_entry(renderPattern("log_update_status", {
                cat: current_category,
                meta: item.repr(),
                status: newStatusStr
            }), "storageLog");

            add_log_entry(renderPattern("log_update_status", {
                cat: current_category,
                meta: item.repr(),
                status: newStatusStr
            }), "intakeLog");

            await refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = renderPattern("btn_delete");
    deleteBtn.addEventListener("click", async () => {
        try {
            if (item.id == undefined) throw new Error("Item ID not defined");

            await get_db_manager().remove_item(item.id);

            add_log_entry(renderPattern("log_delete", {
                cat: current_category,
                meta: item.repr()
            }), "storageLog");

            add_log_entry(renderPattern("log_delete", {
                cat: current_category,
                meta: item.repr()
            }), "intakeLog");

            await refresh();
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    });

    btnGroup.appendChild(statusBtn);
    btnGroup.appendChild(deleteBtn);

    itemCard.appendChild(itemInfo);
    itemCard.appendChild(btnGroup);

    return itemCard;
}

function pages_count(): number {
    return Math.ceil((pages.flat().length + items_heap.length) / page_size);
}

function threshold_page(): void {
    current_page = Math.max(Math.min(current_page, pages_count() - 1), 0);
}

export function render_current_page() {
    const itemsList = get_element<HTMLDivElement>("itemsList");
    const pageIndicator = get_element<HTMLSpanElement>("pageIndicator");
    const itemCount = get_element<HTMLSpanElement>("itemCount");
    const itemCategory = get_element<HTMLSpanElement>("itemCategory");
    const prevBtn = get_element<HTMLButtonElement>("prevPageBtn");
    const nextPageBtn = get_element<HTMLButtonElement>("nextPageBtn");

    const totalPages = pages_count();

    itemsList.innerHTML = "";
    if (totalPages === 0) {
        const emptyContainer = document.createElement("div");
        emptyContainer.className = "empty-state";

        const emptyImage = document.createElement("img");
        emptyImage.src = "./empty_list.svg";
        emptyImage.alt = "Empty list";
        emptyImage.className = "empty-state-img";

        emptyContainer.appendChild(emptyImage);
        itemsList.appendChild(emptyContainer);
    }

    threshold_page();
    while (pages.length <= current_page && items_heap.length > 0) {
        next_page();
    }

    const totalItems = pages.flat().length + items_heap.length;
    itemCategory.textContent = current_category != undefined ? renderPattern("selected_category", { category: current_category }) : renderPattern("no_category_selected");
    itemCount.textContent = renderPattern("count_label", { count: totalItems });
    pageIndicator.textContent = renderPattern("page_number", { num: `${totalPages === 0 ? 0 : current_page + 1}/${totalPages}` });

    prevBtn.disabled = current_page === 0;
    nextPageBtn.disabled = totalPages === 0 || current_page >= totalPages - 1;

    const currentPageItems = pages[current_page] || [];

    for (const item of currentPageItems) {
        itemsList.appendChild(render_item(item));
    }
}

async function load_items() {
    const manager = get_db_manager();
    try {
        items_heap = [];
        pages = [];

        if (current_category === undefined) { return; }

        const items = await manager.get_items(current_category);
        items_heap = [...items];
        heapify(items_heap);
    } catch (error) {
        console.error("Failed to load items:", error);
    }
}

function update_selected_category(new_category: string) {
    if (get_categories_list().includes(new_category)) {
        current_category = new_category;
        current_page = 0;
    } else {
        current_category = undefined;
    }
}

export function init_item_management() {
    const storageFilterCard = get_element<HTMLDivElement>("storageFilterCard");
    const categories = get_categories_list();

    storage_category_input = new CategoryInput(
        "storageCategoryInput",
        categories,
        renderPattern("item_placeholder"),
        async (val) => {
            update_selected_category(val);
            await load_items();
            render_current_page();
        }
    );

    storageFilterCard.appendChild(storage_category_input.container);

    const prevPageBtn = get_element<HTMLButtonElement>("prevPageBtn");
    prevPageBtn.addEventListener("click", () => {
        if (current_page > 0) {
            current_page--;
            render_current_page();
        }
    });

    const nextPageBtn = get_element<HTMLButtonElement>("nextPageBtn");
    nextPageBtn.addEventListener("click", () => {
        if (current_page < pages_count() - 1) {
            current_page++;
            render_current_page();
        }
    });
}

export async function refresh_item_management(categories: string[]) {
    const categoryInput = get_category_input();
    categoryInput.categories = categories;

    update_selected_category(categoryInput.value);
    await load_items();
    render_current_page();
}