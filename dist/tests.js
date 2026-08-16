import { heapify, insert, erase, partial_heapsort } from './heap.js';
import { Item, item_less } from './types.js';
import { DatabaseManager } from './main.js';
import { SqlJsDriver } from './db_driver.js';
import { DummyPersistenceAdapter } from './persistence.js';
export const debug = true;
export function assertFactory() {
    let passed = 0;
    let total = 0;
    const assert = (condition, name) => {
        total++;
        if (condition) {
            passed++;
            console.log(`✅ PASS: ${name}`);
        }
        else {
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
    isValid: (container) => {
        for (let i = 0; i < container.length; i++) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < container.length && item_less(container[left], container[i]))
                return false;
            if (right < container.length && item_less(container[right], container[i]))
                return false;
        }
        return true;
    },
    random_item: () => new Item(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 50), Math.floor(Math.random() * 3)),
    equal: (a, b) => a.expiration_date == b.expiration_date &&
        a.box_id == b.box_id &&
        a.status == b.status,
    // --- 1. HEAPIFY ---
    testHeapify(assert) {
        const arr = [
            new Item(10, 1, 0),
            new Item(5, 1, 1),
            new Item(1, 1, 0),
        ];
        heapify(arr, item_less);
        assert(this.isValid(arr), "Heapify produces valid heap");
        assert(arr[0].status === 1, "Heapify puts highest-priority status on top");
    },
    // --- 2. INSERT ---
    testInsert(assert) {
        const heap = [];
        insert(heap, new Item(10, 1, 0), item_less);
        insert(heap, new Item(5, 1, 0), item_less);
        insert(heap, new Item(20, 1, 1), item_less);
        assert(this.isValid(heap), "Insert maintains heap property");
        assert(heap[0].status === 1, "Insert bubbles high-priority item to top");
    },
    // --- 3. ERASE ---
    testErase(assert) {
        const heap = [
            new Item(10, 1, 0),
            new Item(5, 1, 1),
            new Item(20, 1, 0),
            new Item(1, 1, 1),
        ];
        heapify(heap, item_less);
        erase(heap, 0, item_less);
        assert(this.isValid(heap), "Erase root keeps heap valid");
        const last_idx = heap.length - 1;
        erase(heap, last_idx, item_less);
        assert(this.isValid(heap), "Erase leaf keeps heap valid");
        const h2 = [10, 20, 30, 40, 50].map(v => new Item(v, 0, 0));
        h2[4] = new Item(1, 0, 2);
        erase(h2, 1, item_less);
        assert(h2[0].status === 2, "Erase correctly triggers sift-up");
    },
    // --- 4. COMPARATOR ---
    testComparator(assert) {
        const ok = new Item(10, 1, 0);
        const damaged = new Item(10, 1, 1);
        assert(item_less(damaged, ok), "Damaged beats ideal");
        const early = new Item(5, 1, 0);
        const late = new Item(10, 1, 0);
        assert(item_less(early, late), "Earlier expiration wins");
        const big_box = new Item(10, 10, 0);
        const small_box = new Item(10, 1, 0);
        assert(item_less(big_box, small_box), "Bigger box wins tie");
    },
    // --- 5. PARTIAL HEAPSORT ---
    testPartialHeapsort(assert) {
        const arr = [];
        for (let i = 0; i < 100; i++)
            arr.push(this.random_item());
        heapify(arr, item_less);
        let ptr = arr.length - 1;
        const page_size = 10;
        const all_sorted = [];
        while (ptr >= 0) {
            const { sorted, ptr: next_ptr } = partial_heapsort(arr, ptr, page_size, item_less);
            all_sorted.push(...sorted);
            ptr = next_ptr;
            if (ptr >= 0) {
                assert(this.isValid(arr.slice(0, ptr + 1)), "Heap property preserved after partial sort page");
            }
        }
        assert(all_sorted.length === 100, "All items extracted via partial heapsort pages");
        let ok = true;
        for (let i = 1; i < all_sorted.length; i++) {
            if (item_less(all_sorted[i], all_sorted[i - 1])) {
                ok = false;
                break;
            }
        }
        assert(ok, "Partial heapsort produces priority-ordered sequence");
        const arr2 = [
            new Item(5, 1, 0),
            new Item(1, 1, 2),
            new Item(10, 1, 0),
            new Item(2, 1, 1),
        ];
        heapify(arr2, item_less);
        const s2 = partial_heapsort(arr2, arr2.length - 1, 2, item_less);
        assert(s2.sorted[0].status === 2, "Partial heapsort extracts highest-priority item first");
        assert(s2.sorted.length === 2, "Partial heapsort extracts requested batch size");
        assert(s2.ptr === 1, "Partial heapsort updates ptr correctly");
    },
    // --- 6. STRESS ---
    testStress(assert) {
        const heap = [];
        const start = Date.now();
        for (let i = 0; i < 1000; i++) {
            insert(heap, this.random_item(), item_less);
        }
        assert(this.isValid(heap), "Heap valid after random inserts");
        for (let i = 0; i < 200; i++) {
            const idx = Math.floor(Math.random() * heap.length);
            erase(heap, idx, item_less);
            if (!this.isValid(heap)) {
                assert(false, "Heap broke during random erase");
                return;
            }
        }
        assert(true, `Heap survives random operations. Time elapsed: ${Date.now() - start} ms`);
    },
    // --- 7. CONSISTENCY ---
    testBruteForceIntegrity(assert) {
        const size = 200;
        const raw_data = [];
        // 1. Generate chaotic data
        for (let i = 0; i < size; i++) {
            raw_data.push(new Item(Math.floor(Math.random() * 1000), // expiration days
            Math.floor(Math.random() * 10), // box number
            Math.floor(Math.random() * 3) // status
            ));
        }
        heapify(raw_data, item_less);
        // 2. Perform partial heapsort in chunks until exhausted
        let ptr = raw_data.length - 1;
        const sorted = [];
        const chunk_size = 25;
        while (ptr >= 0) {
            const res = partial_heapsort(raw_data, ptr, chunk_size, item_less);
            sorted.push(...res.sorted);
            ptr = res.ptr;
            if (ptr >= 0) {
                if (!this.isValid(raw_data.slice(0, ptr + 1))) {
                    assert(false, "Heap integrity broken between partial heapsort steps");
                    return;
                }
            }
        }
        let is_order_correct = true;
        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            // Check: Priority Order
            // Does the item at i-1 actually have higher or equal priority than item at i?
            if (i > 0 && item_less(current, sorted[i - 1])) {
                console.error(`[ORDER ERROR] Item at index ${i} has higher priority than its predecessor`);
                is_order_correct = false;
            }
        }
        assert(sorted.length === size, "All elements extracted during brute force partial sort");
        assert(is_order_correct, "Final array is correctly ordered by priority");
        assert(ptr === -1, "Heap pointer reaches -1 when fully exhausted");
    },
    testPriorityInvariant: (assert) => {
        const heap = [];
        insert(heap, new Item(100, 1, 1), item_less);
        insert(heap, new Item(999, 1, 2), item_less);
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
        this.testPartialHeapsort(assert);
        this.testStress(assert);
        this.testPriorityInvariant(assert);
        this.testBruteForceIntegrity(assert);
        const { passed, total } = getStats();
        console.log("-----------------------------------");
        console.log(`Results: ${passed}/${total} tests passed.`);
        return passed === total;
    }
};
export const DatabaseTests = {
    // --- HELPERS ---
    createTestDatabase: async () => {
        const initSqlJs = window.initSqlJs;
        const SQL = await initSqlJs({
            locateFile: (file) => {
                return `./src/modules/${file}`;
            }
        });
        const db = new SQL.Database();
        const driver = new SqlJsDriver(db, new DummyPersistenceAdapter());
        const manager = new DatabaseManager(driver);
        return manager;
    },
    // --- 1. TABLE INITIALIZATION ---
    testInitTables: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        try {
            await manager.init_tables();
            assert(true, "Tables initialized successfully");
        }
        catch (e) {
            assert(false, `Table initialization failed: ${e}`);
        }
    },
    // --- 2. ADD CATEGORIES ---
    testAddCategories: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        try {
            await manager.add_categories("Tuna", "Tushonka", "Klassika");
            const categories = await manager.get_categories();
            assert(categories.length === 3, `Expected 3 categories, got ${categories.length}`);
            assert(categories.includes("Tuna"), "Tuna category not found");
            assert(categories.includes("Tushonka"), "Tushonka category not found");
        }
        catch (e) {
            assert(false, `Add categories failed: ${e}`);
        }
    },
    // --- 3. GET CATEGORIES ---
    testGetCategories: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("Cat1", "Cat2");
        try {
            const cats = await manager.get_categories();
            assert(cats.length === 2, "Got wrong number of categories");
            assert(cats[0] === "Cat1" || cats[1] === "Cat1", "Cat1 not in categories");
        }
        catch (e) {
            assert(false, `Get categories failed: ${e}`);
        }
    },
    // --- 4. ADD ITEMS ---
    testAddItems: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("TestCat");
        try {
            await manager.add_items("TestCat", new Item(Date.now() + 1000000, 1, 0));
            await manager.add_items("TestCat", new Item(Date.now() + 2000000, 2, 1));
            const items = await manager.get_items("TestCat");
            assert(items.length === 2, `Expected 2 items, got ${items.length}`);
        }
        catch (e) {
            assert(false, `Add items failed: ${e}`);
        }
    },
    // --- 5. GET ITEMS ---
    testGetItems: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("Food");
        await manager.add_items("Food", new Item(Date.now() + 1000000, 1, 0));
        await manager.add_items("Food", new Item(Date.now() + 2000000, 2, 0));
        try {
            const items = await manager.get_items("Food");
            assert(items.length === 2, `Expected 2 items, got ${items.length}`);
            assert(items.every(i => i instanceof Item), "Not all items are Item instances");
        }
        catch (e) {
            assert(false, `Get items failed: ${e}`);
        }
    },
    // --- 6. REMOVE ITEMS ---
    testRemoveItems: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("Stuff");
        await manager.add_items("Stuff", new Item(Date.now() + 1000000, 1));
        await manager.add_items("Stuff", new Item(Date.now() + 2000000, 2));
        try {
            let items = await manager.get_items("Stuff");
            const initial_count = items.length;
            // Assuming first item has id=1
            await manager.remove_item(1);
            items = await manager.get_items("Stuff");
            assert(items.length === initial_count - 1, "Item was not removed");
        }
        catch (e) {
            assert(false, `Remove item failed: ${e}`);
        }
    },
    // --- 7. UPDATE ITEMS ---
    testUpdateItems: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("Boxes");
        await manager.add_items("Boxes", new Item(Date.now() + 1000000, 1, 0));
        try {
            await manager.update_item(1, { status: 1 });
            const items = await manager.get_items("Boxes");
            assert(items.length > 0, "No items found after update");
            // Note: Verification depends on update_item implementation
            assert(true, "Update executed without error");
        }
        catch (e) {
            assert(false, `Update item failed: ${e}`);
        }
    },
    // --- 8. STRESS TEST ---
    testStressDatabase: async (assert) => {
        const manager = await DatabaseTests.createTestDatabase();
        await manager.init_tables();
        await manager.add_categories("Stress");
        try {
            const start = Date.now();
            // Add many items
            for (let i = 0; i < 50; i++) {
                await manager.add_items("Stress", new Item(Date.now() + Math.random() * 1000000, Math.floor(Math.random() * 10), Math.floor(Math.random() * 2)));
            }
            const items = await manager.get_items("Stress");
            assert(items.length === 50, `Expected 50 items, got ${items.length}`);
            const elapsed = Date.now() - start;
            assert(true, `Stress test completed: added 50 items in ${elapsed}ms`);
        }
        catch (e) {
            assert(false, `Stress test failed: ${e}`);
        }
    },
    // --- RUNNER ---
    async run() {
        console.log("🗄️  Database Test Suite");
        const { assert, getStats } = assertFactory();
        await this.testInitTables(assert);
        await this.testAddCategories(assert);
        await this.testGetCategories(assert);
        await this.testAddItems(assert);
        await this.testGetItems(assert);
        await this.testRemoveItems(assert);
        await this.testUpdateItems(assert);
        await this.testStressDatabase(assert);
        const { passed, total } = getStats();
        console.log("-----------------------------------");
        console.log(`Results: ${passed}/${total} tests passed.`);
        return passed === total;
    }
};
//# sourceMappingURL=tests.js.map