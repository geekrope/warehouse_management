export class Item {
    category;
    expiration_date;
    box_id;
    status;
    id;
    constructor(category, expiration_date, box, status = 0, id = undefined) {
        this.category = category;
        this.expiration_date = expiration_date;
        this.box_id = box;
        this.status = status;
        this.id = id;
    }
    static validate(item) {
        return typeof item.category === 'string' &&
            item.category.trim().length > 0 &&
            typeof item.expiration_date === 'number' &&
            typeof item.box_id === 'number' &&
            !isNaN(item.expiration_date);
    }
    static from(item) {
        if (!Item.validate(item)) {
            throw TypeError("Missing required properties: category, expiration_date, box_id");
        }
        return new Item(item.category, item.expiration_date, item.box_id, item.status ?? 0, item.id ?? undefined);
    }
}
export function item_less(a, b) {
    if (a.status != b.status)
        return a.status > b.status;
    if (a.expiration_date != b.expiration_date)
        return a.expiration_date < b.expiration_date;
    return a.box_id > b.box_id;
}
//# sourceMappingURL=types.js.map