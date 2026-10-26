
# Виджеты InSales 4-го поколения

При создании любого виджета прочитай [editable-theme.md](editable-theme.md): в нём правила редактируемости контента, выбора изображений и форматирования Liquid. Правила отдельных секций применяй, когда собираешь страницу.

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

DOM `id` должен быть уникален для экземпляра, включая два виджета одного товара. Статические `id="slider-title"` и ID только из `product.id` дублируются. Для `aria-labelledby`/`for` нужен соответствующий существующий узел с уникальным ID; без надёжного идентификатора экземпляра используй вложенный `<label>` или текстовый `aria-label` там, где это подходит. Если заголовок скрывается условием, не оставляй ссылку на отсутствующий ID.

Всегда перебирай `$widget` через `.each()` — на странице может быть несколько экземпляров:

```js
$widget.each(function(index, el) {
  new LazyLoad({ container: $(el).get(0), elements_selector: '.lazyload' })
})
```

Подписки на `EventBus` с мутацией DOM товара фильтруй по форме текущего `el`, иначе изменения затронут соседние экземпляры. Для повторной инициализации и отписки читай [runtime.md](runtime.md): guard удалённого DOM не освобождает подписку.

### snippet.scss

`&` — ссылается на `.layout.widget-type_{handle}`. Не добавляй класс виджета вручную, не используй `:root`.

Стили для разных состояний настроек через `[style*="..."]`:

```scss
@include background-color(--bg); // если настройка bg нужна этому виджету

.my-element {
  font-size: var(--font-size, 16px);
}

&[style*="--hide-title:true;"] .my-element__title {
  display: none;
}
```

Стили компилируются SassC/LibSass: современный CSS-синтаксис внутри известных Sass-функций может вызвать ошибку. Например, вместо `rgb(16 24 40 / 16%)` используй совместимый `rgba(16, 24, 40, .16)`. `min()`/`max()` с разными единицами LibSass тоже может попытаться вычислить сам: вместо `width: min(92vw, 28rem)` подходят `width: 92vw; max-width: 28rem`, Для сохранения CSS-вычисления подходит и `max-height: unquote("min(50vh, 24rem)")`: Sass выводит строку как CSS-функцию, а единицы вычисляет браузер. Проверяй SCSS внутри системной обёртки `&`. Компиляция другим Sass или с заглушками миксинов проверяет лишь часть совместимости; это не сборка платформой. Миксины компилятора и JS/CSS-библиотеки из `libraries` — разные зависимости.

---

## info.json

**Системный виджет** (установка без владельцев account/theme; его handle должен начинаться с `system_`):

```json
{
  "generation": 4,
  "type": "SimpleWidgetType",
  "handle": "system_widget_banner_1",
  "sku": "BB1",
  "page_kinds": ["all"],
  "widget_list_kinds": ["before_content", "content", "after_content", "footer"],
  "widget_category_handle": "banner",
  "name": { "ru": "Баннер", "en": "Banner" },
  "description": { "ru": "Описание", "en": "Description" },
  "libraries": ["jquery", "my-layout", "vanilla-lazyload"]
}
```

**Кастомный виджет** (при установке передаются account/theme) — обычно без `sku`, чтобы его сгенерировала платформа. Явный SKU допустим в формате кастомного типа; детали и контекст проверки — в [info-json-validation.md](info-json-validation.md):

```json
{
  "generation": 4,
  "type": "block_list_widget_type",
  "handle": "my_widget_1",
  "page_kinds": ["all"],
  "widget_list_kinds": ["content"],
  "widget_category_handle": "banner",
  "block_template_handle": "system-image-and-content",
  "name": { "ru": "Мой виджет", "en": "My widget" }
}
```

`widget_category_handle` — ссылка на категорию галереи, а `widget_list_kinds` — места размещения. Их значения не взаимозаменяемы:

| Назначение | Пример категории галереи | Размещение |
|---|---|---|
| Шапка | `headers` | `header` |
| Преимущества | `benefits` | `content` |
| Карточка товара | `products-cards` | `content`, страница `product` |
| Баннер | `banner` | `content` |

Это примеры штатных handles, не полный список и не гарантия наличия в конкретном каталоге. Не выводи категорию из единственного числа или места размещения (`header`, `product`, `content`). При доступном каталоге проверь категорию, шаблон блоков и библиотеки; без него используй документированный пример и укажи непроверенные ссылки. Структурный валидатор не проверяет их существование.

