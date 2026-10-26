# Справочник типов настроек (settings_form.json)

Для поколения 4 форма должна содержать ровно две вкладки — `content` и `design`. Каждая вкладка — массив объектов групп, у каждой группы обязательный массив `items` с объектами полей. Название группы необязательно; пустые массивы допустимы. Поля в корне или непосредственно во вкладке не работают.

```json
{
  "content": [
    {
      "items": [
        { "name": "title", "type": "text", "label": "Заголовок" }
      ]
    }
  ],
  "design": []
}
```

Поле `name` — идентификатор настройки, `label` — подпись в редакторе. Начальные значения задавай отдельно в `settings_data.json`. Форма без настроек: `{"content":[],"design":[]}`.

Структуру формы и defaults проверяет [валидатор настроек](settings-validation.md). Он не подтверждает действие поля: цвет должен применяться в SCSS, выбранная категория — разрешаться в Liquid, ссылка — вести к нужным данным.

## Связь поля с выводом

В `settings_form.json` подписи используют `messages.key`, в `snippet.liquid` собственные строки виджета — `widget_messages.key`. Для обычного `text` выводи экранированный текст; намеренный HTML хранится в `rich-text` и выводится как разметка.

Динамическое имя вычисляй до обращения к словарю:

```liquid
{% assign point_key = 'point-' | append: slot | append: '-x' %}
{% assign point_x = widget_settings[point_key] %}
```

Это чтение уже объявленного поля, а не создание настройки. Для фиксированных точек объяви, например, `point-1-x`/`point-1-y` с числовыми ограничениями 0–100; для произвольного числа точек выбери шаблон блоков с подтверждёнными полями координат. Не выводи имена несуществующих настроек из handle товара. Фильтр внутри `widget_settings[...]` не заменяет предварительный `assign`.

## Общие параметры для всех типов

| Параметр | Тип | Описание |
|---|---|---|
| `name` | string | Уникальный идентификатор настройки (используется как CSS-переменная) |
| `label` | string | Заголовок в редакторе. Поддерживает `{{ messages.key }}` |
| `type` | string | Тип поля |
| `value` | any | Значение по умолчанию (лучше задавать в settings_data.json) |
| `help` | string | Подсказка под полем |
| `general` | boolean | Показывать в основных настройках редактора |
| `general_position` | number | Порядок в основных настройках |
| `general_label` | string | Заголовок группы в основных настройках |
| `enable_server_reload` | boolean | Перезагружать шаблон при изменении |
| `hide_mobile` | boolean | Скрыть в мобильном редакторе |
| `class` | string | CSS-класс поля (например `"range"` для ползунка) |

Для редактируемых полей указывай читаемый `label`. Сохраняй JSON читаемым в принятом проектом стиле. Для числового ползунка задай `min`, `max`, `step`, `unit`; `with_btns: true` добавляет кнопки изменения значения.

---

## Типы полей

### text

Текстовое поле. Значение доступно в Liquid и становится CSS-переменной.

```json
{
  "name": "heading-text",
  "label": "{{ messages.title }}",
  "type": "text",
  "general": true
}
```

Мультиязычное значение по умолчанию — в `settings_data.json`:
```json
{
  "heading-text": {
    "ru": "Заголовок",
    "ua": "Заголовок",
    "en": "Title",
    "es": "Título"
  }
}
```

---

### rich-text

Форматированный текст (WYSIWYG). Выбирай `rich-text`, если значение содержит HTML-разметку, например `<br>` или `<em>`; `text` подходит для текста без разметки. Это относится и к переводам в `settings_data.json`.

```json
{
  "name": "content",
  "label": "{{ messages.content }}",
  "type": "rich-text"
}
```

---

### number (+ range/slider)

Числовое поле. С `"class": "range"` отображается как ползунок.

```json
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
```

| Параметр | Описание |
|---|---|
| `min` / `max` | Диапазон значений |
| `step` | Шаг изменения |
| `unit` | Единица измерения: `"px"`, `"rem"`, `"vw"`, `"em"`, `"%"` |
| `with_btns` | Кнопки +/- рядом с ползунком |

Значение становится CSS-переменной: `--font-size: 20px` (unit добавляется автоматически).

---

### checkbox

Чекбокс. `value: null` = выключен по умолчанию.

```json
{
  "name": "hide-title",
  "label": "{{ messages.hide_title }}",
  "type": "checkbox",
  "value": null
}
```

В SCSS проверяется через `[style*="--hide-title:true;"]`.

---

### select

Выпадающий список.

```json
{
  "name": "img-fit",
  "label": "{{ messages.img_fit }}",
  "type": "select",
  "options": [
    ["{{ messages.cover }}", "cover"],
    ["{{ messages.contain }}", "contain"]
  ]
}
```

`options` — массив пар `[label, value]`.

---

### button-group (icon_group)

Группа кнопок с иконками (выбор одного варианта).

```json
{
  "name": "align-title",
  "label": "{{ messages.align }}",
  "type": "icon_group",
  "options": [
    { "value": "left", "title": "{{ messages.left }}", "icon": "align-left" },
    { "value": "center", "title": "{{ messages.center }}", "icon": "align-center" },
    { "value": "right", "title": "{{ messages.right }}", "icon": "align-right" }
  ]
}
```

