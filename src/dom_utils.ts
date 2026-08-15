export function get_element<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found.`);
    return el as T;
}

export function add_log_entry(message: string, container_id: string, is_error: boolean = false) {
    const log_element = document.getElementById(container_id) as HTMLDivElement | null;
    if (!log_element) return;
    const entry = document.createElement("div");

    entry.className = "log-entry";
    entry.textContent = message;
    if (is_error) entry.style.color = "red";

    log_element.appendChild(entry);
    log_element.scrollTop = log_element.scrollHeight;
}

export class CategoryInput {
    public container: HTMLDivElement;
    public input: HTMLInputElement;
    public datalist: HTMLDataListElement;
    public on_change: ((value: string) => void) | undefined;
    private _categories: string[] = [];

    constructor(
        input_name: string,
        categories: string[] = [],
        placeholder: string = "",
        on_change?: (value: string) => void
    ) {
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

    private onChange(_event?: Event): void {
        this.update_datalist(this.input.value);
        if (this.on_change) {
            this.on_change(this.input.value.trim());
        }
    }

    public get categories(): string[] {
        return this._categories;
    }

    public set categories(newCategories: string[]) {
        this._categories = newCategories;
        this.update_datalist(this.input.value);
    }

    public update_datalist(filter_value: string = ""): void {
        this.datalist.innerHTML = "";

        if (this.categories.includes(filter_value)) return;

        const query = filter_value.toLowerCase();
        const filtered = this._categories.filter(cat =>
            cat.toLowerCase().includes(query)
        );

        for (const cat of filtered) {
            const option = document.createElement("option");
            option.value = cat;
            this.datalist.appendChild(option);
        }
    }

    public get value(): string {
        return this.input.value.trim();
    }

    public set value(val: string) {
        this.input.value = val;
        this.update_datalist(val);
    }
}

export type FieldType = "text" | "int" | "date" | "categorical" | "select";

export type BaseFieldConfig = {
    name: string;
    label: string;
    required?: boolean;
};

export type StandardFieldConfig = BaseFieldConfig & {
    type: "text" | "int" | "date";
    placeholder?: string;
};

export type CategoricalFieldConfig = BaseFieldConfig & {
    type: "categorical";
    placeholder?: string;
    categories?: string[];
    on_change?: (value: string) => void;
};

export type SelectOption = {
    value: string | number;
    label: string;
};

export type SelectFieldConfig = BaseFieldConfig & {
    type: "select";
    options: SelectOption[];
};

export type FieldConfig = StandardFieldConfig | CategoricalFieldConfig | SelectFieldConfig;

export type FormFieldControl = HTMLInputElement | CategoryInput | HTMLSelectElement;

export type FormValues = Record<string, string | number | Date | undefined>;

export class DynamicForm {
    public form: HTMLFormElement;
    public fields: Map<string, FormFieldControl> = new Map();
    public submitButton: HTMLButtonElement;

    constructor(
        schema: FieldConfig[],
        submitLabel: string = "Submit",
        onSubmit?: (values: FormValues) => void
    ) {
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

    private add_field(field: FieldConfig): void {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";

        const label = document.createElement("label");
        label.textContent = field.label;
        label.htmlFor = field.name;
        formGroup.appendChild(label);

        let control: FormFieldControl;

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

    private build_categorical_input(field: CategoricalFieldConfig): CategoryInput {
        const catInput = new CategoryInput(
            field.name,
            field.categories ?? [],
            field.placeholder ?? "",
            field.on_change
        );
        catInput.input.required = field.required ?? true;
        return catInput;
    }

    private build_select_input(field: SelectFieldConfig): HTMLSelectElement {
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

    private build_standard_input(field: StandardFieldConfig): HTMLInputElement {
        const input = document.createElement("input");
        input.id = field.name;
        input.name = field.name;
        input.placeholder = field.placeholder ?? "";
        input.required = field.required ?? true;

        if (field.type === "int") {
            input.type = "number";
            input.step = "1";
        } else if (field.type === "date") {
            input.type = "date";
        } else {
            input.type = "text";
        }

        return input;
    }

    private build_submit_button(submitLabel: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "submit";
        button.className = "btn-primary";
        button.textContent = submitLabel;
        return button;
    }

    public get_values(): FormValues {
        const result: FormValues = {};
        for (const [name, control] of this.fields) {
            if (control instanceof CategoryInput) {
                result[name] = control.value;
            } else if (control instanceof HTMLSelectElement) {
                const num = Number(control.value);
                result[name] = isNaN(num) ? control.value : num;
            } else if (control.type === "number") {
                result[name] = isNaN(control.valueAsNumber) ? undefined : control.valueAsNumber;
            } else if (control.type === "date") {
                result[name] = control.valueAsDate ?? undefined;
            } else {
                result[name] = control.value || undefined;
            }
        }
        return result;
    }

    public update_categories(name: string, categories: string[]): void {
        const control = this.fields.get(name);
        if (control instanceof CategoryInput) {
            control.categories = categories;
        }
    }

    public get_field<T extends HTMLInputElement | CategoryInput | HTMLSelectElement>(name: string): T | undefined {
        return this.fields.get(name) as T | undefined;
    }

    public reset(): void {
        this.form.reset();
        for (const control of this.fields.values()) {
            if (control instanceof CategoryInput) {
                control.value = "";
            }
        }
    }
}