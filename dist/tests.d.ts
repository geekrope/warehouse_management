import { Item } from './types.js';
import { DatabaseManager } from './main.js';
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
    testPartialHeapsort(assert: AssertFunc): void;
    testStress(assert: AssertFunc): void;
    testBruteForceIntegrity(assert: AssertFunc): void;
    testPriorityInvariant: (assert: AssertFunc) => void;
    run(): boolean;
};
export declare const DatabaseTests: {
    createTestDatabase: () => Promise<DatabaseManager>;
    testInitTables: (assert: AssertFunc) => Promise<void>;
    testAddCategories: (assert: AssertFunc) => Promise<void>;
    testGetCategories: (assert: AssertFunc) => Promise<void>;
    testAddItems: (assert: AssertFunc) => Promise<void>;
    testGetItems: (assert: AssertFunc) => Promise<void>;
    testRemoveItems: (assert: AssertFunc) => Promise<void>;
    testUpdateItems: (assert: AssertFunc) => Promise<void>;
    testStressDatabase: (assert: AssertFunc) => Promise<void>;
    run(): Promise<boolean>;
};
export {};
//# sourceMappingURL=tests.d.ts.map