После правки запускай валидатор → [info-json-validation.md](info-json-validation.md).

**Типы виджетов:**
- `"SimpleWidgetType"` — без блоков
- `"BlockListWidgetType"` / `"block_list_widget_type"` — с блоками (нужен `block_template_handle`; `setup.json` задаёт блоки по умолчанию)

**`page_kinds`:** `all`, `index`, `collection`, `product`, `cart`, `page`, `search`, `blog`, `article`, `favorite`, `compare`

**`widget_list_kinds`:** `top_panel`, `header`, `before_content`, `content`, `after_content`, `sidebar`, `footer`, `bottom_panel`, `outside`

**`libraries`:** `commonjs_v2`, `jquery`, `my-layout`, `vanilla-lazyload`, `splide`, `splide3`, `fslightbox`, `micromodal`, `body-scroll-lock`, `js-cookie`, `cut-list`, `nouislider`, `microalert`

---

## Блоки: схема шаблона и defaults

`block_template_handle` выбирает существующую схему: одинаковый handle не создаёт произвольные поля из `setup.json`. Сопоставляй каждый `block.<field>` и ключ defaults с реальным полем. У блока есть и базовые свойства (например `block.title`); их не следует путать с полями шаблона, а способ задания defaults зависит от пути создания блоков.

У штатного `system-image-and-content` известны поля `content` (`rich_text`), `image` (`account_file`), `hide_image` (`checkbox`), `vertical_position` и `horizontal_position` (`select`). Отдельного `link` в этой схеме нет. Для текстовой карточки можно хранить заголовок, описание и ссылку в редактируемом rich-text `content`:

```json
{
  "blocks": [
    {"content": {"ru": "<h3>Доставка</h3><p>Отправим заказ завтра.</p><p><a href='/page/delivery'>Подробнее</a></p>"}}
  ]
}
```

```liquid
{% for block in data.blocks %}
  <article class="tvist-v1__slide">
    <div class="card-content">{{ block.content }}</div>
  </article>
{% endfor %}
```

Здесь `content` намеренно выводится как HTML из rich-text. Для независимых полей заголовка/ссылки нужен шаблон с подтверждёнными полями. Не читай `block.link` только потому, что добавил `link` в setup: неизвестное поле может исчезнуть при создании и вернуться пустым. Проверяй поля в каталоге при доступе; офлайн используй документированную схему и обозначь необходимость сверки в целевом магазине.

## settings_form.json

Структура для виджетов поколения 4 строгая: корневой объект содержит ровно две вкладки `content` и `design`, обе обязательны и являются массивами групп. Каждая группа — объект с массивом `items`; поля разрешены только внутри `items`. Пустые вкладки и группы допустимы, название группы необязательно. Пустая форма: `{"content":[],"design":[]}`. Плоский словарь полей и дополнительные корневые ключи недопустимы.

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

Текстовые поля с переводами — объект с кодами используемых языков магазина. `ru`, `ua`, `en`, `es` здесь примеры, а не полный whitelist.

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

`widget:input-setting:insales:system:editor`, `widget:change-setting:insales:system:editor` и события цвета позволяют обновлять свой компонент без полной перерисовки. В проверенном старом редакторе payload содержит `widget_id`, `setting_name`, `value`, `unit`, `type`; `widget_id` сопоставляется с `data-widget-id` ближайшего `.editable-widget`. Не заменяй его автоматически на `data-widget-drop-item-id`: ID виджета и размещения могут отличаться. Сверяй payload с используемым редактором.

Пример реакции — в [справочнике слайдеров](../libraries/sliders.md), общий init/cleanup — в [runtime.md](runtime.md). CSS-настройке или статической секции отдельная подписка нужна не всегда.

---

## Дополнительные справочники (в этой же папке)

- [settings-reference.md](settings-reference.md) — все 15 типов настроек с параметрами и примерами
- [core-css-reference.md](core-css-reference.md) — классы и CSS-переменные библиотеки core.css / my-layout
- [icons-reference.md](icons-reference.md) — 82 иконки шрифта `insales-icons` на витрине
- [icons-editor-reference.md](icons-editor-reference.md) — 240 имён `mdi-*` для поля `icon` в `icon_group`
