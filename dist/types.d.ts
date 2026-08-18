export declare class Item {
    category: string;
    expiration_date: number;
    box_id: number;
    status: number;
    id: number | undefined;
    constructor(category: string, expiration_date: number, box: number, status?: number, id?: number | undefined);
    static validate(item: any): boolean;
    static from(item: any): Item;
}
export declare function item_less(a: Item, b: Item): boolean;
export type Category = {
    title: string;
    weight: number | null;
};
//# sourceMappingURL=types.d.ts.map