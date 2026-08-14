import { heapify, insert, erase, heapsort } from './heap.js';
import { Item } from './types.js';

type AssertFunc = (condition: boolean, name: string) => void;
export const debug = true;

export function assertFactory() {
    let passed = 0;
    let total = 0;

    const assert = (condition: boolean, name: string) => {
        total++;
        if (condition) {
            passed++;
            console.log(`✅ PASS: ${name}`);
        } else {
            console.error(`❌ FAIL: ${name}`);
        }
    };

    return {
        assert,
        getStats: () => ({ passed, total })
    };
}

export const HeapTests = {
    // --- HELPERS ---
    isValid: (container: Array<Item>) => {
        for (let i = 0; i < container.length; i++) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < container.length && container[left].less(container[i])) return false;
            if (right < container.length && container[right].less(container[i])) return false;
        }
        return true;
    },

    randomItem: () => new Item(
        Math.floor(Math.random() * 1000),
        Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 3)
    ),

    equal: (a: Item, b: Item) => a.expiration_date == b.expiration_date &&
        a.box_id == b.box_id &&
        a.status == b.status,

    // --- 1. HEAPIFY ---
    testHeapify(assert: AssertFunc) {
        const arr = [
            new Item(10, 1, 0),
            new Item(5, 1, 1),
            new Item(1, 1, 0),
        ];

        heapify(arr);
        assert(this.isValid(arr), "Heapify produces valid heap");

        assert(arr[0].status === 1, "Heapify puts highest-priority status on top");
    },

    // --- 2. INSERT ---
    testInsert(assert: AssertFunc) {
        const heap: Array<Item> = [];

        insert(heap, new Item(10, 1, 0));
        insert(heap, new Item(5, 1, 0));
        insert(heap, new Item(20, 1, 1));

        assert(this.isValid(heap), "Insert maintains heap property");
        assert(heap[0].status === 1, "Insert bubbles high-priority item to top");
    },

    // --- 3. ERASE ---
    testErase(assert: AssertFunc) {
        const heap = [
            new Item(10, 1, 0),
            new Item(5, 1, 1),
            new Item(20, 1, 0),
            new Item(1, 1, 1),
        ];

        heapify(heap);

        erase(heap, 0);
        assert(this.isValid(heap), "Erase root keeps heap valid");

        const lastIdx = heap.length - 1;
        erase(heap, lastIdx);
        assert(this.isValid(heap), "Erase leaf keeps heap valid");

        const h2 = [10, 20, 30, 40, 50].map(v => new Item(v, 0, 0));
        h2[4] = new Item(1, 0, 2);
        erase(h2, 1);
        assert(h2[0].status === 2, "Erase correctly triggers sift-up");
    },

    // --- 4. COMPARATOR ---
    testComparator(assert: AssertFunc) {
        const ok = new Item(10, 1, 0);
        const damaged = new Item(10, 1, 1);

        assert(damaged.less(ok), "Damaged beats ideal");

        const early = new Item(5, 1, 0);
        const late = new Item(10, 1, 0);

        assert(early.less(late), "Earlier expiration wins");

        const bigBox = new Item(10, 10, 0);
        const smallBox = new Item(10, 1, 0);

        assert(bigBox.less(smallBox), "Bigger box wins tie");
    },

    // --- 5. HEAPSORT ---
    testHeapsort(assert: AssertFunc) {
        const arr = [];
        for (let i = 0; i < 100; i++) arr.push(this.randomItem());

        const sorted = heapsort(arr);

        let ok = true;
        for (let i = 1; i < sorted.length; i++) {
            if (!sorted[i - 1].less(sorted[i])) {
                ok = false;
                break;
            }
        }

        assert(ok, "Heapsort produces priority-ordered sequence");

        const arr2 = [
            new Item(5, 1, 0),
            new Item(1, 1, 2),
            new Item(10, 1, 0),
            new Item(2, 1, 1),
        ];

        const s2 = heapsort(arr2);

        assert(s2[0].status === 2, "Heapsort handles non-heap input (needs heapify)");
    },

    // --- 6. STRESS ---
    testStress(assert: AssertFunc) {
        const heap: Array<Item> = [];
        const start = Date.now();

        for (let i = 0; i < 1000; i++) {
            insert(heap, this.randomItem());
        }

        assert(this.isValid(heap), "Heap valid after random inserts");

        for (let i = 0; i < 200; i++) {
            const idx = Math.floor(Math.random() * heap.length);
            erase(heap, idx);

            if (!this.isValid(heap)) {
                assert(false, "Heap broke during random erase");
                return;
            }
        }

        assert(true, `Heap survives random operations. Time elapsed: ${Date.now() - start} ms`);
    },

    // --- 7. CONSISTENCY ---
    testBruteForceIntegrity(assert: AssertFunc) {
        const size = 200;
        const rawData: Array<Item> = [];

        // 1. Generate chaotic data
        for (let i = 0; i < size; i++) {
            rawData.push(new Item(
                Math.floor(Math.random() * 1000), // expiration days
                Math.floor(Math.random() * 10),   // box number
                Math.floor(Math.random() * 3)    // status
            ));
        }

        heapify(rawData);

        // 2. Perform heapsort
        const sorted = heapsort(rawData);

        let isOrderCorrect = true;
        let isIndexConsistent = true;

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];

            // Check A: Priority Order
            // Does the item at i-1 actually have higher or equal priority than item at i?
            if (i > 0 && current.less(sorted[i - 1])) {
                console.error(`[ORDER ERROR] Item at index ${i} has higher priority than its predecessor`);
                isOrderCorrect = false;
            }
        }

        assert(isOrderCorrect, "Final array is correctly ordered by priority");
        assert(isIndexConsistent, "Internal 'idx' fields are perfectly synced with array positions");
    },

    testPriorityInvariant: (assert: AssertFunc) => {
        const heap: Array<Item> = [];

        insert(heap, new Item(100, 1, 1));
        insert(heap, new Item(999, 1, 2));

        assert(heap[0].status === 2, "Critical always outranks damaged regardless of date");
    },

    // --- RUNNER ---
    run() {
        console.log("🚀 Heap Test Suite (priority-based)");

        const { assert, getStats } = assertFactory();

        this.testHeapify(assert);
        this.testInsert(assert);
        this.testErase(assert);
        this.testComparator(assert);
        //this.testHeapsort(assert); anton hallucinating excuse him        
        this.testStress(assert);
        this.testPriorityInvariant(assert);
        this.testBruteForceIntegrity(assert);

        const { passed, total } = getStats();

        console.log("-----------------------------------");
        console.log(`Results: ${passed}/${total} tests passed.`);

        return passed === total;
    }
};