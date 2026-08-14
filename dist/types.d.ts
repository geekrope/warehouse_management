export declare class Item {
    expiration_date: number;
    box_id: number;
    status: number;
    id: number | undefined;
    constructor(expiration_date: number, box: number, status?: number, id?: number | undefined);
    static validate(item: any): boolean;
    static from(item: any): Item;
    less(item: Item): boolean;
    repr(include_index?: boolean): string;
}
//# sourceMappingURL=types.d.ts.map