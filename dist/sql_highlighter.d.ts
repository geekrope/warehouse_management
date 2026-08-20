/**
 * SQL Syntax Highlighter Component
 * Provides real-time syntax highlighting for SQL input in a synchronized editor container.
 */
export declare function highlightSql(code: string): string;
export declare class SqlEditor {
    container: HTMLDivElement;
    textarea: HTMLTextAreaElement;
    highlightLayer: HTMLElement;
    constructor(id: string, placeholder?: string);
    private bindEvents;
    get value(): string;
    set value(val: string);
    clear(): void;
}
//# sourceMappingURL=sql_highlighter.d.ts.map