# InSales Coder — Agent Skills

[![skills.sh](https://skills.sh/b/VladimirIvanin/insales-coder)](https://skills.sh/VladimirIvanin/insales-coder)

Agent Skill для разработки виджетов InSales 4-го поколения: архитектура виджетов, common.js, Liquid, кеширование, миграция Splide → TvistV1.

## Установка

Нужны Node.js 22.20+ (с npm/npx), Git и доступ к npm и GitHub. Запустите из каталога проекта:

Установка одной командой без вопросов и подтверждений:

```bash
npx --yes skills add VladimirIvanin/insales-coder --skill insales-coder --yes
```

Первый `--yes` относится к `npx`: разрешает загрузку утилиты `skills` без вопроса `Ok to proceed?`. Второй относится к `skills`: отключает её вопросы и устанавливает `insales-coder` для обнаруженных агентов в текущем проекте. Это два отдельных параметра — [документация npx](https://docs.npmjs.com/cli/v11/commands/npx/), [параметры skills add](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-add).

Для конкретного агента добавьте `--agent`:

```bash
# Codex
npx --yes skills add VladimirIvanin/insales-coder --skill insales-coder --agent codex --yes

# Cursor
npx --yes skills add VladimirIvanin/insales-coder --skill insales-coder --agent cursor --yes

# Claude Code
npx --yes skills add VladimirIvanin/insales-coder --skill insales-coder --agent claude-code --yes
```

Для установки во все проекты пользователя добавьте `--global`:

```bash
npx --yes skills add VladimirIvanin/insales-coder --skill insales-coder --global --yes
```

Проверить установку в текущем проекте (для глобальной добавьте `--global`):

```bash
npx --yes skills list
```

Если хотите выбрать агентов и способ установки вручную, запустите `npx --yes skills add VladimirIvanin/insales-coder`.

### Ошибка `npm error canceled`

Если ошибка появилась сразу после `Ok to proceed? (y)`, npm отменил загрузку утилиты `skills`, и установка скилла ещё не началась. Для подтверждения нужна латинская `y`: кириллическая `у` не подходит. Используйте команду с двумя `--yes` выше, чтобы пропустить оба этапа подтверждения.

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
