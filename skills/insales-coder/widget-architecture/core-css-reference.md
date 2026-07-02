# Core CSS / my-layout — справочник классов и переменных

Библиотека подключена на каждой странице магазина.

---

## Миксин background-color

Первая строка `snippet.scss` в большинстве виджетов. Автоматически адаптирует цвет текста под яркость фона:

```scss
@include background-color(--bg);
// или для кастомного цвета секции:
@include background-color(--section-bg-color);
```

Миксин генерирует селекторы `[style*="--bg-is-dark:true"]` и `[style*="--bg-is-light:true"]`, переключая CSS-переменные текста между светлой и тёмной палитрой.

---

## Обёртка .layout

Родительский класс каждого виджета. Генерируется автоматически.

```html
<div class="layout widget-type_{handle}" style="--bg:#fff; --layout-wide-bg:true; ...">
  <div class="layout__content">
    <!-- контент виджета -->
  </div>
</div>
```

### CSS-переменные layout

| Переменная | Описание | Пример значения |
|---|---|---|
| `--bg` | Цвет фона виджета | `#ffffff` |
| `--layout-wide-bg` | Фон на всю ширину страницы | `true` / `false` |
| `--layout-wide-content` | Контент на всю ширину | `true` / `false` |
| `--layout-edge` | Убрать боковые отступы | `true` / `false` |
| `--layout-pt` | Отступ сверху | `2vw` |
| `--layout-pb` | Отступ снизу | `2vw` |
| `--hide-mobile` | Скрыть на мобильных | `true` / `false` |
| `--hide-desktop` | Скрыть на десктопе | `true` / `false` |
| `--layout-content-max-width` | Максимальная ширина контента | `1200px` |
| `--layout-side-padding` | Боковые отступы | `40px` |

### Стандартные CSS-переменные цветов

```css
--color-text: /* текущий цвет текста (адаптируется под фон) */
--color-text-light: #fff
--color-text-dark: #111
--color-text-light-minor-shade: #f7f7f7
--color-text-light-major-shade: #ededed
--color-text-light-half-shade: #808080
--color-text-dark-minor-shade: #474747
--color-text-dark-major-shade: #5c5c5c
--color-text-dark-half-shade: #999999
--bg: #ffffff
--bg-minor-shade: #f7f7f7
--bg-major-shade: #ededed
--bg-half-shade: #808080
--color-accent-text: /* цвет ссылок */
--color-btn-bg: #6360e0
--color-btn-text: #ffffff
--color-error: /* цвет ошибок */
```

---

## .grid-list — сетка блоков

CSS Grid для списков элементов (баннеры, товары, преимущества и т.д.).

```html
<div class="grid-list">
  <div class="grid-list__item">Блок 1</div>
  <div class="grid-list__item">Блок 2</div>
  <div class="grid-list__item">Блок 3</div>
</div>

<!-- Блоки растянуты на всю строку -->
<div class="grid-list grid-list_wide">
  <div class="grid-list__item">...</div>
</div>
```

### CSS-переменные grid-list

| Переменная | Описание |
|---|---|
| `--grid-list-min-width` | Минимальная ширина блока (px) |
| `--grid-list-row-gap` | Вертикальный отступ между блоками |
| `--grid-list-column-gap` | Горизонтальный отступ между блоками |

Пример настроек в `settings_form.json`:
```json
{ "class": "range", "name": "grid-list-min-width", "type": "number", "min": 100, "max": 400, "unit": "px" },
{ "class": "range", "name": "grid-list-column-gap", "type": "number", "min": 0, "max": 60, "unit": "px" },
{ "class": "range", "name": "grid-list-row-gap", "type": "number", "min": 0, "max": 60, "unit": "px" }
```

---

## .img-ratio — изображение с фиксированным соотношением сторон

