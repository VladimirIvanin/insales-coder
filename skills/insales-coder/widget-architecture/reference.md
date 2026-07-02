
# Виджеты InSales 4-го поколения

## Структура виджета

Каждый виджет — папка с файлами:

| Файл | Назначение |
|---|---|
| `snippet.liquid` | HTML-разметка (Liquid). Доступны `widget_settings`, `data.blocks`, `widget_messages` |
| `snippet.scss` | SCSS-стили. `&` — ссылка на `.layout.widget-type_{handle}` |
| `snippet.js` | JS. Автооборачивается в `try/catch`. Доступны `widget` и `$widget` |
| `info.json` | Метаданные: generation, type, handle, sku, libraries... |
| `settings_form.json` | Форма настроек редактора |
| `settings_data.json` | Значения настроек по умолчанию |
| `messages.json` | Переводы: ru, ua, en, es |
| `setup.json` | Блоки по умолчанию (только для blockListWidgetType) |
| `block_settings_presets.json` | AI-подсказки для блоков + флаг fixed_blocks (опционально) |
| `preview.jpg` / `mobile_preview.jpg` | Превью в галерее виджетов |

---

## Системная обёртка

### snippet.liquid

Код автоматически оборачивается в:

```html
<div
  class="layout widget-type_{handle}"
  style="--setting-name:value; --another:value;"
  data-widget-drop-item-id="123456"
>
  <!-- твой snippet.liquid -->
</div>
```

Все настройки из `settings_form.json` становятся CSS-переменными в `style`.

Доступные переменные в Liquid:
- `widget_settings.setting_name` — значение настройки
- `data.blocks` — блоки виджета (только blockListWidgetType)
- `widget_messages.key` — переводы из messages.json
- Все глобальные Liquid-переменные InSales: `account`, `product`, `collection`, `cart`, `linklists`, `settings` и др.

### snippet.js

Код автоматически оборачивается в:

```js
try {
  let widget = '.widget-type_{handle}'
  let $widget = $('.widget-type_{handle}')
  // твой snippet.js
} catch(error) {
  console.error('Widget "widget-type_{handle}"', error)
}
```

Всегда перебирай `$widget` через `.each()` — на странице может быть несколько экземпляров:

```js
$widget.each(function(index, el) {
  new LazyLoad({ container: $(el).get(0), elements_selector: '.lazyload' })
})
```

Подписки на `EventBus` с мутацией DOM товара (например `change_variant:insales:product`) размещай внутри этого же `$widget.each(...)` и фильтруй по текущему `el`, иначе изменения затронут соседние инстансы виджета.

### snippet.scss

`&` — ссылается на `.layout.widget-type_{handle}`. Не добавляй класс виджета вручную, не используй `:root`.

Стили для разных состояний настроек через `[style*="..."]`:

```scss
@include background-color(--bg); // первая строка в 99% виджетов

.my-element {
  font-size: var(--font-size, 16px);
}

&[style*="--hide-title:true;"] .my-element__title {
  display: none;
}
```

---

## info.json

```json
{
  "generation": 4,
  "type": "SimpleWidgetType",
  "handle": "my_widget_1",
  "sku": "MW1",
  "page_kinds": ["all"],
  "widget_list_kinds": ["before_content", "content", "after_content", "footer"],
  "widget_category_handle": "banner",
  "name": { "ru": "Мой виджет", "en": "My widget" },
  "description": { "ru": "Описание", "en": "Description" },
  "libraries": ["jquery", "my-layout", "vanilla-lazyload"]
}
```

**Типы виджетов:**
- `"SimpleWidgetType"` — без блоков
- `"blockListWidgetType"` — с блоками (нужен `block_template_handle` + `setup.json`)

**`page_kinds`:** `all`, `index`, `collection`, `product`, `cart`, `page`, `search`, `blog`, `article`, `favorite`, `compare`

**`widget_list_kinds`:** `top_panel`, `header`, `before_content`, `content`, `after_content`, `sidebar`, `footer`, `bottom_panel`, `outside`

**`libraries`:** `commonjs_v2`, `jquery`, `my-layout`, `vanilla-lazyload`, `splide`, `splide3`, `fslightbox`, `micromodal`, `body-scroll-lock`, `js-cookie`, `cut-list`, `nouislider`, `microalert`

---

## settings_form.json

Структура — объект с секциями (`content`, `design`), каждая — массив групп:

