export declare class Item {
    expiration_date: number;
    box_id: number;
    status: number;
    id: number | undefined;
    constructor(expiration_date: number, box: number, status?: number, id?: number | undefined);
    static validate(item: any): boolean;
    static from(item: any): Item;
    repr(include_index?: boolean): string;
}
export declare function item_less(a: Item, b: Item): boolean;
//# sourceMappingURL=types.d.ts.map