```html
<!-- Изображение растягивается на весь блок (cover) -->
<div class="img-ratio img-ratio_cover">
  <div class="img-ratio__inner">
    <picture>
      <source media="(min-width:481px)" data-srcset="{{ img | image_url: 800, format: 'webp' }}" type="image/webp" class="lazyload">
      <source media="(max-width:480px)" data-srcset="{{ img | image_url: 480, format: 'webp' }}" type="image/webp" class="lazyload">
      <img data-src="{{ img | image_url: 800 }}" class="lazyload" alt="">
    </picture>
  </div>
</div>

<!-- Изображение вписывается пропорционально (contain) -->
<div class="img-ratio img-ratio_contain">
  <div class="img-ratio__inner">...</div>
</div>
```

### CSS-переменные img-ratio

| Переменная | Описание |
|---|---|
| `--img-ratio` | Соотношение сторон (ширина/высота). `1` = квадрат, `1.5` = 3:2 |
| `--img-ratio` (mobile) | Можно задать отдельно через `--img-ratio-mobile` |

### .img-fit

Скрывает содержимое, выходящее за пределы контейнера:
```html
<div class="img-fit">...</div>
```

---

## .button — кнопки

```html
<!-- Базовая кнопка -->
<button class="button" type="button">Текст</button>

<!-- Размеры -->
<button class="button button_size-s">Маленькая</button>
<button class="button button_size-l">Средняя</button>
<button class="button button_size-xl">Большая</button>

<!-- Инвертированная (прозрачный фон) -->
<button class="button button_second">Инвертированная</button>

<!-- На всю ширину -->
<button class="button button_wide">Широкая</button>

<!-- Скруглённые углы -->
<button class="button button_border-round">Скруглённая</button>

<!-- Комбинации -->
<button class="button button_size-xl button_second">XL прозрачная</button>
<button class="button button_size-l button_border-round">L скруглённая</button>
```

---

## .form-control — элементы формы

Input, textarea, select.

```html
<!-- Размеры -->
<input type="text" class="form-control form-control_size-s" placeholder="">
<input type="text" class="form-control form-control_size-m" placeholder="">
<input type="text" class="form-control form-control_size-l" placeholder="">
<input type="text" class="form-control form-control_size-xl" placeholder="">

<!-- На всю ширину -->
<input type="text" class="form-control form-control_wide" placeholder="">

<!-- Скруглённые углы -->
<input type="text" class="form-control form-control_size-m form-control_border-round" placeholder="">

<!-- Textarea -->
<textarea class="form-control form-control_wide form-control_size-l" placeholder=""></textarea>
```

### CSS-переменные controls

```css
--controls-height-s: 30px
--controls-height-m: 40px
--controls-height-l: 50px
--controls-height-xl: 60px
--controls-btn-padding-x: 1em
--controls-btn-border-radius: 0
--controls-form-padding-x: 10px
--controls-form-border-radius: var(--controls-btn-border-radius, 0)
--controls-font-size-s: calc(var(--font-size) * 0.75)
--controls-font-size-m: var(--font-size)
--controls-font-size-l: calc(var(--font-size) * 1.25)
--controls-font-size-xl: calc(var(--font-size) * 1.5)
--controls-border-width: 1px
```

---

## Z-index

```css
--zindex-dropdown: 1000
--zindex-sticky: 1010
--zindex-fixed: 1020
--zindex-overlay: 1030
--zindex-modal: 1040
--zindex-tooltip: 1050
```

---

## Скрытие элементов

```html
<input type="hidden" name="_method" value="put">
```

Или через атрибут `hidden`.

---

## Типографика

```css
--font-size: /* базовый размер шрифта темы */
--font-size-factor: /* множитель размера шрифта */
--line-height: /* межстрочный интервал */
```

---

## Страница (page_layout)

CSS Grid разметка страницы с областями: `header`, `sidebar`, `main`, `footer`.

Модификаторы:
- `.page_layout_normal_left` / `.page_layout_normal_right` — сайдбар слева/справа
- `.page_layout_sticky_left` / `.page_layout_sticky_right` — sticky сайдбар

Мобильный breakpoint: `max-width: 767px` — колонки становятся вертикальными.
