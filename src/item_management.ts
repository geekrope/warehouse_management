import { Item, item_less } from "./types.js";
import type { Category } from "./types.js";
import { heapify, partial_heapsort } from "./heap.js";
import { add_log_entry, get_element, CategoryInput, empty_container } from "./dom_utils.js";
import { get_db_manager, refresh, get_category_titles, locate_category } from "./index.js";
import { renderPattern, repr } from "./vocab.js";
import { dijkstra, build_graph, type AdjacencyList } from "./graph_utils.js";

const page_size: number = 5;

let storage_category_input: CategoryInput | undefined = undefined;
let heap_ptr = -1;
let pages: Item[][] = [];
let items_heap: Item[] = [];
let current_category: Category | undefined = undefined;
let current_page: number = 0;
let item_comparator: ((a: Item, b: Item) => boolean) = item_less;

function get_item_comparator(weights: Map<number, number>, adjaceny_list: AdjacencyList): (a: Item, b: Item) => boolean {
    const priorities = dijkstra(build_graph(Array.from(weights.keys()), weights, adjaceny_list), "start");

    return (a: Item, b: Item): boolean => {
        if (a.status != b.status) return a.status > b.status;
        if (a.expiration_date != b.expiration_date) return a.expiration_date < b.expiration_date;
        
        if(!priorities.has(a.box_id) || !priorities.has(b.box_id)) {
            return true;
        }

        return priorities.get(a.box_id)! < priorities.get(b.box_id)!;
    }
}

function get_category_input(): CategoryInput {
    if (!storage_category_input) throw new Error("Storage category input is not initialized");
    return storage_category_input;
}

function next_page() {
    if (heap_ptr == -1) return; // reached the end of the heap

    const { sorted, ptr } = partial_heapsort(items_heap, heap_ptr, page_size, item_comparator);
    pages.push(sorted);
    heap_ptr = ptr;
}

function render_item(item: Item): HTMLElement {
    const itemCard = document.createElement("div");
    itemCard.className = "item-card";

    const itemInfo = document.createElement("div");
    itemInfo.className = "item-info";

    const itemCaption = document.createElement("div");
    itemCaption.className = "item-caption";
    const date_str = new Date(item.expiration_date).toLocaleDateString();
    const status_str = renderPattern(item.status === 0 ? "status_0" : "status_1");
    itemCaption.textContent = renderPattern("list_item_label", {
        date: date_str,
        status: status_str
    });

    const itemMeta = document.createElement("div");
    itemMeta.className = "item-meta";
    itemMeta.textContent = `${renderPattern("box")} ${item.box_id}`;

    itemInfo.appendChild(itemCaption);
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

            const new_status = item.status === 0 ? 1 : 0;
            await get_db_manager().update_item(item.id, { status: new_status });
            const new_status_str = renderPattern(new_status === 0 ? "status_0" : "status_1");

            add_log_entry(renderPattern("log_update_status", {
                meta: repr(item),
                status: new_status_str
            }), "storageLog");

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
                meta: repr(item)
            }), "storageLog");

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
    return Math.ceil(items_heap.length / page_size);
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

        if (current_category === undefined) { return; }

        const items = await manager.get_items(current_category.title);
        items_heap = [...items];
        heap_ptr = items_heap.length - 1;

        if(!item_comparator) throw new Error("Item comparator is not initialized");
        heapify(items_heap, item_comparator);
    } catch (error) {
        console.error("Failed to load items:", error);
    }
}

async function refresh_item_comparator() {
    const manager = get_db_manager();
    const box_adjacency = await manager.get_box_adjacency();
    const weights = await manager.get_box_weights();
    const weights_map = new Map<number, number>(weights.map(entry => [entry.box_id, entry.total_weight]));
    item_comparator = get_item_comparator(weights_map, box_adjacency);
}

function update_selected_category(new_category: Category | undefined) {
    current_category = new_category;
}

export function init_item_management() {
    const storageFilterCard = get_element<HTMLDivElement>("storageFilterCard");

    storage_category_input = new CategoryInput(
        "storageCategoryInput",
        get_category_titles(),
        renderPattern("item_placeholder"),
        async (val) => {
            update_selected_category(locate_category(val));
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

export async function refresh_item_management() {
    const category_input = get_category_input();
    category_input.categories = get_category_titles();

    update_selected_category(locate_category(current_category?.title ?? ""));
    await refresh_item_comparator();
    await load_items();    
    render_current_page();
}