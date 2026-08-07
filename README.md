# InSales Coder — Agent Skills

[![skills.sh](https://skills.sh/b/VladimirIvanin/insales-coder)](https://skills.sh/VladimirIvanin/insales-coder)

Agent Skill для разработки виджетов InSales 4-го поколения: архитектура виджетов, common.js, Liquid, кеширование, миграция Splide → TvistV1.

## Установка

```bash
npx skills add VladimirIvanin/insales-coder
```

Конкретный скилл:

```bash
npx skills add VladimirIvanin/insales-coder@insales-coder
```

Глобально (для всех проектов):

```bash
npx skills add VladimirIvanin/insales-coder -g
```

Только для Cursor:

```bash
npx skills add VladimirIvanin/insales-coder --agent cursor -y
```

## Скиллы

| Скилл | Описание |
|-------|----------|
| `insales-coder` | Единый скилл для виджетов InSales: widget-architecture, commonjs-widget, insales-liquid, cache keys, Splide→Tvist |

## Структура

```
skills/
└── insales-coder/
    ├── SKILL.md
    ├── scripts/
    │   └── validate-info-json.mjs   # валидатор info.json
    ├── widget-architecture/
    ├── commonjs-widget/
    ├── insales-liquid/
    ├── liquid-widget-cache-keys/
    ├── liquid-collection-menu-image/
    └── splide-to-tvist/
```

## Валидация info.json

```bash
node skills/insales-coder/scripts/validate-info-json.mjs path/to/widget-folder
```

Проверяет обязательные поля, enum-значения и правило **sku только для системных виджетов** (`handle` → `system_*`).

## Когда применять

- Создание или доработка виджетов InSales (info.json, settings, snippet.liquid/scss/js)
- JavaScript через common.js (Cart, Products, EventBus, ajax-компоненты)
- Liquid-сниппеты, фильтры, `{% cache %}`, `{% prefetch %}`
- Рефакторинг ключей кеша, оптимизация `collection.menu_image`
- Миграция Splide → TvistV1

## Лицензия

MIT
