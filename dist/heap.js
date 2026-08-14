import { Item } from "./types.js";
export function sift_up(container, index) {
    if (index == 0) {
        return;
    }
    const parent = (index - 1) >> 1;
    if (container[index].less(container[parent])) {
        const temp = container[index];
        container[index] = container[parent];
        container[parent] = temp;
        sift_up(container, parent);
    }
}
export function sift_down(container, index) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if (right < container.length) {
        const min = container[left].less(container[right]) ? left : right;
        if (container[min].less(container[index])) {
            const temp = container[min];
            container[min] = container[index];
            container[index] = temp;
            sift_down(container, min);
        }
    }
    else if (left < container.length) {
        if (container[left].less(container[index])) {
            const temp = container[left];
            container[left] = container[index];
            container[index] = temp;
            sift_down(container, left);
        }
    }
}
export function insert(container, element) {
    container.push(element);
    sift_up(container, container.length - 1);
}
export function erase(container, index) {
    const last = container.length - 1;
    if (index == last) {
        container.pop();
        return;
    }
    container[index] = container[last];
    container.pop();
    const parent = (index - 1) >> 1;
    if (index > 0 && container[index].less(container[parent])) {
        sift_up(container, index);
    }
    else {
        sift_down(container, index);
    }
}
export function heapsort(container, count = -1) {
    const copy = Array.from(container).map((item) => {
        const itemCopy = Item.from(item);
        return itemCopy;
    });
    const sorted = [];
    let size = copy.length;
    if (count != -1 && count < copy.length) {
        size = count;
    }
    if (size == 0) {
        return [];
    }
    for (let i = 0; i < size - 1; i++) {
        const last = copy[copy.length - 1];
        sorted.push(copy[0]);
        copy.pop();
        copy[0] = last;
        sift_down(copy, 0);
    }
    sorted.push(copy[0]);
    return sorted;
}
export function heapify(container) {
    for (let i = (container.length - 1) >> 1; i >= 0; i--) {
        sift_down(container, i);
    }
}
//# sourceMappingURL=heap.js.map