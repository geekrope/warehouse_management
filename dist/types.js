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
    less(item) {
        if (this.status != item.status)
            return this.status > item.status;
        if (this.expiration_date != item.expiration_date)
            return this.expiration_date < item.expiration_date;
        return this.box_id > item.box_id;
    }
    repr(include_index = false) {
        return `Best before: ${new Date(this.expiration_date).toLocaleDateString()}, Box: ${this.box_id}, Status: ${this.status} ${include_index ? `, Index: ${this.id}` : ``}`;
    }
}
//# sourceMappingURL=types.js.map