import { Item } from './types.js';
type AssertFunc = (condition: boolean, name: string) => void;
export declare const debug = true;
export declare function assertFactory(): {
    assert: (condition: boolean, name: string) => void;
    getStats: () => {
        passed: number;
        total: number;
    };
};
export declare const HeapTests: {
    isValid: (container: Array<Item>) => boolean;
    randomItem: () => Item;
    equal: (a: Item, b: Item) => boolean;
    testHeapify(assert: AssertFunc): void;
    testInsert(assert: AssertFunc): void;
    testErase(assert: AssertFunc): void;
    testComparator(assert: AssertFunc): void;
    testHeapsort(assert: AssertFunc): void;
    testStress(assert: AssertFunc): void;
    testBruteForceIntegrity(assert: AssertFunc): void;
    testPriorityInvariant: (assert: AssertFunc) => void;
    run(): boolean;
};
export {};
//# sourceMappingURL=tests.d.ts.map