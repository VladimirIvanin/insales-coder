---
name: insales-coder
description: "Разработка виджетов InSales 4-го поколения: архитектура, Liquid, common.js, библиотеки из info.json, кеш и миграция Splide→TvistV1. Применяй при создании или доработке виджетов и их Liquid/JS/SCSS."
---

# InSales Coder

Создавай и дорабатывай виджеты InSales поколения 4 по исходникам и данным задачи. Без MCP и магазина можно подготовить полный пакет; установка и проверка витрины требуют доступной среды.

## Порядок работы

1. Определи результат: отдельный виджет, изменение существующего или страница из нескольких секций. Для переноса страницы сначала прочитай [перенос прототипа](widget-architecture/prototype-page.md) и составь перечень секций и действий.
2. Для нового пакета прочитай [формат и обёртку](widget-architecture/reference.md). Для доработки начни с актуальных исходников. Открывай профильные справочники ниже по используемым механизмам; все ссылки читать не требуется.
3. Реализуй контент через настройки, блоки и каталог: [редактируемость](widget-architecture/editable-theme.md). Примеры типичных виджетов помогают с контрактами платформы, но не определяют состав и композицию задачи.
4. Выполни [проверки](widget-architecture/verification.md) и укажи их результаты и границы. Успех структурного checker не подтверждает сборку или работу в магазине.

## Контракты, которые нужны новому пакету

- Явно указывай `generation: 4`. Исполняемые файлы импорта — `snippet.liquid`, `snippet.scss`, необязательный `snippet.js`.
- `settings_form.json` содержит две вкладки `content` и `design` с группами `items`; defaults — в `settings_data.json`.
- Категория галереи и размещение — разные значения: например, `headers` и `header`. Тип, категорию, шаблон блоков и библиотеки сверяй с [форматом пакета](widget-architecture/reference.md#infojson), а не выводи из названия секции.
- Платформа предоставляет `$widget` и вставляет JS без Liquid-рендера. SCSS оборачивается в селектор виджета и компилируется SassC/LibSass; перед использованием современного CSS проверь [совместимость](widget-architecture/sassc-compatibility.md). Каждому экземпляру нужна собственная область DOM и состояния. Статической секции достаточно Liquid/CSS.
- Непосредственно используемые библиотеки объявляй в своём `info.json`. Поля Liquid и API бери из справочников или подтверждённых исходников.

## Справочники по механизму

| Когда нужен | Раздел |
|---|---|
| Файлы пакета, внешняя обёртка, metadata, блоки | [Архитектура](widget-architecture/reference.md) |
| Поля формы и defaults | [Типы настроек](widget-architecture/settings-reference.md), [проверка формы](widget-architecture/settings-validation.md) |
| Ownership, SKU и проверка metadata | [info.json](widget-architecture/info-json-validation.md) |
| Обработчики, состояние, повторный init, cleanup, AccountFile | [Runtime](widget-architecture/runtime.md) |
| Liquid: синтаксис, объекты и фильтры | [Liquid](insales-liquid/reference.md); точечный поиск — [поля](insales-liquid/fields.md) |
| Cart, Products, поиск, AJAX и формы | [common.js](commonjs-widget/reference.md) |
| Подключаемые библиотеки и их API | [Библиотеки](libraries/index.md); новый слайдер — [слайдеры](libraries/sliders.md) |
| Стили темы, настройки отступов | [Core CSS](widget-architecture/core-css-reference.md) |
| Современный CSS в компиляторе платформы | [SassC / LibSass](widget-architecture/sassc-compatibility.md) |
| Изображение категории | [collection.menu_image](liquid-collection-menu-image/reference.md) |
| Ключи кеша | [Кеш](liquid-widget-cache-keys/reference.md) |
| Миграция существующего Splide | [Splide → TvistV1](splide-to-tvist/reference.md) |
| Применение исходников через доступный MCP | [Интеграция с магазином](widget-architecture/store-integration.md) |

## Типичные виджеты

Выбери профиль, только если его функции нужны задаче. Полный пакет служит основой для соответствующих механизмов; оформление и набор секций задаёт пользователь.

| Задача | Профиль |
|---|---|
| Статическая сетка категорий | [Сетка категорий](widget-architecture/collection-links.md) |
| Шапка: каталог, поиск, счётчики, мобильная панель | [Шапка](widget-architecture/header.md) |
| Редактируемые карточки в слайдере | [Слайдер контента](widget-architecture/slider-content.md) |
| FAQ / аккордеон | [FAQ](widget-architecture/faq.md) |
| Обратная связь | [Форма](widget-architecture/feedback-form.md) |
| Cookie-уведомление | [Cookie-баннер](widget-architecture/cookie-notice.md) |
| Галерея, варианты и покупка товара | [Страница товара](widget-architecture/product-detail.md) |
| Позиции корзины, промокод и суммы | [Корзина](widget-architecture/cart-page.md) |
| Сравнение товаров | [Сравнение](widget-architecture/compare-page.md) |
| AJAX-фильтр категории | [Фильтр](widget-architecture/catalog-filter.md) |
