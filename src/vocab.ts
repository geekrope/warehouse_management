const LOCALE_REGEX = /\{(\w+)\}/g;

const LOCALES = {
    RU_PRISON: {
        page_title_intake: "ПРИЕМ ПЕРВОХОДОВ",
        header_main: "УДЕЛИТЬ НА ГРЕВ",
        category_input: "ВЫБЕРИТЕ МАСТЬ",
        add_category_btn: "ДОБАВИТЬ НОВУЮ МАСТЬ",
        label_expiry: "НА СКОЛЬКО ЗАЕХАЛ:",
        label_box: "ХАТА (КОРОБКА #):",
        box: "ХАТА:",
        register_item_btn: "ПРОПИСАТЬСЯ В ХАТЕ",
        header_storage: "СХРОН",
        show_all_check: "ВЫВАЛИТЬ ВСЕ",
        footer_intake_revert: "ПЕРЕБЗДЕТЬ",
        footer_intake_stats: "ОБСТАНОВКА",
        label_status: "КЕМ ПО ЖИЗНИ БУДЕШЬ",

        page_title_restore: "КУБЫШКА",
        header_restore: "КОНСПИРАТИВНАЯ ХАТА",
        btn_export: "ЗАСУХАРИТЬСЯ",
        btn_import: "ПОДНЯТЬ АРХИВ",
        footer_restore: "В КОНТОРУ",
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
        btn_delete: "ЦЕПАНУТЬ",

        page_title_stats: "РАСКЛАД ПО ОБЩАКУ",
        header_stats: "ШМОН",
        label_date_filter: "СКОЛЬКО СРОК МОТАЕШЬ",
        th_category: "ПОГОНЯЛО",
        th_count: "ВЫХОДЯТ ПО УДО",
        th_top_item: "ПЕРВЫЙ НА ВЫХОД",
        footer_stats_back: "В КОНТОРУ",

        log_add_cat: "ЧИРКНУЛИ \"{val}\" В ЖУРНАЛ.",
        log_add_item: "БАЛАНДА {cat} ДО {date} ПРОПИСАНА В ХАТЕ {box}",
        log_add_fail: "НЕ ОБЕССУДЬ БАЛАНДА НЕ ЗАЕХАЛА",
        log_update_status: "УСТАНОВИЛИ {cat} {meta} СТАТУС {status}",
        log_move_box: "ЭТАПИРОВАЛИ {cat} {meta} В {boxVal} ХАТУ",
        log_delete: "ШВАРКНУЛИ {cat} {meta}",
        log_import_success: "АРХИВ В ПОРЯДЕ. ОБЩАК ВОССТАНОВЛЕН",
        log_export_success: "ГОТОВО НАЧАЛЬНИК",
        log_import_error: "КОСЯК: {message}",

        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ МАСТЬ",
        alert_missing: "УКАЖИ МАСТЬ И СРОК",
        confirm_delete: "ПУСКАЕМ {cat} {meta} В РАСХОД?",
        confirm_move: "ЭТАПИРУЕМ {cat} {meta} В {boxVal} ХАТУ?",
        error_file_broken: "ФАЙЛ ЗАШКВАРЕННЫЙ",
        version: "СИСТЕМА ГРАБЕЖ™ v2.0"
    },

    EN: {
        page_title_intake: "ITEM INTAKE",
        header_main: "INVENTORY ALLOCATION",
        category_input: "SELECT CATEGORY",
        add_category_btn: "ADD NEW CATEGORY",
        label_expiry: "EXPIRATION DATE:",
        label_box: "STORAGE UNIT (BOX #):",
        box: "UNIT:",
        register_item_btn: "REGISTER IN STORAGE",
        header_storage: "STORAGE",
        show_all_check: "SHOW ALL",
        footer_intake_revert: "MAINTENANCE",
        footer_intake_stats: "STATS",
        label_status: "STATUS",

        page_title_restore: "BACKUP",
        header_restore: "DATA MANAGEMENT",
        btn_export: "EXPORT DATA",
        btn_import: "IMPORT ARCHIVE",
        footer_restore: "BACK TO MAIN",
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
        header_stats: "INVENTORY ANALYTICS",
        label_date_filter: "EXPIRES WITHIN THE RANGE",
        th_category: "CATEGORY",
        th_count: "COUNT",
        th_top_item: "FIRST TO GO",
        footer_stats_back: "BACK TO MAIN",

        log_add_cat: "ADDED \"{val}\" TO LOG.",
        log_add_item: "ITEM {cat} UNTIL {date} REGISTERED IN BOX {box}",
        log_add_fail: "FAILED TO ADD ITEM",
        log_update_status: "SET {cat} {meta} STATUS TO {status}",
        log_move_box: "MOVED {cat} {meta} TO BOX {boxVal}",
        log_delete: "DELETED {cat} {meta}",
        log_import_success: "ARCHIVE OK. DATABASE RESTORED",
        log_export_success: "EXPORT COMPLETE",
        log_import_error: "ERROR: {message}",

        log_add_cat_fail: "FAILED TO ADD CATEGORY: ALREADY EXISTS",
        alert_missing: "SPECIFY CATEGORY AND DATE",
        confirm_delete: "DELETE {cat} {meta}?",
        confirm_move: "MOVE {cat} {meta} TO {boxVal} BOX?",
        error_file_broken: "FILE CORRUPTED",
        version: "Inventory Management System v2.0"
    },

    RU_SLAVIC: {
        page_title_intake: "ПРИЕМЪ ЯСТВА ВЪ ПОГРЕБЪ",
        header_main: "РАСПРЕДѢЛЕНIЕ ДОБРА",
        category_input: "ВЫБЕРИ РОДЪ ЯСТВА",
        add_category_btn: "ДОБАВИТИ НОВЫЙ РОДЪ",
        label_expiry: "ДО КАКОГО ДНЯ ГОДНО:",
        label_box: "ГДѢ ЛЕЖИТЪ (ПОЛКА №):",
        box: "ПОЛКА:",
        register_item_btn: "СЛОЖИТИ ВЪ ПОГРЕБЪ",
        header_storage: "ПОГРЕБЪ",
        show_all_check: "ВСѢ УБРАНСТВА",
        footer_intake_revert: "ПРОВЕРИТИ ЗАКАТКУ",
        footer_intake_stats: "ПОСМОТРѢТИ РАСКЛАДЪ",
        label_status: "КАКОЕ СОСТОЯНIЕ",

        page_title_restore: "КЛАДОВАЯ ПАМЯТИ",
        header_restore: "РАСПОРЯЖЕНIЕ ДОБРОМЪ",
        btn_export: "СБЕРЕЧИ ВЪ СВИТОКЪ",
        btn_import: "ПОДНЯТИ ИЗЪ СВИТКА",
        footer_restore: "ВЪ ИЗБУ",
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
        header_stats: "ПЕРЕПИСЬ",
        label_date_filter: "СМОТРѢТИ ПО СРОКУ",
        th_category: "РОДЪ ЯСТВА",
        th_count: "СКОЛЬКО",
        th_top_item: "ПЕРВЫМЪ ИДЕТЪ",
        footer_stats_back: "ВЪ ИЗБУ",

        log_add_cat: "РОДЪ \"{val}\" ЗАНЕСЕНЪ ВЪ ЛѢТОПИСЬ.",
        log_add_item: "{cat} ДО {date} УЛОЖЕНО НА ПОЛКУ {box}",
        log_add_fail: "НЕ УДАЛОСЬ ДОБАВИТИ ОБЪЕКТЪ",
        log_update_status: "{cat} {meta} ТЕПЕРЬ: {status}",
        log_move_box: "{cat} {meta} ПЕРЕЛОЖЕНО НА ПОЛКУ {boxVal}",
        log_delete: "{cat} {meta} УБРАНО",

        log_import_success: "ЛѢТОПИСЬ ЧИТАЕТСЯ. ПОГРЕБЪ ВОССТАНОВЛЕНЪ",
        log_export_success: "ГОТОВО, БАРИНЪ",
        log_import_error: "БѢДА: {message}",

        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТИ РОДЪ",
        alert_missing: "УКАЖИ РОДЪ И СРОКЪ",
        confirm_delete: "УБРАТИ {cat} {meta}?",
        confirm_move: "ПЕРЕЛОЖИТИ {cat} {meta} НА ПОЛКУ {boxVal}?",
        error_file_broken: "СВИТОКЪ ИСПОРЧЕНЪ",
        version: "ПОДУМАТь над названием"
    },

    RU_FORMAL: {
        page_title_intake: "ПРИЕМ ТМЦ",
        header_main: "РАСПРЕДЕЛЕНИЕ ЗАПАСОВ",
        category_input: "ВЫБЕРИТЕ КАТЕГОРИЮ",
        add_category_btn: "ДОБАВИТЬ НОВУЮ КАТЕГОРИЮ",
        label_expiry: "СРОК ГОДНОСТИ ДО:",
        label_box: "МЕСТО ХРАНЕНИЯ (ЯЧЕЙКА №):",
        box: "ЯЧЕЙКА:",
        register_item_btn: "ЗАРЕГИСТРИРОВАТЬ",
        header_storage: "СКЛАД",
        show_all_check: "ПОКАЗАТЬ ВСЕ",
        footer_intake_revert: "ОБСЛУЖИВАНИЕ",
        footer_intake_stats: "СТАТИСТИКА",
        label_status: "СТАТУС",

        page_title_restore: "РЕЗЕРВНОЕ КОПИРОВАНИЕ",
        header_restore: "УПРАВЛЕНИЕ ДАННЫМИ",
        btn_export: "ЭКСПОРТИРОВАТЬ",
        btn_import: "ЗАГРУЗИТЬ АРХИВ",
        footer_restore: "В МЕНЮ",
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
        header_stats: "АНАЛИТИКА ПО СКЛАДУ",
        label_date_filter: "ДИАПАЗОН ДАТ",
        th_category: "КАТЕГОРИЯ",
        th_count: "КОЛ-ВО",
        th_top_item: "ВЕРХ ОЧЕРЕДИ",
        footer_stats_back: "В МЕНЮ",

        log_add_cat: "КАТЕГОРИЯ \"{val}\" ВНЕСЕНА В РЕЕСТР.",
        log_add_item: "ПРОДУКЦИЯ {cat} (СРОК {date}) РАЗМЕЩЕНА В ЯЧЕЙКЕ {box}",
        log_add_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ ОБЪЕКТ",
        log_update_status: "ОБЪЕКТУ {cat} {meta} ПРИСВОЕН СТАТУС {status}",
        log_move_box: "ОБЪЕКТ {cat} {meta} ПЕРЕМЕЩЕН В ЯЧЕЙКУ {boxVal}",
        log_delete: "ОБЪЕКТ {cat} {meta} УДАЛЕН",
        log_import_success: "ДАННЫЕ ВОССТАНОВЛЕНЫ ИЗ АРХИВА",
        log_export_success: "ЭКСПОРТ ВЫПОЛНЕН",
        log_import_error: "ОШИБКА: {message}",

        log_add_cat_fail: "НЕ УДАЛОСЬ ДОБАВИТЬ КАТЕГОРИЮ",
        alert_missing: "УКАЖИТЕ КАТЕГОРИЮ И СРОК",
        confirm_delete: "ПОДТВЕРЖДАЕТЕ УДАЛЕНИЕ {cat} {meta}?",
        confirm_move: "ПОДТВЕРЖДАЕТЕ ПЕРЕМЕЩЕНИЕ {cat} {meta} В {boxVal} ?",
        error_file_broken: "ФАЙЛ ПОВРЕЖДЕН",
        version: "СИСТЕМА УПРАВЛЕНИЯ ТМЦ v2.0"
    }
};

export type LocaleType = typeof LOCALES.RU_PRISON;
export type Locales = keyof typeof LOCALES;

export function getCurrentLocale(): LocaleType {
    const params = new URLSearchParams(window.location.search);
    let lang = params.get('lang') as Locales;

    if (lang) {
        sessionStorage.setItem('app_lang', lang);
    } else {
        lang = (sessionStorage.getItem('app_lang') as Locales) || 'RU_FORMAL';
    }

    return LOCALES[lang as Locales] || LOCALES.RU_PRISON;
}

export function renderPattern(key: keyof LocaleType, params: Record<string, any> = {}): string {
    const template = getCurrentLocale()[key] || key;
    return template.replace(LOCALE_REGEX, (match, prop) => {
        return params[prop] !== undefined ? String(params[prop]) : match;
    });
}

export function localizeDOM(): void {
    document.querySelectorAll('[data-locale]').forEach(el => {
        const key = el.getAttribute('data-locale') as keyof LocaleType;
        el.textContent = renderPattern(key);
    });

    document.querySelectorAll('[data-locale-placeholder]').forEach(el => {
        const key = el.getAttribute('data-locale-placeholder') as keyof LocaleType;
        (el as HTMLInputElement).placeholder = renderPattern(key);
    });
}