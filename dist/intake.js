import { add_log_entry, get_element, DynamicForm, CategoryInput } from "./dom_utils.js";
import { get_db_manager, refresh, get_categories_list } from "./index.js";
import { renderPattern } from "./vocab.js";
import { Item } from "./types.js";
let intake_form = undefined;
function log_item_addition(success, category, expiryDate, boxNumber) {
    if (success && category && expiryDate && boxNumber !== undefined) {
        const dateStr = expiryDate.toLocaleDateString();
        add_log_entry(renderPattern("log_add_item", {
            cat: category,
            date: dateStr,
            box: boxNumber
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
    const categories = get_categories_list();
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
        await manager.add_item(category, new Item(expiry_date.getTime(), box_number, status));
        log_item_addition(true, category, expiry_date, box_number);
        await refresh();
    }
    catch (error) {
        console.error("Failed to add item:", error);
        log_item_addition(false);
    }
}
export function init_intake() {
    const intakeCard = get_element("intakeCard");
    const categories = get_categories_list();
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
            type: "int"
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
export function refresh_intake(categories) {
    const categoryField = intake_form?.get_field("categoryInput");
    if (!categoryField)
        throw new Error("Category field is not initialized");
    categoryField.categories = categories;
}
//# sourceMappingURL=intake.js.map