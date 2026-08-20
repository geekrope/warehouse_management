import { get_element, add_log_entry } from "./dom_utils.js";
import { get_db_manager, reload_categories } from "./index.js";
function updateHighlight(code_block, input) {
    let content = input.value;
    if (content.endsWith('\n')) {
        content += ' ';
    }
    code_block.textContent = content;
    code_block.removeAttribute('data-highlighted');
    hljs.highlightElement(code_block);
}
export function init_dashboard() {
    const query_editor = get_element("queryEditor");
    const query_editor_input = get_element("queryEditorInput");
    const mutation_editor = get_element("mutationEditor");
    const mutation_editor_input = get_element("mutationEditorInput");
    query_editor_input.oninput = () => {
        updateHighlight(query_editor, query_editor_input);
    };
    mutation_editor.oninput = () => {
        updateHighlight(query_editor, query_editor_input);
    };
    const executeQueryBtn = get_element("executeSelectBtn");
    executeQueryBtn.addEventListener("click", async () => {
        await execute_read_query();
    });
    const executeMutationBtn = get_element("executeMutationBtn");
    executeMutationBtn.addEventListener("click", async () => {
        await execute_mutation_query();
    });
    const clearQueryBtn = get_element("clearSelectBtn");
    clearQueryBtn.addEventListener("click", () => {
        query_editor.innerHTML = "";
        const resultsContainer = get_element("queryResultsContainer");
        resultsContainer.innerHTML = "";
    });
    const clearMutationBtn = get_element("clearMutationBtn");
    clearMutationBtn.addEventListener("click", () => {
        mutation_editor.innerHTML = "";
        const statusContainer = get_element("mutationStatusContainer");
        statusContainer.innerHTML = "";
    });
    document.querySelectorAll(".dashboard-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const sql = btn.getAttribute("data-sql");
            const target = btn.getAttribute("data-target");
            if (sql && target === "query" && query_editor) {
                query_editor_input.value = sql;
                updateHighlight(query_editor, query_editor_input);
            }
            else if (sql && target === "mutation" && mutation_editor) {
                mutation_editor_input.value = sql;
                updateHighlight(mutation_editor, mutation_editor_input);
            }
        });
    });
}
export async function refresh_dashboard() {
    // Not implemented
}
async function execute_read_query() {
    const query_editor_input = get_element("queryEditorInput");
    const sql = query_editor_input.value;
    const resultsContainer = get_element("queryResultsContainer");
    if (!sql) {
        add_log_entry("Query cannot be empty", "dashboardLog", true);
        return;
    }
    try {
        const start_time = performance.now();
        const manager = get_db_manager();
        const results = await manager.execute_raw(sql, []);
        const elapsed = (performance.now() - start_time).toFixed(2);
        resultsContainer.innerHTML = "";
        if (results.length === 0) {
            add_log_entry(`Query executed successfully (${elapsed} ms, 0 rows)`, "dashboardLog");
            return;
        }
        for (const res of results) {
            const metaInfo = document.createElement("div");
            metaInfo.className = "query-status success";
            metaInfo.textContent = `Executed in ${elapsed} ms. ${res.values.length} row(s) returned.`;
            resultsContainer.appendChild(metaInfo);
            const tableWrapper = document.createElement("div");
            tableWrapper.className = "dashboard-table-wrapper";
            const table = document.createElement("table");
            table.className = "data-table dashboard-table";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            for (const col of res.columns) {
                const th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
            const tbody = document.createElement("tbody");
            for (const row of res.values) {
                const tr = document.createElement("tr");
                for (const cell of row) {
                    const td = document.createElement("td");
                    if (cell === null || cell === undefined) {
                        td.innerHTML = `<span class="cell-null">NULL</span>`;
                    }
                    else if (typeof cell === "boolean") {
                        td.innerHTML = `<span class="cell-bool">${cell ? "TRUE" : "FALSE"}</span>`;
                    }
                    else {
                        td.textContent = String(cell);
                    }
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            resultsContainer.appendChild(tableWrapper);
        }
        add_log_entry(`Read query success (${elapsed} ms)`, "dashboardLog");
    }
    catch (err) {
        resultsContainer.innerHTML = `<div class="query-status error">Error: ${err.message || String(err)}</div>`;
        add_log_entry(`Query error: ${err.message || String(err)}`, "dashboardLog", true);
    }
}
async function execute_mutation_query() {
    const mutation_editor = get_element("mutationEditorInput");
    const sql = mutation_editor.value;
    const statusContainer = get_element("mutationStatusContainer");
    if (!sql) {
        add_log_entry("Mutation statement cannot be empty", "dashboardLog", true);
        return;
    }
    try {
        const start_time = performance.now();
        const manager = get_db_manager();
        await manager.run_raw(sql, []);
        const elapsed = (performance.now() - start_time).toFixed(2);
        await reload_categories();
        statusContainer.innerHTML = `<div class="query-status success">Mutation executed and saved in ${elapsed} ms. Foreign keys enforced.</div>`;
        add_log_entry(`Mutation success (${elapsed} ms): ${sql.substring(0, 60)}...`, "dashboardLog");
    }
    catch (err) {
        statusContainer.innerHTML = `<div class="query-status error">Execution failed: ${err.message || String(err)}</div>`;
        add_log_entry(`Mutation error: ${err.message || String(err)}`, "dashboardLog", true);
    }
}
//# sourceMappingURL=dashboard.js.map