import { Item } from "./types.js";

export function sift_up(container: Array<Item>, index: number) {
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

export function sift_down(container: Array<Item>, index: number, length: number = -1) {
    if (length == -1) {
        length = container.length;
    }

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (right < length) {
        const min = container[left].less(container[right]) ? left : right;

        if (container[min].less(container[index])) {
            const temp = container[min];
            container[min] = container[index];
            container[index] = temp;

            sift_down(container, min, length);
        }
    }
    else if (left < length) {
        if (container[left].less(container[index])) {
            const temp = container[left];
            container[left] = container[index];
            container[index] = temp;

            sift_down(container, left, length);
        }
    }
}

export function insert(container: Array<Item>, element: Item) {
    container.push(element);
    sift_up(container, container.length - 1);
}

export function erase(container: Array<Item>, index: number) {
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

export function partial_heapsort(container: Array<Item>, ptr: number, count: number) {
    const result = [];

    for (let i = 0; ptr >= 0 && i < count; i++, ptr--) {
        const last = container[ptr];
        container[ptr] = container[0];
        container[0] = last;

        result.push(container[ptr]);
        sift_down(container, 0, ptr);
    }

    return {sorted: result, ptr: ptr};
}

export function heapify(container: Array<Item>) {
    for (let i = (container.length - 1) >> 1; i >= 0; i--) {
        sift_down(container, i);
    }
}