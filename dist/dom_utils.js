export function get_element(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found.`);
    return el;
}
export function add_log_entry(message, container_id, is_error = false) {
    const log_element = document.getElementById(container_id);
    if (!log_element)
        return;
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    if (is_error)
        entry.style.color = "red";
    log_element.appendChild(entry);
    log_element.scrollTop = log_element.scrollHeight;
}
export class CategoryInput {
    container;
    input;
    datalist;
    on_change;
    _categories = [];
    constructor(input_name, categories = [], placeholder = "", on_change) {
        const datalistId = `${input_name}-datalist`;
        this.container = document.createElement("div");
        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.id = input_name;
        this.input.name = input_name;
        this.input.placeholder = placeholder;
        this.input.setAttribute("list", datalistId);
        this.datalist = document.createElement("datalist");
        this.datalist.id = datalistId;
        this.container.appendChild(this.input);
        this.container.appendChild(this.datalist);
        this.on_change = on_change;
        this.input.addEventListener("input", this.onChange.bind(this));
        this.input.addEventListener("change", this.onChange.bind(this));
        this.categories = categories;
    }
    onChange(_event) {
        this.update_datalist(this.input.value);
        if (this.on_change) {
            this.on_change(this.input.value.trim());
        }
    }
    get categories() {
        return this._categories;
    }
    set categories(newCategories) {
        this._categories = newCategories;
        this.update_datalist(this.input.value);
    }
    update_datalist(filter_value = "") {
        this.datalist.innerHTML = "";
        if (this.categories.includes(filter_value))
            return;
        const query = filter_value.toLowerCase();
        const filtered = this._categories.filter(cat => cat.toLowerCase().includes(query));
        for (const cat of filtered) {
            const option = document.createElement("option");
            option.value = cat;
            this.datalist.appendChild(option);
        }
    }
    get value() {
        return this.input.value.trim();
    }
    set value(val) {
        this.input.value = val;
        this.update_datalist(val);
    }
}
export class DynamicForm {
    form;
    fields = new Map();
    submitButton;
    constructor(schema, submitLabel = "Submit", onSubmit) {
        this.form = document.createElement("form");
        for (const field of schema) {
            this.add_field(field);
        }
        this.submitButton = this.build_submit_button(submitLabel);
        this.form.appendChild(this.submitButton);
        if (onSubmit) {
            this.form.addEventListener("submit", (e) => {
                e.preventDefault();
                onSubmit(this.get_values());
            });
        }
    }
    add_field(field) {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";
        const label = document.createElement("label");
        label.textContent = field.label;
        label.htmlFor = field.name;
        formGroup.appendChild(label);
        let control;
        switch (field.type) {
            case "categorical": {
                const catInput = this.build_categorical_input(field);
                control = catInput;
                formGroup.appendChild(catInput.container);
                break;
            }
            case "select": {
                const select = this.build_select_input(field);
                control = select;
                formGroup.appendChild(select);
                break;
            }
            case "text":
            case "int":
            case "date": {
                const input = this.build_standard_input(field);
                control = input;
                formGroup.appendChild(input);
                break;
            }
        }
        this.fields.set(field.name, control);
        this.form.appendChild(formGroup);
    }
    build_categorical_input(field) {
        const catInput = new CategoryInput(field.name, field.categories ?? [], field.placeholder ?? "", field.on_change);
        catInput.input.required = field.required ?? true;
        return catInput;
    }
    build_select_input(field) {
        const select = document.createElement("select");
        select.id = field.name;
        select.name = field.name;
        select.required = field.required ?? true;
        for (const opt of field.options) {
            const optionEl = document.createElement("option");
            optionEl.value = String(opt.value);
            optionEl.textContent = opt.label;
            select.appendChild(optionEl);
        }
        return select;
    }
    build_standard_input(field) {
        const input = document.createElement("input");
        input.id = field.name;
        input.name = field.name;
        input.placeholder = field.placeholder ?? "";
        input.required = field.required ?? true;
        if (field.type === "int") {
            input.type = "number";
            input.step = "1";
        }
        else if (field.type === "date") {
            input.type = "date";
        }
        else {
            input.type = "text";
        }
        return input;
    }
    build_submit_button(submitLabel) {
        const button = document.createElement("button");
        button.type = "submit";
        button.className = "btn-primary";
        button.textContent = submitLabel;
        return button;
    }
    get_values() {
        const result = {};
        for (const [name, control] of this.fields) {
            if (control instanceof CategoryInput) {
                result[name] = control.value;
            }
            else if (control instanceof HTMLSelectElement) {
                const num = Number(control.value);
                result[name] = isNaN(num) ? control.value : num;
            }
            else if (control.type === "number") {
                result[name] = isNaN(control.valueAsNumber) ? undefined : control.valueAsNumber;
            }
            else if (control.type === "date") {
                result[name] = control.valueAsDate ?? undefined;
            }
            else {
                result[name] = control.value || undefined;
            }
        }
        return result;
    }
    update_categories(name, categories) {
        const control = this.fields.get(name);
        if (control instanceof CategoryInput) {
            control.categories = categories;
        }
    }
    get_field(name) {
        return this.fields.get(name);
    }
    reset() {
        this.form.reset();
        for (const control of this.fields.values()) {
            if (control instanceof CategoryInput) {
                control.value = "";
            }
        }
    }
}
//# sourceMappingURL=dom_utils.js.map