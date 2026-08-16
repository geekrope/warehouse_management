import { Item } from "./types.js";
const LOCALE_REGEX = /\{(\w+)\}/g;
const LOCALES = {
    RU_PRISON: {
        item_repr_full: "БАЛАНДА {cat}, ХАТА {box}, СРОК {date}, СТАТУС {status}",
        page_title_intake: "ПРИЕМ ПЕРВОХОДОВ",
        page_title_storage: "СХРОН",
        page_title_categories: "МАСТИ",
        header_main: "УДЕЛИТЬ НА ГРЕВ",
        header_storage: "СХРОН ХАТЫ",
        header_categories: "МАСТИ И ПОГОНЯЛА",
        categories_list_header: "СПИСОК МАСТЕЙ",
        category_input: "ВВЕДИТЕ МАСТЬ",
        add_category_btn: "ДОБАВИТЬ НОВУЮ МАСТЬ",
        label_expiry: "НА СКОЛЬКО ЗАЕХАЛ:",
        label_box: "ХАТА (КОРОБКА #):",
        box: "ХАТА:",
        register_item_btn: "ПРОПИСАТЬСЯ В ХАТЕ",
        label_status: "КЕМ ПО ЖИЗНИ БУДЕШЬ",
        selected_category: "ВЫБРАННАЯ МАСТЬ: {category}",
        no_category_selected: "МАСТЬ НЕ ВЫБРАНА",
        page_title_restore: "КУБЫШКА",
        header_restore: "КОНСПИРАТИВНАЯ ХАТА",
        btn_export: "ЗАСУХАРИТЬСЯ",
        btn_import: "ПОДНЯТЬ АРХИВ",
        page_number: "СТРАНИЦА {num}",
        initial_log: "СИСТЕМА ГРАБЕЖ™ НА ШУХЕРЕ...",
        initial_log_fail: "СИСТЕМА ГРАБЕЖ™ ЗАМОРОСИЛА...",
        item_placeholder: "ВЫБЕРИТЕ МАСТЬ...",
        list_item_label: "ДО {date} | СТАТУС {status}",
        count_label: "ВСЕГО ДУШ: {count}",
        status_action_0: "ОТПЕТУШИТЬ",
        status_action_1: "ОБОЗНАЛСЯ",
        status_0: "РОВНЫЙ",
        status_1: "ОПУЩЕНЕЦ",
        btn_delete: "СЛИТЬ",
        page_title_stats: "РАСКЛАД ПО ОБЩАКУ",
        label_date_filter: "СКОЛЬКО СРОК МОТАЕШЬ",
        log_add_cat: "ЧИРКНУЛИ \"{val}\" В ЖУРНАЛ.",
        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ МАСТЬ",
        log_delete_cat: "ШВАРКНУЛИ МАСТЬ \"{val}\"",
        log_delete_cat_fail: "НЕ УДАЛОСЬ УДАЛИТЬ МАСТЬ",
        log_add_item: "БАЛАНДА {cat} ДО {date} ПРОПИСАНА В ХАТЕ {box}",
        log_add_fail: "НЕ ОБЕССУДЬ БАЛАНДА НЕ ЗАЕХАЛА",
        log_update_status: "{meta} СТАТУС {status}",
        log_delete: "ШВАРКНУЛИ {meta}",
        log_import: "ЗАНЕСЛИ В ОБЩАК",
        log_export: "ОБЩАК ВЫВЕДЕН В ОФШОР",
        version: "СИСТЕМА ГРАБЕЖ™ v2.0"
    },
    EN: {
        item_repr_full: "CATEGORY {cat}, BOX {box}, EXPIRY DATE {date}, STATUS {status}",
        page_title_intake: "ITEM INTAKE",
        page_title_storage: "STORAGE",
        page_title_categories: "CATEGORIES",
        header_main: "INVENTORY ALLOCATION",
        header_storage: "STORAGE INVENTORY",
        header_categories: "CATEGORY MANAGEMENT",
        categories_list_header: "ALL CATEGORIES",
        category_input: "ENTER CATEGORY",
        add_category_btn: "ADD NEW CATEGORY",
        label_expiry: "EXPIRATION DATE:",
        label_box: "STORAGE UNIT (BOX #):",
        box: "UNIT:",
        register_item_btn: "REGISTER IN STORAGE",
        label_status: "STATUS",
        selected_category: "SELECTED CATEGORY: {category}",
        no_category_selected: "CATEGORY NOT SELECTED",
        page_title_restore: "BACKUP",
        header_restore: "DATA MANAGEMENT",
        btn_export: "EXPORT DATA",
        btn_import: "IMPORT ARCHIVE",
        page_number: "PAGE {num}",
        initial_log: "STORAGE SYSTEM ACTIVE...",
        initial_log_fail: "STORAGE SYSTEM ACTIVE FAILED...",
        item_placeholder: "SELECT CATEGORY...",
        list_item_label: "UNTIL {date} | STATUS {status}",
        count_label: "TOTAL ITEMS: {count}",
        status_action_0: "DECOMMISSION",
        status_action_1: "RECOVER",
        status_0: "INTACT",
        status_1: "DENTED/RUSTED",
        btn_delete: "REMOVE",
        page_title_stats: "INVENTORY ANALYTICS",
        label_date_filter: "EXPIRES WITHIN THE RANGE",
        log_add_cat: "ADDED \"{val}\" TO LOG.",
        log_add_cat_fail: "FAILED TO ADD CATEGORY: ALREADY EXISTS",
        log_delete_cat: "DELETED CATEGORY \"{val}\"",
        log_delete_cat_fail: "FAILED TO DELETE CATEGORY",
        log_add_item: "ITEM {cat} UNTIL {date} REGISTERED IN BOX {box}",
        log_add_fail: "FAILED TO ADD ITEM",
        log_update_status: "SET {meta} STATUS TO {status}",
        log_delete: "DELETED {meta}",
        log_import: "ARCHIVE IMPORTED INTO STORAGE",
        log_export: "ARCHIVE EXPORTED FROM STORAGE",
        version: "Inventory Management System v2.0"
    },
    RU_SLAVIC: {
        item_repr_full: "УГОЩЕНИЕ {cat}, ПОЛКА {box}, ДО {date}, СТАТУС {status}",
        page_title_intake: "ПРИЕМЪ ЯСТВА ВЪ ПОГРЕБЪ",
        page_title_storage: "ПОГРЕБЪ",
        page_title_categories: "РОДЫ ЯСТВЪ",
        header_main: "РАСПРЕДѢЛЕНIЕ ДОБРА",
        header_storage: "ОПИСЬ ПОГРЕБА",
        header_categories: "УПРАВЛЕНIЕ РОДАМИ",
        categories_list_header: "СПИСОКЪ РОДОВЪ",
        category_input: "ВВЕДИ РОДЪ ЯСТВА",
        add_category_btn: "ДОБАВИТИ НОВЫЙ РОДЪ",
        label_expiry: "ДО КАКОГО ДНЯ ГОДНО:",
        label_box: "ГДѢ ЛЕЖИТЪ (ПОЛКА №):",
        box: "ПОЛКА:",
        register_item_btn: "СЛОЖИТИ ВЪ ПОГРЕБЪ",
        label_status: "КАКОЕ СОСТОЯНIЕ",
        selected_category: "ВЫБРАННЫЙ РОД: {category}",
        no_category_selected: "РОДЪ НЕ ВЫБРАНЪ",
        page_title_restore: "КЛАДОВАЯ ПАМЯТИ",
        header_restore: "РАСПОРЯЖЕНIЕ ДОБРОМЪ",
        btn_export: "СБЕРЕЧИ ВЪ СВИТОКЪ",
        btn_import: "ПОДНЯТИ ИЗЪ СВИТКА",
        page_number: "БЕРЕСТА {num}",
        initial_log: "ПОГРЕБЪ СТОИТЪ КРѢПКО...",
        initial_log_fail: "ПОГРЕБЪ РУХНУЛЪ...",
        item_placeholder: "ВЫБЕРИ РОДЪ ЯСТВА...",
        list_item_label: "ДО {date} | {status}",
        count_label: "ВСЕГО ДОБРА: {count}",
        status_action_0: "ЗАХВОРАЛЪ",
        status_action_1: "СПАСТИ",
        status_0: "ДОБРЫЙ МОЛОДЕЦ",
        status_1: "ЗАХУДАЛЫЙ",
        btn_delete: "УБРАТИ",
        page_title_stats: "РАСКЛАДЪ ПО ПОГРЕБУ",
        label_date_filter: "СМОТРѢТИ ПО СРОКУ",
        log_add_cat: "РОДЪ \"{val}\" ЗАНЕСЕНЪ ВЪ ЛѢТОПИСЬ.",
        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТИ РОДЪ",
        log_delete_cat: "РОДЪ \"{val}\" УБРАНЪ ИЗЪ ЛѢТОПИСИ.",
        log_delete_cat_fail: "НЕ УДАЛОСЬ УБРАТИ РОДЪ",
        log_add_item: "{cat} ДО {date} УЛОЖЕНО НА ПОЛКУ {box}",
        log_add_fail: "НЕ УДАЛОСЬ ДОБАВИТИ ОБЪЕКТЪ",
        log_update_status: "{meta} ТЕПЕРЬ: {status}",
        log_delete: "{meta} УБРАНО",
        log_import: "ЛЕТОПИСЬ ЧИТАЕТСЯ. ДОБРО ВЪ ПОГРЕБЪ",
        log_export: "ЛЕТОПИСЬ СОСТАВЛЕНА",
        version: "СИСТЕМА СВИТКОВЪ v2.0"
    },
    RU_FORMAL: {
        item_repr_full: "КАТЕГОРИЯ {cat}, КОРОБКА {box}, ДО {date}, СТАТУС {status}",
        page_title_intake: "ПРИЕМ ТМЦ",
        page_title_storage: "СКЛАД",
        page_title_categories: "КАТЕГОРИИ",
        header_main: "РАСПРЕДЕЛЕНИЕ ЗАПАСОВ",
        header_storage: "ОБЗОР СКЛАДА",
        header_categories: "УПРАВЛЕНИЕ КАТЕГОРИЯМИ",
        categories_list_header: "СПИСОК КАТЕГОРИЙ",
        category_input: "ВВЕДИТЕ КАТЕГОРИЮ",
        add_category_btn: "ДОБАВИТЬ НОВУЮ КАТЕГОРИЮ",
        label_expiry: "СРОК ГОДНОСТИ ДО:",
        label_box: "МЕСТО ХРАНЕНИЯ (ЯЧЕЙКА №):",
        box: "ЯЧЕЙКА:",
        register_item_btn: "ЗАРЕГИСТРИРОВАТЬ",
        label_status: "СТАТУС",
        selected_category: "ВЫБРАННАЯ КАТЕГОРИЯ: {category}",
        no_category_selected: "КАТЕГОРИЯ НЕ ВЫБРАНА",
        page_title_restore: "РЕЗЕРВНОЕ КОПИРОВАНИЕ",
        header_restore: "УПРАВЛЕНИЕ ДАННЫМИ",
        btn_export: "ЭКСПОРТИРОВАТЬ",
        btn_import: "ЗАГРУЗИТЬ АРХИВ",
        page_number: "СТРАНИЦА {num}",
        initial_log: "СИСТЕМА МОНИТОРИНГА ЗАПУЩЕНА...",
        initial_log_fail: "В СИСТЕМЕ МОНИТОРИНГА ПРОИЗОШЕЛ СБОЙ...",
        item_placeholder: "ВЫБЕРИТЕ КАТЕГОРИЮ...",
        list_item_label: "ДО {date} | СТАТУС {status}",
        count_label: "ВСЕГО ЕДИНИЦ: {count}",
        status_action_0: "СПИСАТЬ",
        status_action_1: "ВОССТАНОВИТЬ",
        status_0: "ЦЕЛЫЙ",
        status_1: "МЯТЫЙ/ПРОРЖАВЕВШИЙ",
        btn_delete: "УДАЛИТЬ",
        page_title_stats: "АНАЛИЗ",
        label_date_filter: "ДИАПАЗОН ДАТ",
        log_add_cat: "КАТЕГОРИЯ \"{val}\" ВНЕСЕНА В РЕЕСТР.",
        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ КАТЕГОРИЮ",
        log_delete_cat: "КАТЕГОРИЯ \"{val}\" УДАЛЕНА ИЗ РЕЕСТРА.",
        log_delete_cat_fail: "НЕ УДАЛОСЬ УДАЛИТЬ КАТЕГОРИЮ",
        log_add_item: "ПРОДУКЦИЯ {cat} (СРОК {date}) РАЗМЕЩЕНА В ЯЧЕЙКЕ {box}",
        log_add_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ ОБЪЕКТ",
        log_update_status: "ОБЪЕКТУ {meta} ПРИСВОЕН СТАТУС {status}",
        log_delete: "ОБЪЕКТ {meta} УДАЛЕН",
        log_import: "АРХИВ ЗАГРУЖЕН В СИСТЕМУ",
        log_export: "АРХИВ СОХРАНЕН",
        version: "СИСТЕМА УПРАВЛЕНИЯ ТМЦ v2.0"
    }
};
export function getCurrentLocale() {
    const params = new URLSearchParams(window.location.search);
    let lang = params.get('lang');
    if (lang) {
        sessionStorage.setItem('app_lang', lang);
    }
    else {
        lang = sessionStorage.getItem('app_lang') || 'RU_FORMAL';
    }
    return LOCALES[lang] || LOCALES.RU_PRISON;
}
export function renderPattern(key, params = {}) {
    const template = getCurrentLocale()[key] || key;
    return template.replace(LOCALE_REGEX, (match, prop) => {
        return params[prop] !== undefined ? String(params[prop]) : match;
    });
}
export function localizeDOM() {
    document.querySelectorAll('[data-locale]').forEach(el => {
        const key = el.getAttribute('data-locale');
        el.textContent = renderPattern(key);
    });
    document.querySelectorAll('[data-locale-placeholder]').forEach(el => {
        const key = el.getAttribute('data-locale-placeholder');
        el.placeholder = renderPattern(key);
    });
}
export function repr(item, category = undefined) {
    if (category === undefined) {
        category = "UNKNOWN";
    }
    return renderPattern("item_repr_full", {
        cat: category,
        box: item.box_id,
        date: new Date(item.expiration_date).toLocaleDateString(),
        status: renderPattern(item.status === 0 ? "status_0" : "status_1")
    });
}
//# sourceMappingURL=vocab.js.map