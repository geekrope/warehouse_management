export class Item {
    expiration_date;
    box_id;
    status;
    id;
    constructor(expiration_date, box, status = 0, id = undefined) {
        this.expiration_date = expiration_date;
        this.box_id = box;
        this.status = status;
        this.id = id;
    }
    static validate(item) {
        return typeof item.expiration_date === 'number' &&
            typeof item.box_id === 'number' &&
            !isNaN(item.expiration_date);
    }
    static from(item) {
        if (!Item.validate(item)) {
            throw TypeError("Missing required properties: expiration_date, box_id");
        }
        return new Item(item.expiration_date, item.box_id, item.status ?? 0, item.id ?? undefined);
    }
    repr(include_index = false) {
        return `Best before: ${new Date(this.expiration_date).toLocaleDateString()}, Box: ${this.box_id}, Status: ${this.status} ${include_index ? `, Index: ${this.id}` : ``}`;
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