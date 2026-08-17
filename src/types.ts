export class Item {
    category: string;
    expiration_date: number;
    box_id: number;
    status: number;
    id: number | undefined;

    constructor(category: string, expiration_date: number, box: number, status: number = 0, id: number | undefined = undefined) {
        this.category = category;
        this.expiration_date = expiration_date;
        this.box_id = box;
        this.status = status;
        this.id = id;
    }

    static validate(item: any): boolean {
        return typeof item.category === 'string' &&
            item.category.trim().length > 0 &&
            typeof item.expiration_date === 'number' &&
            typeof item.box_id === 'number' &&
            !isNaN(item.expiration_date);
    }

    static from(item: any) {
        if (!Item.validate(item)) { throw TypeError("Missing required properties: category, expiration_date, box_id") }
        return new Item(item.category, item.expiration_date, item.box_id, item.status ?? 0, item.id ?? undefined);
    }

    repr(include_index = false): string {
        return `Category: ${this.category}, Best before: ${new Date(this.expiration_date).toLocaleDateString()}, Box: ${this.box_id}, Status: ${this.status} ${include_index ? `, Index: ${this.id}` : ``}`
    }
}

export function item_less(a: Item, b: Item): boolean {
    if (a.status != b.status) return a.status > b.status;
    if (a.expiration_date != b.expiration_date) return a.expiration_date < b.expiration_date;

    return a.box_id > b.box_id;
}

export type Category = {
    title: string;
    weight: number | undefined;
};