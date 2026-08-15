export declare function get_element<T extends HTMLElement>(id: string): T;
export declare function add_log_entry(message: string, container_id: string, is_error?: boolean): void;
export declare class CategoryInput {
    container: HTMLDivElement;
    input: HTMLInputElement;
    datalist: HTMLDataListElement;
    on_change: ((value: string) => void) | undefined;
    private _categories;
    constructor(input_name: string, categories?: string[], placeholder?: string, on_change?: (value: string) => void);
    private onChange;
    get categories(): string[];
    set categories(newCategories: string[]);
    update_datalist(filter_value?: string): void;
    get value(): string;
    set value(val: string);
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
export declare class DynamicForm {
    form: HTMLFormElement;
    fields: Map<string, FormFieldControl>;
    submitButton: HTMLButtonElement;
    constructor(schema: FieldConfig[], submitLabel?: string, onSubmit?: (values: FormValues) => void);
    private add_field;
    private build_categorical_input;
    private build_select_input;
    private build_standard_input;
    private build_submit_button;
    get_values(): FormValues;
    update_categories(name: string, categories: string[]): void;
    get_field<T extends HTMLInputElement | CategoryInput | HTMLSelectElement>(name: string): T | undefined;
    reset(): void;
}
//# sourceMappingURL=dom_utils.d.ts.map