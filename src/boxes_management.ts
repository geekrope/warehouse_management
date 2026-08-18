import { add_log_entry, empty_container, get_element } from "./dom_utils.js";
import { get_db_manager, refresh } from "./index.js";
import { renderPattern, repr } from "./vocab.js";
import { Item } from "./types.js";
import { dijkstra, build_graph, type AdjacencyList } from "./graph_utils.js";
import box_adjacency_list from "./warehouse_layout.json" with { type: "json" };

declare const vis: any;

let network_instance: any = null;

export class BoxElement {
    public container: HTMLDivElement;
    private items_list_container: HTMLDivElement;

    constructor(
        public box_id: number,
        public box_weight: number,
        item_elements: HTMLElement[] = []
    ) {
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

    private bind_drop_events(): void {
        this.container.addEventListener("dragover", (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "move";
            }
            this.container.classList.add("drag-over");
        });

        this.container.addEventListener("dragleave", (_e: DragEvent) => {
            this.container.classList.remove("drag-over");
        });

        this.container.addEventListener("drop", async (e: DragEvent) => {
            e.preventDefault();
            this.container.classList.remove("drag-over");

            if (!e.dataTransfer) return;

            let item: Item;

            try {
                const raw_content = JSON.parse(e.dataTransfer?.getData("text/plain"));

                item = Item.from(raw_content);
                if (item.id === undefined) return;
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

                add_log_entry(
                    renderPattern("log_move", {
                        meta: repr(item),
                        box: this.box_id
                    }),
                    "boxesLog"
                );

                await refresh();
            } catch (err) {
                console.error("Failed to move item to box:", err);
                add_log_entry(
                    renderPattern("log_move_fail", {
                        meta: repr(item),
                        box: this.box_id
                    }),
                    "boxesLog",
                    true
                );
            }
        });
    }
}

export function render_box_graph(
    container: HTMLElement,
    boxes: number[],
    weights: Map<number, number>,
    adjacency: AdjacencyList = box_adjacency_list
) {
    if (typeof vis === "undefined") throw Error("vis-network library is not loaded.");

    container.innerHTML = "";

    if (boxes.length === 0) {
        container.appendChild(empty_container());
        return;
    }

    const graph = build_graph(boxes, weights, adjacency);
    const access_scores = dijkstra(graph, "start");

    const all_nodes_set = new Set<number>(boxes);
    for (const [from_str, to] of Object.entries(adjacency)) {
        const from = parseInt(from_str);
        if (boxes.includes(from)) all_nodes_set.add(from);
        if (boxes.includes(to)) all_nodes_set.add(to);
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

    const edges: { from: number, to: number, label?: string, arrows: string, color?: any }[] = [];
    for (const [from_str, to] of Object.entries(adjacency)) {
        const from = parseInt(from_str);
        if (all_nodes_set.has(from) && all_nodes_set.has(to)) {
            edges.push({
                from,
                to,
                arrows: "to",
                color: { color: "#95a5a6", highlight: "#e67e22" }
            });
        }
    }

    const data = { nodes, edges };
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
        }
    };

    network_instance = new vis.Network(container, data, options);
}

export function render_weights_table(
    container: HTMLElement,
    boxes: number[],
    weights: Map<number, number>,
    adjacency: AdjacencyList = box_adjacency_list
) {
    container.innerHTML = "";

    if (boxes.length === 0) return;

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

export function create_draggable_item_element(item: Item): HTMLElement {
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
    meta.textContent = item.category;

    info.appendChild(date);
    info.appendChild(meta);
    card.appendChild(info);

    card.addEventListener("dragstart", (e: DragEvent) => {
        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", JSON.stringify(item));
            e.dataTransfer.effectAllowed = "move";
        }
    });

    return card;
}

export async function refresh_boxes_management(): Promise<void> {
    const boxes_container = get_element<HTMLDivElement>("boxesContainer");
    const graph_container = get_element<HTMLDivElement>("boxesGraphContainer");
    const table_container = get_element<HTMLDivElement>("boxesWeightsTableContainer");

    boxes_container.innerHTML = "";

    const manager = get_db_manager();
    const boxes = await manager.get_boxes();
    const box_weights = await manager.get_box_weights();
    const weight_map = new Map<number, number>(box_weights.map(entry => [entry.box_id, entry.total_weight]));

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

    render_box_graph(graph_container, boxes, weight_map, box_adjacency_list);
    render_weights_table(table_container, boxes, weight_map, box_adjacency_list);
}

export function init_boxes_management(): void {
    add_log_entry(renderPattern("initial_log"), "boxesLog");

    const boxesTab = document.querySelector('[data-page="boxes"]');
    if (boxesTab) {
        boxesTab.addEventListener("click", () => {
            setTimeout(() => {
                network_instance?.fit();
            }, 50);
        });
    }
}