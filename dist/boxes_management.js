import { add_log_entry, empty_container } from "./dom_utils.js";
import { get_db_manager, refresh } from "./index.js";
import { renderPattern, repr } from "./vocab.js";
import { Item } from "./types.js";
export class BoxElement {
    box_id;
    box_weight;
    container;
    items_list_container;
    constructor(box_id, box_weight, item_elements = []) {
        this.box_id = box_id;
        this.box_weight = box_weight;
        this.container = document.createElement("div");
        this.container.className = "box-card";
        const header = document.createElement("div");
        header.className = "box-header";
        const title = document.createElement("span");
        title.className = "box-title";
        title.textContent = `📦 ${renderPattern("box")} ${box_id}, ${renderPattern("weight", { "weight": box_weight })}`;
        const badge = document.createElement("span");
        badge.className = "count-badge";
        badge.textContent = renderPattern("box_item_count", { count: item_elements.length });
        header.appendChild(title);
        header.appendChild(badge);
        this.items_list_container = document.createElement("div");
        this.items_list_container.className = "box-items-list";
        this.items_list_container.style.overflowY = "auto";
        this.items_list_container.style.maxHeight = "300px";
        for (const el of item_elements) {
            this.items_list_container.appendChild(el);
        }
        this.container.appendChild(header);
        this.container.appendChild(this.items_list_container);
        this.bind_drop_events();
    }
    bind_drop_events() {
        this.container.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "move";
            }
            this.container.classList.add("drag-over");
        });
        this.container.addEventListener("dragleave", (_e) => {
            this.container.classList.remove("drag-over");
        });
        this.container.addEventListener("drop", async (e) => {
            e.preventDefault();
            this.container.classList.remove("drag-over");
            if (!e.dataTransfer)
                return;
            let raw_content;
            let item;
            try {
                raw_content = JSON.parse(e.dataTransfer?.getData("text/plain"));
                item = Item.from(raw_content);
                if (item.id === undefined)
                    return;
            }
            catch (err) {
                if (err instanceof SyntaxError || err instanceof TypeError) {
                    return;
                }
                else {
                    throw err;
                }
            }
            try {
                const manager = get_db_manager();
                await manager.update_item(item.id, { box_id: this.box_id });
                add_log_entry(renderPattern("log_move", {
                    meta: repr(item, raw_content["category"]),
                    box: this.box_id
                }), "boxesLog");
                await refresh();
            }
            catch (err) {
                console.error("Failed to move item to box:", err);
                add_log_entry(renderPattern("log_move_fail", {
                    meta: repr(item, raw_content["category"]),
                    box: this.box_id
                }), "boxesLog", true);
            }
        });
    }
}
export function create_draggable_item_element(item, category) {
    const card = document.createElement("div");
    card.className = "item-card draggable-item-card";
    card.draggable = true;
    const info = document.createElement("div");
    info.className = "item-info";
    const date = document.createElement("div");
    date.className = "item-date";
    const date_str = new Date(item.expiration_date).toLocaleDateString();
    const status_str = renderPattern(item.status === 0 ? "status_0" : "status_1");
    date.textContent = renderPattern("list_item_label", {
        date: date_str,
        status: status_str
    });
    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = category;
    info.appendChild(date);
    info.appendChild(meta);
    card.appendChild(info);
    card.addEventListener("dragstart", (e) => {
        if (e.dataTransfer) {
            const composite_data = {
                ...item,
                category: category
            };
            e.dataTransfer.setData("text/plain", JSON.stringify(composite_data));
            e.dataTransfer.effectAllowed = "move";
        }
    });
    return card;
}
export async function refresh_boxes_management() {
    const boxes_container = document.getElementById("boxesContainer");
    if (!boxes_container)
        return;
    boxes_container.innerHTML = "";
    const manager = get_db_manager();
    const boxes = await manager.get_boxes();
    const box_weights = await manager.get_box_weights();
    const zipped_boxes = boxes.map(box_id => {
        const weight_entry = box_weights.find(entry => entry.box_id === box_id);
        return { box_id, total_weight: weight_entry ? weight_entry.total_weight : 0 };
    });
    if (boxes.length === 0) {
        boxes_container.appendChild(empty_container());
        return;
    }
    for (const { box_id, total_weight } of zipped_boxes) {
        const items = await manager.get_box_content(box_id);
        const item_elements = items.map(pair => create_draggable_item_element(pair.item, pair.category));
        const box_el = new BoxElement(box_id, total_weight, item_elements);
        boxes_container.appendChild(box_el.container);
    }
}
export function init_boxes_management() {
    add_log_entry(renderPattern("initial_log"), "boxesLog");
}
//# sourceMappingURL=boxes_management.js.map