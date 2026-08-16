import { Item } from "./types.js";
export declare function sift_up(container: Array<Item>, index: number): void;
export declare function sift_down(container: Array<Item>, index: number, length?: number): void;
export declare function insert(container: Array<Item>, element: Item): void;
export declare function erase(container: Array<Item>, index: number): void;
export declare function partial_heapsort(container: Array<Item>, ptr: number, count: number): {
    sorted: Item[];
    ptr: number;
};
export declare function heapify(container: Array<Item>): void;
//# sourceMappingURL=heap.d.ts.map