---

### file

Загрузка файла или изображения. Тип всегда `"file"`, не `"image"`.

```json
{
  "name": "banner-img",
  "label": "{{ messages.picture }}",
  "type": "file",
  "only_images": true,
  "general": true,
  "general_position": 1,
  "help": "{{ messages.recommended_size }}: 1200x600 px"
}
```

| Параметр | Описание |
|---|---|
| `only_images` | Только изображения |
| `with-generate-logo` | Кнопка генерации логотипа через AI |
| `branding_field` | Связь с брендингом: `"logo"`, `"account_contact_phone"` и др. |

Использование в Liquid:
```liquid
{% if widget_settings.banner-img %}
  <img data-src="{{ widget_settings.banner-img | image_url: 1200, format: 'webp' }}" class="lazyload">
{% endif %}
```

---

### color

Цветопикер.

```json
{
  "name": "bg",
  "label": "{{ messages.background }}",
  "type": "color",
  "clearable": true
}
```

| Параметр | Описание |
|---|---|
| `clearable` | Можно сбросить цвет (значение станет `null`) |
| `fallback` | Цвет по умолчанию если значение null |

Цветовые настройки с суффиксом `-color` автоматически генерируют CSS-переменные оттенков:
- `--bg-details-color` → `--bg-details-color-is-dark:true/false`, `--bg-details-color-is-light:true/false`

Используй миксин для фона с автоматической адаптацией текста:
```scss
@include background-color(--bg-details-color);
```

---

### navigation

Выбор меню навигации.

```json
{
  "name": "menu-handle",
  "label": "{{ messages.menu }}",
  "type": "navigation",
  "value": "main-menu"
}
```

---

### collection

Выбор категории каталога. Значение handle разрешается через `collections`:

```json
{
  "name": "collection-handle",
  "label": "{{ messages.collection }}",
  "type": "collection"
}
```

```liquid
{% assign selected_collection = collections[widget_settings.collection-handle] %}
{% if selected_collection %}
  <a href="{{ selected_collection.url | escape }}">{{ selected_collection.title | escape }}</a>
{% endif %}
```

Пустой выбор обработай явно: скрытие ссылки, пустое состояние или корневая категория по назначению виджета. Для выбора категории используй selector, а не обязательный ручной ввод handle в текстовое поле. [Полный пример](collection-links.md).

---

### blog

Выбор блога.

```json
{
  "name": "blog-handle",
  "label": "{{ messages.blog }}",
  "type": "blog",
  "edit_admin_link": true
}
```

---

### info

Информационное текстовое поле (только для чтения, без значения).

```json
{
  "name": "info-field",
  "type": "info",
  "text": "{{ messages.info_text }}"
}
```

---

### current-page-description

Автоматическое описание текущей страницы (SEO).

```json
{
  "name": "current-page-description",
  "type": "current-page-description"
}
```

---

### link-to-widget

Ссылка на другой виджет (кнопка перехода в редакторе).

```json
{
  "name": "go-to-header",
  "type": "link-to-widget",
  "category_handle": "headers",
  "icon": "link"
}
```

---

### button_switch

Переключатель в виде кнопки (альтернатива checkbox).

```json
{
  "name": "show-price",
  "label": "{{ messages.show_price }}",
  "type": "button_switch"
}
```

---

## Стандартные настройки layout (добавлять в design секцию)

Большинство виджетов включают стандартный набор настроек дизайна:

```json
{
  "design": [
    {
      "items": [
        { "name": "bg", "label": "Фон", "type": "color", "clearable": true },
        { "name": "layout-wide-bg", "label": "Фон на всю ширину", "type": "checkbox" },
        { "class": "range", "name": "layout-pt", "label": "Отступ сверху", "type": "number", "min": 0, "max": 10, "step": 0.5, "unit": "vw", "with_btns": true },
        { "class": "range", "name": "layout-pb", "label": "Отступ снизу", "type": "number", "min": 0, "max": 10, "step": 0.5, "unit": "vw", "with_btns": true },
        { "name": "layout-wide-content", "label": "Контент на всю ширину", "type": "checkbox" },
        { "name": "layout-edge", "label": "Убрать боковые отступы", "type": "checkbox" },
        { "name": "hide-desktop", "label": "Скрыть на десктопе", "type": "checkbox" },
        { "name": "hide-mobile", "label": "Скрыть на мобильном", "type": "checkbox" }
      ]
    }
  ]
}
```

И соответствующие defaults в `settings_data.json`:

```json
{
  "bg": null,
  "layout-wide-bg": true,
  "layout-pt": 2,
  "layout-pb": 2,
  "layout-wide-content": false,
  "layout-edge": false,
  "hide-desktop": false,
  "hide-mobile": false
}
```

## Переводимые defaults

Если виджет нужен на нескольких языках, переводи не только `messages.json`, но и текстовые значения `settings_data.json`: например, `"buy-label": {"ru":"Купить","en":"Buy"}`. Liquid читает локализованное значение через `widget_settings.buy-label`. Подпись поля `{{ messages.buy }}` переводит интерфейс редактора и не меняет текст, сохранённый в самом поле. Цвета, числа и специальные значения с `_type` не превращай в словарь переводов.
