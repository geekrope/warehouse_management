import { add_log_entry, get_element, DynamicForm, CategoryInput } from "./dom_utils.js";
import { get_db_manager, refresh, get_category_titles } from "./index.js";
import { renderPattern } from "./vocab.js";
import { Item } from "./types.js";
let intake_form = undefined;
function log_item_addition(success, item) {
    if (success && item) {
        const date_str = new Date(item.expiration_date).toLocaleDateString();
        add_log_entry(renderPattern("log_add_item", {
            cat: item.category,
            date: date_str,
            box: item.box_id
        }), "intakeLog");
    }
    else {
        add_log_entry(renderPattern("log_add_fail"), "intakeLog", true);
    }
}
async function add_item() {
    if (!intake_form)
        throw new Error("Intake form is not initialized");
    const manager = get_db_manager();
    const values = intake_form.get_values();
    const categories = get_category_titles();
    const category = String(values["categoryInput"] ?? "").trim();
    const expiry_date = values["expiryDate"] instanceof Date ? values["expiryDate"] : undefined;
    const box_number = typeof values["boxNumber"] === "number" ? values["boxNumber"] : NaN;
    const status = typeof values["status"] === "number" ? values["status"] : 0;
    try {
        if (!category || !expiry_date || isNaN(box_number) || isNaN(expiry_date.getTime())) {
            throw new Error("Invalid input values");
        }
        if (!categories.includes(category))
            throw new Error("Category does not exist");
        const item = new Item(category, expiry_date.getTime(), box_number, status);
        await manager.add_items(item);
        log_item_addition(true, item);
        await refresh();
    }
    catch (error) {
        console.error("Failed to add item:", error);
        log_item_addition(false);
    }
}
export function init_intake() {
    const intakeCard = get_element("intakeCard");
    const categories = get_category_titles();
    intake_form = new DynamicForm([
        {
            name: "categoryInput",
            label: renderPattern("category_input"),
            placeholder: renderPattern("item_placeholder"),
            type: "categorical",
            categories: categories
        },
        {
            name: "expiryDate",
            label: renderPattern("label_expiry"),
            type: "date"
        },
        {
            name: "boxNumber",
            label: renderPattern("label_box"),
            type: "number"
        },
        {
            name: "status",
            label: renderPattern("label_status"),
            type: "select",
            options: [
                { value: 0, label: renderPattern("status_0") },
                { value: 1, label: renderPattern("status_1") }
            ]
        }
    ], renderPattern("register_item_btn"), async () => {
        await add_item();
    });
    intake_form.form.id = "intakeForm";
    intakeCard.appendChild(intake_form.form);
}
export function refresh_intake() {
    const category_field = intake_form?.get_field("categoryInput");
    if (!category_field)
        throw new Error("Category field is not initialized");
    category_field.categories = get_category_titles();
}
//# sourceMappingURL=intake.js.map