```json
{
  "content": [
    {
      "group_name": "{{ messages.picture }}",
      "items": [
        {
          "name": "banner-img",
          "label": "{{ messages.picture }}",
          "type": "file",
          "general": true,
          "general_position": 1
        },
        {
          "class": "range",
          "name": "font-size",
          "label": "{{ messages.font_size }}",
          "type": "number",
          "min": 14,
          "max": 32,
          "step": 2,
          "unit": "px",
          "with_btns": true
        }
      ]
    }
  ],
  "design": [
    {
      "items": [
        { "name": "bg", "type": "color", "clearable": true },
        { "name": "layout-wide-bg", "type": "checkbox" }
      ]
    }
  ]
}
```

**Флаги полей:**
- `"general": true` — поле в основных настройках редактора
- `"general_position": N` — порядок в основных настройках
- `"enable_server_reload": true` — изменение перезагружает шаблон
- `"hide_mobile": true` — скрыто в мобильном редакторе
- `"branding_field": "logo"` — связь с брендинговыми данными магазина

Подробнее по типам полей → [settings-reference.md](settings-reference.md)

---

## settings_data.json

```json
{
  "layout-wide-bg": true,
  "layout-pt": 2,
  "layout-pb": 2,
  "hide-mobile": false,
  "hide-desktop": false,
  "font-size": 20,
  "img-ratio": 1.5,
  "title": {
    "ru": "Заголовок",
    "ua": "Заголовок",
    "en": "Title",
    "es": "Título"
  }
}
```

Текстовые поля с переводами — объект с ключами `ru`, `ua`, `en`, `es`.

---

## messages.json

```json
{
  "ru": {
    "title": "Заголовок",
    "picture": "Изображение",
    "blocks": "Блоки",
    "block": "Блок",
    "block_list": "Список блоков"
  },
  "ua": { "title": "Заголовок", "picture": "Зображення" },
  "en": { "title": "Title", "picture": "Image" },
  "es": { "title": "Título", "picture": "Imagen" }
}
```

Зарезервированные ключи для блочных виджетов: `blocks`, `block`, `block_list`.

Доступ в Liquid: `{{ widget_messages.title }}`.
Доступ в settings_form.json: `{{ messages.title }}`.

---

## block_settings_presets.json

Опциональный файл только для `blockListWidgetType`.

```json
{
  "fixed_blocks": true,
  "default_preset": {
    "fields": {
      "name": { "ai_text_max_symbols": 35 },
      "description": { "ai_text_max_symbols": 150 },
      "image": { "ai_image_orientation": "landscape" },
      "ai_image_category": "human"
    }
  }
}
```

- `fixed_blocks: true` — блоки нельзя добавлять/удалять в редакторе
- `ai_text_max_symbols` — максимальная длина AI-генерируемого текста для поля
- `ai_image_orientation` — ориентация AI-изображения: `"landscape"` или `"portrait"`
- `ai_image_category` — категория AI-изображения (например `"human"`)

---

## EventBus — события редактора

Подписка на изменения настроек в визуальном редакторе:

```js
EventBus.subscribe([
  'widget:input-setting:insales:system:editor',
  'widget:change-setting:insales:system:editor',
  'widget:input-color:insales:system:editor'
], (data) => {
  // data.widget_item_id — id конкретного экземпляра виджета
  // data.setting_name  — имя настройки (например "align-title")
  // data.value         — новое значение
  // data.unit          — единица измерения ("px", "rem", "%" и т.д.)
  // data.type          — тип поля ("color", "text", "number", "select", "icon_group"...)
})
```

Пример реакции на изменение конкретной настройки:

```js
$widget.each(function(index, el) {
  const widgetItemId = $(el).data('widget-drop-item-id')

  EventBus.subscribe([
    'widget:input-setting:insales:system:editor',
    'widget:change-setting:insales:system:editor',
    'widget:input-color:insales:system:editor'
  ], (data) => {
    if (data.widget_item_id !== widgetItemId) return
    if (data.setting_name === 'slide-width') {
      // обновить слайдер
    }
  })
})
```

---

## Дополнительные справочники (в этой же папке)

- [settings-reference.md](settings-reference.md) — все 15 типов настроек с параметрами и примерами
- [core-css-reference.md](core-css-reference.md) — классы и CSS-переменные библиотеки core.css / my-layout
- [icons-reference.md](icons-reference.md) — 82 иконки шрифта `insales-icons` на витрине
- [icons-editor-reference.md](icons-editor-reference.md) — 240 имён `mdi-*` для поля `icon` в `icon_group`
