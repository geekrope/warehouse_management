import { add_log_entry, empty_container, get_element, DynamicForm } from "./dom_utils.js";
import { get_db_manager } from "./index.js";
import { renderPattern, repr } from "./vocab.js";
import { Item } from "./types.js";
import { dijkstra, build_graph, detect_cycle } from "./graph_utils.js";
let network_instance = null;
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
            let item;
            try {
                const raw_content = JSON.parse(e.dataTransfer?.getData("text/plain"));
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
                    meta: repr(item),
                    box: this.box_id
                }), "boxesLog");
                await refresh_boxes_management();
            }
            catch (err) {
                console.error("Failed to move item to box:", err);
                add_log_entry(renderPattern("log_move_fail", {
                    meta: repr(item),
                    box: this.box_id
                }), "boxesLog", true);
            }
        });
    }
}
async function add_edge(edgeData, callback) {
    const v = Number(edgeData.from);
    const u = Number(edgeData.to);
    const staged = [...this.adjacency, { v, u }];
    const labels = this.boxes.map((box) => { return [box, 0]; });
    const has_cycle = detect_cycle(build_graph(this.boxes, this.weights, staged), new Map(labels), v);
    if (has_cycle) {
        callback(null);
        console.log("Adding this edge would create a cycle. Operation canceled.");
        return;
    }
    try {
        await get_db_manager().add_box_connections([{ v, u }]);
        await refresh_boxes_management();
        callback(edgeData);
    }
    catch (err) {
        console.error("An error occurred while adding the edge:", err);
        callback(null);
    }
}
async function delete_edge(edgeData, callback) {
    try {
        for (const edgeId of edgeData.edges) {
            const edge = network_instance.body.data.edges.get(edgeId);
            if (edge) {
                await get_db_manager().remove_box_connection(Number(edge.from), Number(edge.to));
            }
        }
        await refresh_boxes_management();
        callback(edgeData);
    }
    catch (err) {
        console.error("An error occurred while deleting the edge:", err);
        callback(null);
    }
}
export function render_box_graph(container, boxes, weights, adjacency) {
    if (typeof vis === "undefined")
        throw Error("vis-network library is not loaded.");
    container.innerHTML = "";
    if (boxes.length === 0) {
        container.appendChild(empty_container());
        return;
    }
    const graph = build_graph(boxes, weights, adjacency);
    const access_scores = dijkstra(graph, "start");
    const all_nodes_set = new Set(boxes);
    for (const { v, u } of adjacency) {
        if (boxes.includes(v))
            all_nodes_set.add(v);
        if (boxes.includes(u))
            all_nodes_set.add(u);
    }
    const nodes = Array.from(all_nodes_set).map(id => {
        const weight = weights.get(id) ?? 0;
        const access_cost = access_scores.get(id) ?? 0;
        const is_root = access_cost === 0;
        return {
            id,
            label: renderPattern("graph_box_label", {
                id,
                weight,
                cost: access_cost
            }),
            shape: "box",
            margin: 10,
            color: {
                background: is_root ? "#27ae60" : "#3498db",
                border: is_root ? "#1e8449" : "#2980b9",
                highlight: {
                    background: "#e67e22",
                    border: "#d35400"
                }
            },
            font: {
                color: "#ffffff",
                face: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                size: 13,
                bold: { mod: "bold" }
            }
        };
    });
    const edges = [];
    for (const { v, u } of adjacency) {
        if (all_nodes_set.has(v) && all_nodes_set.has(u)) {
            edges.push({
                from: v,
                to: u,
                arrows: "to",
                color: { color: "#95a5a6", highlight: "#e67e22" }
            });
        }
    }
    const data = { nodes, edges };
    const empty_handler = (_param, callback) => {
        callback(null);
        console.log(false, "This handler is disabled");
    };
    const options = {
        layout: {
            hierarchical: {
                direction: "UD",
                sortMethod: "directed"
            }
        },
        physics: {
            enabled: true,
            solver: "forceAtlas2Based"
        },
        interaction: {
            hover: true,
            dragNodes: true,
            zoomView: true
        },
        manipulation: {
            enabled: true,
            addNode: false,
            editEdge: empty_handler,
            deleteNode: false,
            addEdge: add_edge.bind({ adjacency, boxes, weights }),
            deleteEdge: delete_edge
        }
    };
    network_instance = new vis.Network(container, data, options);
}
export function render_weights_table(container, boxes, weights, adjacency) {
    container.innerHTML = "";
    if (boxes.length === 0)
        return;
    const graph = build_graph(boxes, weights, adjacency);
    const access_scores = dijkstra(graph, "start");
    const sorted_boxes = [...boxes].sort((a, b) => a - b);
    const table = document.createElement("table");
    table.className = "data-table";
    const thead = document.createElement("thead");
    const header_tr = document.createElement("tr");
    const th_box = document.createElement("th");
    th_box.textContent = renderPattern("th_box");
    const th_weight = document.createElement("th");
    th_weight.textContent = renderPattern("th_weight");
    const th_cost = document.createElement("th");
    th_cost.textContent = renderPattern("th_access_cost");
    header_tr.appendChild(th_box);
    header_tr.appendChild(th_weight);
    header_tr.appendChild(th_cost);
    thead.appendChild(header_tr);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (const box_id of sorted_boxes) {
        const tr = document.createElement("tr");
        const td_box = document.createElement("td");
        td_box.textContent = `📦 ${renderPattern("box")} ${box_id}`;
        td_box.style.fontWeight = "600";
        const td_weight = document.createElement("td");
        td_weight.textContent = `${weights.get(box_id) ?? 0} г`;
        const td_cost = document.createElement("td");
        const cost = access_scores.get(box_id) ?? 0;
        const badge = document.createElement("span");
        badge.className = `badge-cost ${cost === 0 ? "direct" : "blocked"}`;
        badge.textContent = cost === 0 ? renderPattern("direct_access") : `${cost} г`;
        td_cost.appendChild(badge);
        tr.appendChild(td_box);
        tr.appendChild(td_weight);
        tr.appendChild(td_cost);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}
let drag_autoscroll_active = false;
let current_cursor_x = 0;
let current_cursor_y = 0;
let animation_frame_id = null;
const BOUNDARY_THRESHOLD = 80;
const MAX_SCROLL_SPEED = 22;
function autoscroll_step() {
    if (!drag_autoscroll_active) {
        animation_frame_id = null;
        return;
    }
    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;
    let deltaX = 0;
    let deltaY = 0;
    if (current_cursor_y < BOUNDARY_THRESHOLD) {
        const factor = Math.min(1, Math.max(0, (BOUNDARY_THRESHOLD - current_cursor_y) / BOUNDARY_THRESHOLD));
        deltaY = -Math.max(2, Math.round(factor * MAX_SCROLL_SPEED));
    }
    else if (current_cursor_y > vHeight - BOUNDARY_THRESHOLD) {
        const factor = Math.min(1, Math.max(0, (current_cursor_y - (vHeight - BOUNDARY_THRESHOLD)) / BOUNDARY_THRESHOLD));
        deltaY = Math.max(2, Math.round(factor * MAX_SCROLL_SPEED));
    }
    if (current_cursor_x < BOUNDARY_THRESHOLD) {
        const factor = Math.min(1, Math.max(0, (BOUNDARY_THRESHOLD - current_cursor_x) / BOUNDARY_THRESHOLD));
        deltaX = -Math.max(2, Math.round(factor * MAX_SCROLL_SPEED));
    }
    else if (current_cursor_x > vWidth - BOUNDARY_THRESHOLD) {
        const factor = Math.min(1, Math.max(0, (current_cursor_x - (vWidth - BOUNDARY_THRESHOLD)) / BOUNDARY_THRESHOLD));
        deltaX = Math.max(2, Math.round(factor * MAX_SCROLL_SPEED));
    }
    if (deltaX !== 0 || deltaY !== 0) {
        const main_wrapper = document.querySelector(".main-wrapper");
        if (main_wrapper) {
            main_wrapper.scrollTop += deltaY;
            main_wrapper.scrollLeft += deltaX;
        }
        window.scrollBy(deltaX, deltaY);
    }
    animation_frame_id = requestAnimationFrame(autoscroll_step);
}
function start_drag_autoscroll(e) {
    drag_autoscroll_active = true;
    if (e.clientX !== 0 || e.clientY !== 0) {
        current_cursor_x = e.clientX;
        current_cursor_y = e.clientY;
    }
    if (!animation_frame_id) {
        animation_frame_id = requestAnimationFrame(autoscroll_step);
    }
}
function update_drag_autoscroll_cursor(e) {
    if (e.clientX !== 0 || e.clientY !== 0) {
        current_cursor_x = e.clientX;
        current_cursor_y = e.clientY;
    }
}
function stop_drag_autoscroll() {
    drag_autoscroll_active = false;
    if (animation_frame_id !== null) {
        cancelAnimationFrame(animation_frame_id);
        animation_frame_id = null;
    }
}
export function create_draggable_item_element(item) {
    const card = document.createElement("div");
    card.className = "item-card draggable-item-card";
    card.draggable = true;
    const info = document.createElement("div");
    info.className = "item-info";
    const caption = document.createElement("div");
    caption.className = "item-caption";
    const date_str = new Date(item.expiration_date).toLocaleDateString();
    const status_str = renderPattern(item.status === 0 ? "status_0" : "status_1");
    caption.textContent = renderPattern("list_item_label", {
        date: date_str,
        status: status_str
    });
    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = item.category;
    info.appendChild(caption);
    info.appendChild(meta);
    card.appendChild(info);
    card.addEventListener("dragstart", (e) => {
        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", JSON.stringify(item));
            e.dataTransfer.effectAllowed = "move";
        }
        start_drag_autoscroll(e);
    });
    card.addEventListener("drag", (e) => {
        update_drag_autoscroll_cursor(e);
    });
    card.addEventListener("dragend", () => {
        stop_drag_autoscroll();
    });
    return card;
}
export async function refresh_boxes_management() {
    const boxes_container = get_element("boxesContainer");
    const graph_container = get_element("boxesGraphContainer");
    const table_container = get_element("boxesWeightsTableContainer");
    boxes_container.innerHTML = "";
    const manager = get_db_manager();
    const boxes = await manager.get_boxes();
    const box_weights = await manager.get_box_weights();
    const weight_map = new Map(box_weights.map(entry => [entry.box_id, entry.total_weight]));
    const zipped_boxes = boxes.map(box_id => {
        return { box_id, total_weight: weight_map.get(box_id) ?? 0 };
    });
    if (boxes.length === 0) {
        boxes_container.appendChild(empty_container());
        if (graph_container) {
            graph_container.innerHTML = "";
            graph_container.appendChild(empty_container());
        }
        if (table_container) {
            table_container.innerHTML = "";
        }
        return;
    }
    for (const { box_id, total_weight } of zipped_boxes) {
        const items = await manager.get_box_content(box_id);
        const item_elements = items.map(item => create_draggable_item_element(item));
        const box_el = new BoxElement(box_id, total_weight, item_elements);
        boxes_container.appendChild(box_el.container);
    }
    const box_adjacency_list = await manager.get_box_adjacency();
    render_box_graph(graph_container, boxes, weight_map, box_adjacency_list);
    render_weights_table(table_container, boxes, weight_map, box_adjacency_list);
}
export function init_boxes_management() {
    const form = new DynamicForm([
        {
            name: "boxNumber",
            type: "number",
            label: renderPattern("label_add_box"),
            required: true
        }
    ], renderPattern("add_box_btn"), async (values) => {
        const number = Number(values["boxNumber"]);
        const manager = get_db_manager();
        if (isNaN(number))
            throw new Error("Box number field is not initialized");
        await manager.add_box(number);
        await refresh_boxes_management();
    });
    const form_container = get_element("boxAddCard");
    form_container.appendChild(form.form);
    add_log_entry(renderPattern("initial_log"), "boxesLog");
    document.addEventListener("dragover", (e) => {
        if (drag_autoscroll_active) {
            update_drag_autoscroll_cursor(e);
        }
    });
    document.addEventListener("dragend", () => {
        stop_drag_autoscroll();
    });
    document.addEventListener("drop", () => {
        stop_drag_autoscroll();
    });
    const boxesTab = document.querySelector('[data-page="boxes"]');
    if (boxesTab) {
        boxesTab.addEventListener("click", () => {
            setTimeout(() => {
                network_instance?.fit();
            }, 50);
        });
    }
    add_log_entry(renderPattern("initial_log"), "boxesLog");
}
//# sourceMappingURL=boxes_management.js.map