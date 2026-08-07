---
name: insales-coder
description: Разработка виджетов InSales 4-го поколения — архитектура (info.json, settings_form, snippet.liquid/scss/js, EventBus, иконки), common.js (Cart, Products, EventBus, ajax-товары, формы), Liquid InSales (переменные, фильтры, {% cache %}, {% prefetch %}), ключи кеша (widget_basic_cache_key, account.*_basic_cache_key), оптимизация collection.menu_image, миграция Splide→TvistV1. Применяй при создании или доработке виджетов, liquid-сниппетов, snippet.js, рефакторинге кеша, замене Splide на Tvist.
---

# InSales Coder

Единый скилл для разработки виджетов InSales 4-го поколения. Детали — в тематических справочниках ниже; читай только нужный раздел (progressive disclosure).

## Маршрутизация по задаче

| Задача | Справочник |
|--------|------------|
| Создать виджет с нуля, настройки, блоки, CSS-переменные, EventBus, иконки, переводы | [widget-architecture/reference.md](widget-architecture/reference.md) |
| snippet.js: Cart, Products, EventBus, избранное, сравнение, поиск, ajax-компоненты, формы | [commonjs-widget/reference.md](commonjs-widget/reference.md) |
| Liquid: переменные, фильтры, объекты InSales, prefetch | [insales-liquid/reference.md](insales-liquid/reference.md) |
| Шпаргалка полей Liquid (product, collection, cart…) | [insales-liquid/fields.md](insales-liquid/fields.md) |
| Примеры Liquid-кода | [insales-liquid/examples/README.md](insales-liquid/examples/README.md) |
| Замена `collection.products \| first` на `collection.menu_image` | [liquid-collection-menu-image/reference.md](liquid-collection-menu-image/reference.md) |
| Рефакторинг ключей `{% cache %}` в виджетах | [liquid-widget-cache-keys/reference.md](liquid-widget-cache-keys/reference.md) |
| Миграция Splide (v2/v3) → TvistV1 | [splide-to-tvist/reference.md](splide-to-tvist/reference.md) |

## Порядок работы агента

1. **Новый виджет** → `widget-architecture/reference.md` (структура файлов, info.json, settings).
2. **После создания/правки info.json** → запустить валидатор:
   ```bash
   node skills/insales-coder/scripts/validate-info-json.mjs path/to/widget-folder
   ```
   Правила и типичные ошибки → [widget-architecture/info-json-validation.md](widget-architecture/info-json-validation.md).
   **sku только у системных виджетов** (`handle` начинается с `system_`); у кастомных — не указывать.
3. **Liquid в snippet.liquid** → `insales-liquid/reference.md` + при необходимости `fields.md`, `liquid-widget-cache-keys/reference.md`, `liquid-collection-menu-image/reference.md`.
4. **JavaScript в snippet.js** → `commonjs-widget/reference.md`; для слайдеров — `splide-to-tvist/reference.md`.
5. **Не придумывать** поля Liquid и API common.js — сверяться со справочниками и [Liquidhub](https://liquidhub.ru/collection/shpargalka-liquid).

## Дополнительные справочники

- **widget-architecture:** [info-json-validation.md](widget-architecture/info-json-validation.md), [settings-reference.md](widget-architecture/settings-reference.md), [core-css-reference.md](widget-architecture/core-css-reference.md), [icons-reference.md](widget-architecture/icons-reference.md), [icons-editor-reference.md](widget-architecture/icons-editor-reference.md)
- **commonjs-widget:** [markup.md](commonjs-widget/markup.md), [js-api.md](commonjs-widget/js-api.md), [ajax-components.md](commonjs-widget/ajax-components.md), [forms.md](commonjs-widget/forms.md), [patterns.md](commonjs-widget/patterns.md)
- **splide-to-tvist:** [api-map.md](splide-to-tvist/api-map.md), [patterns.md](splide-to-tvist/patterns.md), [tvist-reference.md](splide-to-tvist/tvist-reference.md)
