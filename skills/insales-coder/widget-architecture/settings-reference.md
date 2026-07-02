# Справочник типов настроек (settings_form.json)

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

Форматированный текст (WYSIWYG).

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
        { "name": "bg", "type": "color", "clearable": true },
        { "name": "layout-wide-bg", "type": "checkbox" },
        { "class": "range", "name": "layout-pt", "type": "number", "min": 0, "max": 10, "step": 0.5, "unit": "vw" },
        { "class": "range", "name": "layout-pb", "type": "number", "min": 0, "max": 10, "step": 0.5, "unit": "vw" },
        { "name": "layout-wide-content", "type": "checkbox" },
        { "name": "layout-edge", "type": "checkbox" },
        { "name": "hide-desktop", "type": "checkbox" },
        { "name": "hide-mobile", "type": "checkbox" }
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
