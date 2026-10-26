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
node /absolute/path/to/insales-coder/scripts/validate-info-json.mjs /path/to/widget-folder
# Для системного пакета: добавьте --context system
```

Проверяет структуру `info.json` полного gen4-пакета без MCP. Укажите фактический абсолютный путь установленного скилла. Контекст по умолчанию `custom`, системный задаётся через `--context system`; `--locale ru` проверяет имя выбранного языка. SKU допустим в обоих контекстах при соответствующем формате. Это не проверка ссылок и runtime. [Контракт и ограничения](skills/insales-coder/widget-architecture/info-json-validation.md).

## Когда применять

- Создание или доработка виджетов InSales (info.json, settings, snippet.liquid/scss/js)
- JavaScript через common.js (Cart, Products, EventBus, ajax-компоненты)
- Liquid-сниппеты, фильтры, `{% cache %}`, `{% prefetch %}`
- Рефакторинг ключей кеша, оптимизация `collection.menu_image`
- Миграция Splide → TvistV1

## Лицензия

MIT
