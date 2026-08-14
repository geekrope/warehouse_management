export function get_element(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found.`);
    return el;
}
//# sourceMappingURL=dom_utils.js.map