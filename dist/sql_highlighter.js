/**
 * SQL Syntax Highlighter Component
 * Provides real-time syntax highlighting for SQL input in a synchronized editor container.
 */
const SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS",
    "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "INSERT", "INTO", "VALUES",
    "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "IF", "NOT", "EXISTS", "DROP", "ALTER",
    "ADD", "COLUMN", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "CHECK", "DEFAULT",
    "NULL", "AND", "OR", "IN", "IS", "LIKE", "AS", "DISTINCT", "UNION", "ALL", "CASE",
    "WHEN", "THEN", "ELSE", "END", "TRIGGER", "BEFORE", "AFTER", "FOR", "EACH", "ROW",
    "BEGIN", "INTEGER", "TEXT", "REAL", "BLOB", "BOOLEAN", "AUTOINCREMENT", "PRAGMA",
    "CONFLICT", "DO", "NOTHING", "EXCLUDED", "INDEX", "VIEW", "ASC", "DESC", "SUM", "COUNT",
    "AVG", "MIN", "MAX", "COALESCE"
];
const KEYWORDS_SET = new Set(SQL_KEYWORDS);
export function highlightSql(code) {
    const tokens = [];
    let i = 0;
    const len = code.length;
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    while (i < len) {
        // Comment -- single line
        if (code[i] === '-' && code[i + 1] === '-') {
            let start = i;
            while (i < len && code[i] !== '\n')
                i++;
            tokens.push(`<span class="sql-token-comment">${escapeHtml(code.slice(start, i))}</span>`);
            continue;
        }
        // Comment /* multiline */
        if (code[i] === '/' && code[i + 1] === '*') {
            let start = i;
            i += 2;
            while (i < len && !(code[i - 1] === '*' && code[i] === '/'))
                i++;
            if (i < len)
                i++;
            tokens.push(`<span class="sql-token-comment">${escapeHtml(code.slice(start, i))}</span>`);
            continue;
        }
        // Strings 'single quote'
        if (code[i] === "'") {
            let start = i;
            i++;
            while (i < len) {
                if (code[i] === "'") {
                    if (code[i + 1] === "'") { // escaped quote
                        i += 2;
                    }
                    else {
                        i++;
                        break;
                    }
                }
                else {
                    i++;
                }
            }
            tokens.push(`<span class="sql-token-string">${escapeHtml(code.slice(start, i))}</span>`);
            continue;
        }
        // Numbers
        if (/[0-9]/.test(code[i]) || (code[i] === '.' && i + 1 < len && /[0-9]/.test(code[i + 1]))) {
            let start = i;
            while (i < len && /[0-9.]/.test(code[i]))
                i++;
            tokens.push(`<span class="sql-token-number">${escapeHtml(code.slice(start, i))}</span>`);
            continue;
        }
        // Words / Identifiers / Keywords
        if (/[a-zA-Z_]/.test(code[i])) {
            let start = i;
            while (i < len && /[a-zA-Z0-9_]/.test(code[i]))
                i++;
            const word = code.slice(start, i);
            if (KEYWORDS_SET.has(word.toUpperCase())) {
                tokens.push(`<span class="sql-token-keyword">${escapeHtml(word)}</span>`);
            }
            else {
                tokens.push(`<span class="sql-token-ident">${escapeHtml(word)}</span>`);
            }
            continue;
        }
        // Operators & punctuation
        if (/[+\-*/%=<>!&|,;:()]/i.test(code[i])) {
            tokens.push(`<span class="sql-token-operator">${escapeHtml(code[i])}</span>`);
            i++;
            continue;
        }
        // Whitespace and other characters
        tokens.push(escapeHtml(code[i]));
        i++;
    }
    return tokens.join("");
}
export class SqlEditor {
    container;
    textarea;
    highlightLayer;
    constructor(id, placeholder = "Enter SQL statement...") {
        this.container = document.createElement("div");
        this.container.className = "sql-editor-container";
        this.highlightLayer = document.createElement("pre");
        this.highlightLayer.className = "sql-highlight-layer";
        this.highlightLayer.setAttribute("aria-hidden", "true");
        this.textarea = document.createElement("textarea");
        this.textarea.className = "sql-editor-input";
        this.textarea.id = id;
        this.textarea.placeholder = placeholder;
        this.textarea.spellcheck = false;
        this.textarea.autocomplete = "off";
        this.textarea.autocapitalize = "off";
        this.container.appendChild(this.highlightLayer);
        this.container.appendChild(this.textarea);
        this.bindEvents();
    }
    bindEvents() {
        const update = () => {
            let text = this.textarea.value;
            if (text.endsWith("\n")) {
                text += " ";
            }
            this.highlightLayer.innerHTML = highlightSql(text) + "\n";
            this.highlightLayer.scrollTop = this.textarea.scrollTop;
            this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
        };
        this.textarea.addEventListener("input", update);
        this.textarea.addEventListener("scroll", () => {
            this.highlightLayer.scrollTop = this.textarea.scrollTop;
            this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
        });
        // Tab indentation support
        this.textarea.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = this.textarea.selectionStart;
                const end = this.textarea.selectionEnd;
                this.textarea.value = this.textarea.value.substring(0, start) + "    " + this.textarea.value.substring(end);
                this.textarea.selectionStart = this.textarea.selectionEnd = start + 4;
                update();
            }
        });
    }
    get value() {
        return this.textarea.value.trim();
    }
    set value(val) {
        this.textarea.value = val;
        let text = val;
        if (text.endsWith("\n"))
            text += " ";
        this.highlightLayer.innerHTML = highlightSql(text) + "\n";
    }
    clear() {
        this.value = "";
    }
}
//# sourceMappingURL=sql_highlighter.js.map