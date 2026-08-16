import { add_log_entry, get_element, DynamicForm } from "./dom_utils.js";
import { get_db_manager, refresh, get_categories_list } from "./index.js";
import { renderPattern } from "./vocab.js";
let category_form = undefined;
async function add_category() {
    if (!category_form)
        return;
    const manager = get_db_manager();
    const values = category_form.get_values();
    const category = String(values["newCategory"] ?? "").trim();
    try {
        if (!category)
            throw new Error("Category cannot be empty");
        if (get_categories_list().includes(category))
            throw new Error("Category already exists");
        await manager.add_categories(category);
        category_form.reset();
        add_log_entry(renderPattern("log_add_cat", { val: category }), "categoriesLog");
        await refresh();
    }
    catch (error) {
        console.error("Failed to add category:", error);
        add_log_entry(renderPattern("log_add_cat_fail"), "categoriesLog", true);
    }
}
export function init_category_management() {
    const categoryCard = get_element("categoryCard");
    category_form = new DynamicForm([
        {
            name: "newCategory",
            label: "",
            placeholder: renderPattern("category_input"),
            type: "text"
        }
    ], renderPattern("add_category_btn"), async () => {
        await add_category();
    });
    category_form.form.id = "categoryForm";
    categoryCard.appendChild(category_form.form);
}
export function refresh_category_management(categories) {
    const categoriesList = document.getElementById("categoriesList");
    if (!categoriesList)
        return;
    categoriesList.innerHTML = "";
    const manager = get_db_manager();
    for (const cat of categories) {
        const card = document.createElement("div");
        card.className = "item-card";
        const info = document.createElement("div");
        info.className = "item-info";
        info.textContent = cat;
        const btnGroup = document.createElement("div");
        btnGroup.className = "button-group";
        btnGroup.style.marginTop = "0";
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-danger";
        deleteBtn.textContent = renderPattern("btn_delete");
        deleteBtn.addEventListener("click", async () => {
            try {
                await manager.remove_category(cat);
                add_log_entry(renderPattern("log_delete_cat", { val: cat }), "categoriesLog");
                await refresh();
            }
            catch (error) {
                console.error("Failed to delete category:", error);
                add_log_entry(renderPattern("log_delete_cat_fail"), "categoriesLog", true);
            }
        });
        btnGroup.appendChild(deleteBtn);
        card.appendChild(info);
        card.appendChild(btnGroup);
        categoriesList.appendChild(card);
    }
}
//# sourceMappingURL=category_management.js.map