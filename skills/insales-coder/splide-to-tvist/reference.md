
# Миграция Splide → TvistV1

## Алгоритм: выполняй шаги по порядку

### Шаг 1 — Определить версию Splide и тип виджета

Смотри в `snippet.js`:

| Признак в коде | Тип |
|---|---|
| `.sync(other).mount()` | Splide v3 sync-пара (или v2 с sync) |
| `mount({ Grid: window.splide.Extensions.Grid })` | Splide v2 + Grid extension |
| `mount(window.splide.Extensions)` | Splide v2 + все extensions |
| Только `.mount()` | Splide v2 базовый |

Смотри в `info.json` → поле `"libraries"`:
- `"splide3"` присутствует → v3 API
- только `"splide"` → v2 API
- `"splide-grid"` → Grid extension
- `"splide-video"` → Video extension

> Если в `info.json` есть и `"splide"`, и `"splide3"` — ориентируйся на фактические вызовы в JS.

---

### Шаг 2 — Обновить info.json

Убрать все Splide-зависимости, добавить `"tvist-v1"`:

```json
// До
"libraries": ["commonjs_v2", "jquery", "my-layout", "splide3", "splide"]

// После
"libraries": ["commonjs_v2", "jquery", "my-layout", "tvist-v1"]
```

Правило замены:
- `"splide"` + `"splide3"` → `"tvist-v1"`
- `"splide-grid"` → убрать (grid встроен в Tvist через опцию `grid: {}`)
- `"splide-video"` → убрать (video встроен через опцию `video: {}`)

---

### Шаг 3 — Обновить snippet.liquid

**Замена классов контейнера:**

| Splide | TvistV1 |
|---|---|
| `class="splide ..."` | `class="tvist-v1 ..."` |
| `class="splide__track"` | `class="tvist-v1__track"` |
| `class="splide__list"` | `class="tvist-v1__container"` |
| `class="splide__slide"` | `class="tvist-v1__slide"` |
| `class="splide__slider"` | **Убрать** из цепочки track → container или вынести кастомный класс на оболочку **вне** `.tvist-v1`; **не** создавать `tvist-v1__slider` |

**КРИТИЧНО — иерархия DOM (корень → track → container):**

Tvist ожидает **строгую** вложенность: **прямой** потомок `.tvist-v1` — только `.tvist-v1__track`, **прямой** потомок track — только `.tvist-v1__container`, слайды — внутри container. Базовые стили drag, `touch-action`, вертикальной ориентации и состояния `--dragging` используют селекторы с **`>`** (прямой потомок). Лишняя обёртка между корнем и track **ломает** эти правила.

```html
<!-- ПРАВИЛЬНО -->
<div class="tvist-v1">
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      <div class="tvist-v1__slide">…</div>
    </div>
  </div>
  <div class="tvist-v1__pagination"></div><!-- опционально, внутри корня -->
</div>

<!-- НЕПРАВИЛЬНО — лишняя обёртка между корнем и track -->
<div class="tvist-v1">
  <div class="tvist-v1__slider"><!-- или widget-*__slider -->
    <div class="tvist-v1__track">
      <div class="tvist-v1__container">…</div>
    </div>
  </div>
</div>
```

**Частая ошибка миграции:** во Splide между корнем и track часто есть `.splide__slider`. При замене классов её **нельзя** превращать в `.tvist-v1__slider` — такого BEM-элемента в Tvist нет. Либо **убери обёртку** (перенеси семантический класс виджета на родителя `.tvist-v1` или на внешнюю оболочку), либо оставь кастомный класс **вне** цепочки track → container.

**Симптомы нарушенной иерархии:**
- не работает вертикальный скролл страницы при горизонтальном свайпе (`touch-action: pan-y` не доходит до container);
- нет `cursor: grab` / `grabbing` на ленте;
- `direction: 'vertical'` не включает `flex-direction: column`;
- при drag не отключаются `pointer-events` на слайдах.

**Рекомендация:** всегда исправляй разметку (убери лишнюю обёртку). Строгая вложенность в библиотеке нужна для изоляции вложенных слайдеров и производительности. Локальный CSS-костыль — только если обёртку убрать невозможно:

```scss
.tvist-v1--draggable .tvist-v1__container {
  touch-action: pan-y !important; /* horizontal; для vertical — pan-x */
}
```

**Пагинация — ВАЖНО:**

**Splide: что было по умолчанию**

В Splide 3 в стандартных опциях пагинация **включена** (`pagination: true`). Если при `new Splide(...)` опцию `pagination` **не передавали**, действует именно это значение: модуль пагинации активен. Если в Liquid не было своего контейнера (плейсхолдера), движок **сам создаёт** разметку пагинации (список буллетов) и вставляет её в DOM рядом с дорожкой. Поэтому при разборе старого виджета нельзя судить только по шаблону: отсутствие блока пагинации в разметке **не значит**, что пагинации не было — Splide мог добавить её из JS.

Имеет смысл явно посмотреть `snippet.js`: есть ли `pagination: false` (в корне опций или внутри `breakpoints`). Если нигде не отключали — в Splide пагинация считалась включённой.

Отдельно проверь `snippet.scss` и стили темы: нередко `.splide__pagination` **скрыта** на десктопе и показывается только на узкой ширине (`display: none` / `visibility` и т.д.). Тогда на большом экране точек не видно, но в Splide они были, узел в DOM мог существовать. При переносе на Tvist нужно не только добавить контейнер и включить `pagination` в опциях, но и **повторить ту же логику видимости** для `.tvist-v1__pagination` и буллетов в медиазапросах.

**Tvist**

Tvist **не** подставляет разметку пагинации сам и по умолчанию модуль пагинации выключен. Нужно добавить контейнер в разметку и включить пагинацию опцией в `snippet.js`:

```html
<!-- Нужно, если пагинация должна быть: в Splide 3 она могла быть включена по умолчанию без блока в Liquid — см. блок выше -->
<div class="tvist-v1__pagination"></div>
```

```js
// Пример включения пагинации в Tvist
new TvistV1(root, {
  pagination: {
    type: 'bullets',
    clickable: true
  }
})
```

Если в Splide пагинацию явно отключали (`pagination: false`) и не было кастомных индикаторов — в Tvist контейнер и опцию не добавлять. Если опцию `pagination` в Splide не трогали — по умолчанию она была включена; для того же поведения в Tvist контейнер и опции обязательны.

**Пагинация буллетов: фактическая разметка Tvist (критично для CSS):**

Tvist рендерит буллеты как `span` внутри `.tvist-v1__pagination`:

```html
<div class="tvist-v1__pagination" aria-hidden="false">
  <span class="tvist-v1__bullet tvist-v1__bullet--active" data-index="0" aria-current="true"></span>
  <span class="tvist-v1__bullet" data-index="1"></span>
  <span class="tvist-v1__bullet" data-index="2"></span>
</div>
```

Правила миграции стилей пагинации:
- Не писать селекторы вида `.tvist-v1__pagination li ...` — элемента `li` нет.
- Активное состояние — `.tvist-v1__bullet--active`, а не `.is-active`.
- Не завязываться на inline-стиль `style="cursor: pointer;"` — это внутренняя реализация, стилизовать через классы.
- Если нужна сетка/полоски как в stories, использовать `display: grid` прямо на `.tvist-v1__pagination` и стилизовать `.tvist-v1__bullet`.

**Кейс: margin у точек Splide и `gap` у Tvist**

У Splide расстояние между точками часто задают через `margin` на `.splide__pagination__page` (типичный фрагмент из темы/виджета):

```scss
.widget-type_system_widget_v4_promo_slider_14 .promo-slider .splide__pagination__page {
  margin: 0 4px;
  width: 12px;
  height: 12px;
  opacity: 1;
  outline: none;
}
```

У Tvist пагинация — **flex**-контейнер, центрированный по горизонтали (`width: 95%`, `left: 50%`, `transform: translateX(-50%)`). Расстояние между буллетами задаёт **`gap`** на `.tvist-v1__pagination` через **`--tvist-v1-pagination-gap`** (fallback `8px`). У самих `.tvist-v1__bullet` в дефолте **`margin: 0`** (margin задаётся только через `gap` контейнера). Активная точка — **`transform: scale(--tvist-v1-bullet-active-scale)`** (fallback `1.4`), не через width/height.

Дефолтные CSS-переменные пагинации:

| Переменная | Fallback | Назначение |
|---|---|---|
| `--tvist-v1-pagination-bottom` | `10px` | отступ блока пагинации от низа |
| `--tvist-v1-pagination-gap` | `8px` | расстояние между буллетами (flex `gap`) |
| `--tvist-v1-bullet-size` | `8px` | диаметр буллета |
| `--tvist-v1-bullet-color` | `#ccc` | фон неактивной точки |
| `--tvist-v1-bullet-opacity` | `0.7` | прозрачность неактивной |
| `--tvist-v1-bullet-opacity-hover` | `0.9` | прозрачность при hover |
| `--tvist-v1-bullet-active-color` | `#fff` | фон активной точки |
| `--tvist-v1-bullet-active-scale` | `1.4` | масштаб активной точки |
| `--tvist-v1-z-pagination` | `10` | z-index контейнера (в SCSS контейнера также `z-index: 10`) |

Базовая геометрия контейнера: `position: absolute; width: 95%; bottom: …; left: 50%; transform: translateX(-50%); display: flex; gap: …; margin: 0; padding: 0`.

**Правило миграции:** при переносе селекторов на `.tvist-v1__bullet` **обнуляй `margin`** (`margin: 0` в области виджета), иначе визуально сложатся **`gap` + старые боковые margin** Splide — точки разъедутся. Нужный шаг между точками — **`--tvist-v1-pagination-gap`** (или `gap` на `.tvist-v1__pagination`), размер точки — **`--tvist-v1-bullet-size`**, цвета — **`--tvist-v1-bullet-*`**. Переменной `--tvist-v1-bullet-spacing` в актуальной версии **нет**.

**Кейс: в опциях Splide `pagination: false`, но индикаторы на экране есть**

Так бывает, когда встроенные точки Splide отключены, а навигацию рисуют вручную в JS: контейнер в разметке, цикл по числу слайдов, у каждого элемента индекс (`data-index` и т.п.), по событию смены слайда обновляют класс «активного» элемента, по клику вызывают переход (`go` и аналог). Таблица опций внизу скилла мапит `pagination: false` → `pagination: false`, но **это не значит «пагинацию выкидываем»**: если в старом коде был описанный паттерн, после миграции пагинацию нужно восстановить через API Tvist, а не оставлять пустой блок.

На стороне Tvist обычно достаточно включить пагинацию объектом, а не писать всё с нуля:

- **Свои точки с той же идеей, что у старых «плашек»** — `pagination: { type: 'bullets', clickable: true }`, плюс при необходимости `renderBullet`, `bulletClass`, `bulletActiveClass`, чтобы HTML/CSS совпали с дизайном виджета (классы из темы, не обязательно дефолтные BEM-имена буллетов).
- **Один фрагмент разметки от «текущий / всего» или произвольной строки** — `type: 'custom'` и `renderCustom(current, total)`.
- **Контейнер не внутри корня слайдера** — опция `container` (строка-селектор или `HTMLElement`), как у стрелок вынесенных наружу.

Подписка на смену слайда: событие **`slideChangeStart`** (аналог Splide `move`), переход по индексу — **`scrollTo(index)`** (вместо `go`). Ручной цикл по `length` и ручная синхронизация классов после миграции чаще всего не нужны — модуль пагинации Tvist сам обновляет DOM при смене слайда и при кликах, если включён `clickable`.

**Стрелки — обновлённые дефолтные стили:**

Tvist рендерит или находит кнопки `.tvist-v1__arrow--prev` / `--next` как **круглые** кнопки с фоном, позиционированные по центру поперечной оси (`top: 50%; transform: translateY(-50%)`). Ключевые CSS-переменные:

| Переменная | Fallback | Назначение |
|---|---|---|
| `--tvist-v1-arrow-size` | `2em` (`32px` ≤768px) | размер кнопки |
| `--tvist-v1-arrow-offset` | `1em` (`5px` ≤768px) | отступ от края |
| `--tvist-v1-arrow-bg` | `#ccc` | фон кнопки |
| `--tvist-v1-arrow-color` | `#000` | цвет иконки (currentColor) |
| `--tvist-v1-arrow-opacity` | `0.7` | прозрачность |
| `--tvist-v1-arrow-disabled-opacity` | `0.3` | disabled / `--disabled` |
| `--tvist-v1-z-arrows` | `1` | z-index |

Disabled-состояние: атрибут `:disabled` или класс `.tvist-v1__arrow--disabled` (`pointer-events: none`). Скрытие: `.tvist-v1__arrow--hidden`. Кастомный disabled-класс темы — через `arrows: { disabledClass: 'is-disabled' }`.

```html
<!-- До: Splide-стрелки со своими обработчиками -->
<button class="js-move-slide" data-dir="prev">...</button>
<button class="js-move-slide" data-dir="next">...</button>

<!-- После: стрелки внутри .tvist-v1, Tvist найдёт их по классам или data-атрибутам -->
<button class="js-arrow-prev">...</button>
<button class="js-arrow-next">...</button>
```

По умолчанию модуль стрелок в Tvist выключен. Чтобы стрелки начали работать, их нужно **явно включить** в опциях:

```js
new TvistV1(root, {
  arrows: true
})
```

Убрать атрибуты `data-dir` и класс `js-move-slide` — они больше не нужны.

**Стрелки вне root-элемента слайдера:**

Tvist по умолчанию ищет стрелки **внутри корня** `.tvist-v1`. Если стрелки находятся снаружи корневого элемента слайдера (например, в шапке блока), их нужно явно передать через опцию `arrows` как DOM-элементы. Ручные click-обработчики не нужны — Tvist сам вешает их.

```js
// Стрелки вынесены за пределы .js-slider
new TvistV1(sliderRoot, {
  arrows: {
    prev: block.find(".custom-arrow-prev").get(0),
    next: block.find(".custom-arrow-next").get(0)
  }
})
```

**Изображения коллекций — замена `products | first` на `menu_image`:**

При миграции виджетов слайдеров категорий часто встречается паттерн фолбека через первый товар. Его нужно заменить на `menu_image`.

```liquid
<!-- До: загружает до 100 товаров ради одного изображения -->
{% assign collection_img = block.collection.image %}
{% if block.collection.image.original_url contains 'no_image' %}
  {% assign collection_first_product = block.collection.products | first %}
  {% if collection_first_product.images.size > 0 %}
    {% assign collection_img = collection_first_product.first_image %}
  {% endif %}
{% endif %}

<!-- После: один вызов, без загрузки товаров -->
{% assign collection_img = block.collection.menu_image %}
```

`menu_image` возвращает: изображение категории → первый товар с картинкой → заглушка `no_image`. Объект изображения тот же тип, поэтому `image_url` и другие фильтры работают без изменений.

Если в виджете есть возможность задать кастомное изображение через `block.image`, сохранить приоритет:

```liquid
{% if block.image %}
  {% assign collection_img = block.image %}
{% else %}
  {% assign collection_img = block.collection.menu_image %}
{% endif %}
```

> **Важно:** атрибут `loading="lazy"` валиден только для `<img>` и `<iframe>`. На теге `<source>` внутри `<picture>` его ставить нельзя — браузер игнорирует такой `<source>` и выдаёт предупреждение о preload с неизвестным `as`. Lazy loading для всего `<picture>` управляется через `<img loading="lazy">`.

```html
<!-- Неправильно -->
<source ... loading="lazy">
<img ... loading="lazy">

<!-- Правильно -->
<source ...>
<img ... loading="lazy">
```

---

### Шаг 4 — Обновить snippet.js

**Инициализация:**

```js
// До
const splide = new Splide(root, options)
splide.mount()

// После
const tvist = new TvistV1(root, options)
// Доступ к инстансу: root.tvistInstance
```

**ВАЖНО: `tvist-v1` по умолчанию скрыт до `--created`:**

У корневого класса `tvist-v1` базовый стиль использует `visibility: hidden`, и элемент становится видимым только после добавления класса `tvist-v1--created` (он появляется при `new TvistV1(...)`).

Из этого следует правило миграции:

- Не делать ранний выход только из-за количества слайдов, если корень уже имеет класс `tvist-v1`.
- Антипаттерн:

```js
if (!root || slides.length <= 1) return
new TvistV1(root, opts)
```

При `slides.length === 1` такой код оставляет блок невидимым, потому что `tvist-v1--created` не проставляется.

- Безопасный вариант:

```js
if (!root) return
const tvist = new TvistV1(root, opts) // даже для 1 слайда
```

Tvist сам поставит lock/single-page состояния и отключит лишнюю навигацию.  
Если по архитектуре инит действительно нельзя делать, нужно явно снять скрытие в CSS/классах, но это fallback, а не предпочтительный путь.

**Методы:**

| Splide | TvistV1 |
|---|---|
| `splide.mount()` | `new TvistV1(root, opts)` — mount в конструкторе |
| `splide.destroy()` | `tvist.destroy()` |
| `splide.refresh()` | `tvist.update()` |
| `splide.options = {...}` | `tvist.updateOptions({...})` |
| `splide.go('+')` | `tvist.next()` |
| `splide.go('-')` | `tvist.prev()` |
| `splide.go(n)` | `tvist.scrollTo(n)` |
| `splide.go(n, false)` | `tvist.scrollTo(n, true)` — мгновенно |
| `splide.go('>')` | `tvist.next()` |
| `splide.go('<')` | `tvist.prev()` |
| `splide.sync(other)` | `tvist.sync(other)` — прямой аналог |
| `splide.index` | `tvist.activeIndex` |
| `splide.length` | `tvist.slides.length` |

**Убрать лишнее:**
- Ручные клик-обработчики на `.js-move-slide` — Tvist сам управляет стрелками
- `updateArrowsState()` — Tvist сам управляет disabled-состоянием стрелок
- Ручной расчёт `perPage` через `getSlidesPerView()` — заменить на **`slideMinSize`** (минимальный размер слайда) или на **`fixedWidth` / `fixedHeight`**, если по макету у слайда фиксированная ширина/высота и «сколько влезет» считает движок
- `configureDragOption()` — Tvist сам управляет drag при lock

**Доступ к DOM:**

| Splide | TvistV1 |
|---|---|
| `splide.Components.Elements.list` | `tvist.container` |
| `splide.Components.Elements.slides` | `tvist.slides` |
| `splide.Components.Elements.track` | `tvist.root` |
| `splide.Components.Elements.length` | `tvist.slides.length` |

**Активный слайд в DOM-запросах:**

В Splide активный слайд имел класс `is-active`. В TvistV1 это `tvist-v1__slide--active`. При миграции JS-кода с DOM-запросами нужно обновить селектор:

```js
// До
root.find('.splide__slide.is-active img').attr('src')

// После
root.find('.tvist-v1__slide--active img').attr('src')
```

---

### Шаг 4.1 — Адаптив и события: отличия от Splide

**Направление breakpoints:** оба плагина — **desktop-first (max-width)**. `breakpoints: { 768: {...} }` означает "при ширине ≤768px" и в Splide, и в TvistV1. Переносить числа без изменений.

**Реинит модулей:** при смене брейкпоинта TvistV1 реинициализирует модули — неактивные уничтожаются, новые запускаются.

---

### Сценарий «Истории» (вложенные слайдеры, сегменты прогресса)

Паттерн из актуальной документации **Tvist** (публичный API пакета / бандла на платформе — без привязки к путям репозитория):

**Разметка**

- Внешний слайдер — «группы» (`perPage: 1`, у внешнего уровня обычно **`autoplay: false`**).
- Внутри каждого слайда группы — второй корень `.tvist-v1` с медиа-историями (**`autoplay` + при необходимости `waitForVideo`**).
- Сегменты прогресса (полоски сверху) верстайте **сами**; ширину активного сегмента задавайте из события **`autoplayProgress`**, сброс прошлых/будущих сегментов — из **`slideChangeStart`** или **`slideChangeEnd`**.
- Области «назад / вперёд» можно держать **вне** root внутреннего слайдера и вызывать `prev()` / `next()` или `scrollTo()` на нужном инстансе.
- Чтобы удержание не срабатывало на оверлеях (прогресс, кнопки), помечайте узлы атрибутом **`data-tvist-no-hold`** и передавайте в **`holdToPause.exclude`** селектор вроде `'[data-tvist-no-hold]'`.

**Опции внутреннего слайдера (типовой набор)**

- `holdToPause: true` или объект: `threshold`, `exclude`, `cancelOnDrag`, `root`.
- `autoplay: { delay, pauseOnHover, waitForVideo }` — для картинок используется `delay`, для слайдов с HTML-видео при `waitForVideo: true` ожидается конец ролика (подробности в документации к версии Tvist).
- `video: { autoplay, muted, pauseOnHold, … }` — согласовать с политикой автовоспроизведения в браузере; звук пользователя при необходимости переопределять после инициализации.
- Внутреннему слайдеру часто задают **`speed: 0`**, чтобы перелистывание карточки не спорило с таймингом автопрокрутки.

**Адаптив внешнего уровня**

- Если на мобиле нужен эффект куба относительно **окна**, а не контейнера, используйте **`breakpointsBase: 'window'`** и в `breakpoints` переопределяйте `effect`, `speed`, при необходимости `cubeEffect` — как в официальных примерах документации Tvist.

**События (дополнительно к таблице ниже)**

| Событие | Зачем в stories |
|---|---|
| `autoplayProgress` | Заполнение текущей полоски: `{ progress, index }`. |
| `longPressStart` / `longPressEnd` | Индикация «на паузе по удержанию»; сама пауза автопрокрутки делается движком при `holdToPause`. |
| `reachEnd` | Дошли до конца ленты без `loop` — закрыть модалку или дернуть внешний `next()` / свою навигацию. |

**DOM-события на слайде (опционально)**

- В документации к пакету описаны `CustomEvent` с именами из константы **`TVIST_DOM_EVENTS`** (long press **без всплытия** к родителю) — удобно в шаблонизаторах, когда обработчик вешают на элемент слайда.

**Видимость корня до инициализации**

- Корень `.tvist-v1` до класса **`tvist-v1--created`** может быть скрыт (`visibility: hidden` в стилях слайдера). Ранний выход из кода вида `if (slides.length <= 1) return` **без** `new TvistV1(...)` оставляет блок невидимым — см. блок выше в шаге 4.

**Анимация кроссфейда и видимость медиа (`effect: 'fade'`)**

Если виджет использует эффект затухания (`effect: 'fade'`), то во время свайпа Tvist анимирует `opacity` у текущего и следующего слайдов одновременно. Чтобы следующий слайд не оказался пустым (с «дыркой» вместо картинки) на время анимации:
1. **CSS-заглушки для неактивных слайдов:** Убедитесь, что внутри неактивного слайда обёртка и сама картинка не скрыты намертво через `display: none`. Если вы переключаете несколько медиа в одном слайде (как в сторис), хотя бы **первое** медиа должно быть всегда видимо для движка. 
   Например, для структуры `<div class="modal__media"><img class="media"></div>`:
   ```scss
   .group:not(.is-active) .modal__media:first-of-type { display: block; }
   .group:not(.is-active) .modal__media:first-of-type .media { display: block; }
   ```
2. **Никаких `setTimeout` в обработчиках смены:** При смене слайда (событие `slideChangeEnd`) обновлять классы активности (`is-active`, `.media.active` и т.д.) нужно строго **синхронно**. Использование `setTimeout` даже на 10-50мс приведет к тому, что старые CSS-заглушки для неактивных слайдов уже отключатся, а новые активные классы ещё не повесятся — слайдер на мгновение «моргнёт» пустым фоном.

**Inline `opacity` / `transform` на `.tvist-v1__slide`**

- При эффектах вроде **`fade`** или **`cube`** движок выставляет инлайн-стили на слайдах — это не баг верстки виджета. Для «чистой» геометрии карточки без полупрозрачных соседей на внешнем уровне иногда используют `effect: 'slide'` и `speed: 0` на десктопе, а «куб» включают только в `breakpoints`.

---

### Шаг 5 — Опции

> Если поведение опции неочевидно или версия бандла на платформе отличается от ожидаемой — сверься с [репозиторием Tvist](https://github.com/VladimirIvanin/tvist) (исходники, `docs/api/options.md`, `browser-build/tvist.css`). Локальная копия в workspace: `.cursor/tvist-main`.

| Splide | TvistV1 | Статус |
|---|---|---|
| `type: 'loop'` | `loop: true` или `loop: { enabled: true, withClones?: boolean }` | замена |
| `type: 'slide'` | (по умолчанию) | убрать |
| `type: 'fade'` | `effect: 'fade'` | замена |
| `type: 'slide'` + «карточный» стек (ручная реализация) | `effect: 'stack'` + `stackEffect` | подход Tvist, не прямой аналог Splide |
| `perPage` | `perPage` | совпадает |
| `perMove` | `slidesPerGroup` | переименовать |
| `direction: 'ttb'` | `direction: 'vertical'` | замена (вертикальная лента) |
| `direction: 'ltr'` | (по умолчанию горизонтально) | убрать, если не нужна явная `horizontal` |
| `gap` | `gap` | совпадает |
| `padding` | `peek` | переименовать |
| `focus: 'center'` | **`center: { focus: true }`** (типичный Splide + `trimSpace`); без trim — `center: true` / `{ active: true }`; см. «Центрирование» | замена |
| `trimSpace: true` (с `focus: 'center'`) | встроено в **`center: { focus: true }`** (clamp у краёв) | замена |
| `trimSpace: false` (с `focus: 'center'`) | `center: true` или `center: { active: true }` | замена |
| `start` | `start` | совпадает |
| `speed` | `speed` | совпадает |
| `drag` | `drag` | совпадает |
| `rewind` | `rewind` | совпадает |
| — | `rewindByDrag` | дополнение к `rewind`; см. блок ниже |
| — | `syncOnDrag` | опция Tvist для `sync()` и ленты миниатюр; см. блок ниже |
| `autoplay: true` | `autoplay: true` | совпадает |
| `interval: N` | `autoplay: { delay: N }` | замена |
| `pauseOnHover: true` | `autoplay: { pauseOnHover: true }` | вложить в autoplay |
| `isNavigation: true` | `isNavigation: true` | совпадает |
| `breakpoints` | `breakpoints` | совпадает |
| `destroy: true` в breakpoints | `enabled: false` в breakpoints | замена |
| `arrows: false` | `arrows: false` | совпадает |
| `pagination: false` | `pagination: false` | совпадает **только если** индикаторов в UI нет; если точки/полоски собирались вручную в JS при `pagination: false` во Splide — см. кейс выше (объект `pagination` в Tvist) |
| `fixedWidth` | `fixedWidth` | см. блок ниже; не путать с `slideMinSize` |
| `fixedHeight` | `fixedHeight` | см. блок ниже |
| `grid` (extension) | `grid` | встроено в Tvist, см. блок ниже |

**Справочник ключевых опций Tvist (описания для миграции):**

*Базовые:*
- **`perPage`** — число видимых слайдов одновременно (дефолт `1`).
- **`slidesPerGroup`** — сколько слайдов пролистывается за один `next()` / `prev()` (дефолт `1`).
- **`slideMinSize`** — минимальная ширина/высота слайда; движок сам считает `perPage`.
- **`gap`** — расстояние между слайдами: число (px) или CSS-строка (`'1rem'`).
- **`peek`** — показ части соседних слайдов: число, строка или `{ left, right }` / `{ top, bottom }`.
- **`peekTrim`** — прижатие конца ленты к краю при peek (дефолт `true`; при `loop` не работает).
- **`speed`** — длительность анимации перехода, мс (дефолт `300`).
- **`direction`** — `'horizontal'` | `'vertical'`.
- **`center`** — `true` | `{ active?, focus?, justify? }`; три режима центрирования + justify в lock, см. блок «Центрирование» ниже.
- **`start`** — индекс начального слайда (дефолт `0`).
- **`roundLengths`** — округление translate/размеров до целых px (дефолт `true`).
- **`enabled`** — `false` отключает слайдер, оставляя статичный контент (удобно для grid→slider по breakpoints).

*Drag:*
- **`drag`** — `true` | `false` | `'free'` (свободная прокрутка без snap).
- **`dragSpeed`** — множитель скорости перетаскивания (дефолт `1`).
- **`rubberband`** — «резинка» на краях (дефолт `true`).
- **`freeSnap`** — snap к ближайшему слайду после momentum в режиме `'free'`.
- **`flickPower`** — сила инерции (дефолт `600`).
- **`flickMaxPages`** — макс. страниц за один flick (дефолт `1`).

*Навигация:*
- **`arrows`** — `false` (дефолт) | `true` | `{ prev, next, disabledClass, hiddenClass, addIcons, hideWhenSinglePage }`; селекторы/элементы могут быть **вне root**.
- **`pagination`** — `false` (дефолт) | `true` | `{ container, type, clickable, bulletClass, bulletActiveClass, renderBullet, renderFraction, renderCustom, hideWhenSinglePage, limit, strategy, remainderStrategy }`; `type`: `'bullets'` | `'fraction'` | `'progress'` | `'custom'`.
- **`keyboard`** — `true` | `{ enabled, onlyInViewport }`.
- **`wheel`** — `true` | `{ sensitivity, releaseOnEdges }`.
- **`scrollbar`** — кастомный скроллбар: `true` | `{ container, hide, hideDelay, … }`.

*Автоматизация и медиа:*
- **`autoplay`** — `false` | `true` (3000 мс) | число | `{ delay, pauseOnHover, pauseOnInteraction, disableOnInteraction, waitForVideo }`.
- **`video`** — управление `<video>` и iframe YouTube/Vimeo.
- **`holdToPause`** — пауза autoplay/видео по удержанию: `true` | `{ threshold, root, exclude, cancelOnDrag }`.
- **`visibility`** — пауза autoplay/marquee вне viewport (дефолт `true`).

*Режимы:*
- **`loop`** — `false` | `true` | `'auto'` | `{ enabled, withClones }`.
- **`rewind`** — перемотка с последнего на первый без loop.
- **`effect`** — `'slide'` | `'fade'` | `'cube'` | `'stack'`.
- **`lazy`** — ленивая загрузка через `data-src` / `data-srcset`.
- **`nativeLazyAdjacent`** — принудительный `loading="eager"` для `<img loading="lazy">` при переходе (важно для `cube`).
- **`grid`** — `{ rows, cols, gap, dimensions }`.
- **`marquee`** — бегущая строка: `true` | `{ speed, direction, pauseOnHover }`.
- **`breakpoints`** — desktop-first (`max-width`): ключ — ширина в px, значение — частичные опции (+ `enabled: false`).
- **`breakpointsBase`** — `'window'` | `'container'`.
- **`isNavigation`** — клики по слайдам переключают активный.
- **`syncOnDrag`** — синхронизация при drag (дефолт `true`).
- **`debug`** — предупреждения в консоль (стрелки/контейнер не найдены и т.д.).

**Центрирование (`center`) — три режима + justify**

Не путай **`focus`**, **`active`** и **`justify`** — это разная логика движка.

| Режим Tvist | Аналог Splide | Первый / последний слайд | Середина ленты |
|---|---|---|---|
| `{ focus: true }` | `focus: 'center'` + **`trimSpace: true`** | прижат к краю, **без пустот** | активный по центру, если хватает места |
| `true` / `{ active: true }` | `focus: 'center'` + **`trimSpace: false`** | **всегда** по центру viewport | по центру |
| `{ justify: true }` | — (не Splide focus) | только в **lock** | вся группа по центру в lock |

### `center: { focus: true }` — **рекомендуемая** миграция Splide `focus: 'center'`

Ближайший аналог Splide **`focus: 'center'`** вместе с **`trimSpace: true`** (у Splide trim по умолчанию часто включён).

- Движок считает позицию как `basePosition + centerOffset`, затем **обрезает (clamp)** в диапазон `[maxScroll, minScroll]` — на первом и последнем слайдах **нет пустых полей** по краям viewport.
- В **середине** ленты активный слайд по центру (как focus center).
- В **loop**: center offset без clamp (как у `active` в loop).
- Drag и границы ленты используют тот же режим (`isCenterMode()`); при drag позиция тоже clamp'ится.
- Если заданы **`active: true` и `focus: true` одновременно** — для расчёта позиции **приоритет у `focus`** (trim у краёв).

```js
// Типичная миграция Splide focus: 'center' + trimSpace
new TvistV1(root, {
  perPage: 3,
  gap: 16,
  center: { focus: true },
  loop: false,
  speed: 400
})
```

```js
// Явно оба флага — поведение позиции как у focus
center: { active: true, focus: true }
```

### `center: true` / `center: { active: true }` — жёсткое центрирование (без trim у краёв)

**Не** то же самое, что Splide `focus: 'center'` + `trimSpace: true`.

- Активный слайд **всегда** по центру viewport — **включая первый и последний** (могут появляться «пустоты» у краёв, если слайдов мало).
- Аналог Splide: `focus: 'center'` при **`trimSpace: false`**.
- Включает классы состояний: `.tvist-v1__slide--active`, `--prev`, `--next`, `--visible`.
- При `center: true` trim peek по краям для выравнивания **не** применяется; `peek` всё же уменьшает эффективную ширину viewport.

```js
new TvistV1(root, {
  perPage: 3,
  gap: 20,
  center: true // = { active: true }, без trim у краёв
})
```

Типичные комбинации: `center + loop`, `center + drag`, отключение `center` в `breakpoints` на узком экране.

### `center: { justify: true }` — **не** центрирование активного слайда

**`justify: true`** — отдельный режим выравнивания **всей группы слайдов** как единого блока. Включается **только** когда слайдер в состоянии **`locked`** (листать некуда).

#### Когда срабатывает `justify`

Слайдер переходит в **locked**, если весь контент помещается во viewport и прокрутка не нужна — например, 2 слайда при `perPage: 3`, или все карточки влезают в ширину трека. На корень вешается класс **`tvist-v1--locked`**. События **`lock`** / **`unlock`** — для скрытия стрелок и кастомной логики (см. замена `arrows:updated`).

#### Что делает `justify` в locked

В locked-режиме движок сдвигает `.tvist-v1__container` на половину «свободного» места между размером viewport и суммарной шириной/высотой контента:

- горизонтально: `translate3d(offsetPx, 0, 0)`, где `offset = max(0, (rootSize - contentSize) / 2)`;
- вертикально: `translate3d(0, offsetPx, 0)`.

По смыслу это как **`justify-content: center`** у flex-ряда: слайды **вместе** оказываются по центру viewport, а не один «текущий» по центру при листании.

#### Когда `justify` **не** срабатывает

- Пока слайдер **не** locked (есть куда листать) — обычная прокрутка, `justify` на позицию **не влияет**.
- Это **не** замена `center: true` / `active: true` — те центрируют **текущий** слайд при каждом переходе.

#### Только `justify: true` (без active)

```js
new TvistV1(root, {
  perPage: 3,
  gap: 16,
  center: { justify: true },
  loop: false
})
```

→ группа слайдов по центру **только в lock**. При листании активный слайд по центру viewport — **нет** (если не включён `active`).

#### Комбинации `center` в объекте

```js
// Splide-like + выравнивание группы в lock
center: { focus: true, justify: true }

// Жёсткий center при скролле + justify в lock (позиция при скролле — как focus, если focus: true)
center: { active: true, focus: true, justify: true }
```

### Сводка для миграции

| Опция | Когда работает | Эффект |
|---|---|---|
| `{ focus: true }` | при прокрутке (non-loop: clamp у краёв) | Splide `focus: 'center'` + trim; середина — центр, края — без пустот |
| `center: true` / `{ active: true }` | при любой прокрутке | активный **всегда** по центру, в т.ч. 1-й и последний |
| `{ justify: true }` | **только** `tvist-v1--locked` | вся лента сдвинута к центру, как flex `justify-content: center` |
| `{ focus: true, justify: true }` | focus при скролле + justify в lock | типичный «карусельный» Splide + центр группы, когда листать некуда |

**Частые ошибки:**

1. `center: { justify: true }` вместо `{ focus: true }` при миграции Splide `focus: 'center'` — слайды остаются у начала трека, пока не lock.
2. `center: true` вместо `{ focus: true }`, когда во Splide был **trimSpace** — на 1-м/последнем слайде появятся лишние пустые поля по краям.
3. Путать **`focus`** (trim у краёв) и **`active`** (всегда по центру).

**Проверка после миграции:**

- На **первом** слайде: при `{ focus: true }` лента у **min scroll**, без «чистого» center offset с пустотой слева; при `center: true` — слайд по центру viewport.
- На **среднем** слайде: при `{ focus: true }` активный по центру.
- На **последнем**: при `{ focus: true }` — **max scroll**, без пустоты справа.
- В **lock** с `justify: true` — группа слайдов визуально по центру (`tvist-v1--locked`).

Примеры в документации Tvist: [Center Mode](https://vladimirivanin.github.io/tvist/examples/center) — разделы **Focus** и **Justify в lock-режиме**.

**`fixedWidth` и `fixedHeight` (фиксированный размер слайда):**

- Значение — число (пиксели) или CSS-строка (`'12rem'`, `'30%'` и т.п.).
- **`fixedWidth`:** при **горизонтальном** направлении движок по ширине контейнера считает, сколько слайдов помещается; опция **`perPage` при каждом пересчёте перезаписывается** и сама по себе ширину слайда не задаёт. При **вертикальном** направлении задаёт только ширину слайда, высота ведёт себя как без этой опции.
- **`fixedHeight`:** при **вертикальном** направлении по высоте контейнера считается число видимых «рядов», **`perPage` перезаписывается** при пересчёте. При **горизонтальном** задаёт только высоту слайда.

**Отличие от `slideMinSize`:** `slideMinSize` — минимальная ширина или высота для **автоматического** подбора `perPage` без фиксированной ширины/высоты каждого слайда. Если во Splide был именно сценарий «у каждого слайда фиксированная ширина/высота, сколько влезет — столько видно», переноси на **`fixedWidth` / `fixedHeight`**; если цель — «не меньше N px на слайд, остальное посчитай» — **`slideMinSize`**.

**`grid` (встроенная сетка вместо Splide Grid extension):**

- Объект опции **`grid`** с полями:
  - **`rows`** — число рядов; **`cols`** — число колонок.
  - Если задан **только `cols`**, для рядов по умолчанию **1** (как у splide-extension-grid с rows 1, cols 1). Если задан **только `rows`**, для колонок по умолчанию **1**.
  - **`gap`** — отступы сетки: одно число или строка для всех сторон, либо объект **`{ row, col }`** (число или строка для строки/колонки). Если не задано, используется **глобальный** `gap` слайдера.
  - **`dimensions`** — массив пар **`[colSpan, rowSpan]`** на слайд; если слайдов больше, чем элементов в массиве, паттерн **повторяется с начала** (например `[[2, 1], [1, 2]]`).

**`focusableElements` (элементы, блокирующие старт drag):**

Дефолт: `'input, textarea, select, button:not(.modal__stories-nav-button), a[href], [tabindex]'`.

Tvist **не начинает** drag, если pointerdown попал на элемент, совпадающий с этим CSS-селектором. Кнопки и ссылки внутри слайда по умолчанию **блокируют** перетаскивание ленты — это ожидаемое поведение для форм и обычных CTA.

**Правило миграции для stories / полноэкранных зон навигации:** если в слайде лежат `<button>` для tap-зон «назад/вперёд», drag не сработает, пока эти кнопки входят в селектор. Переопредели `focusableElements`, **исключив** навигационные кнопки через `:not(...)`:

```js
new TvistV1(root, {
  // drag поверх tap-зон stories; остальные интерактивные элементы по-прежнему блокируют drag
  focusableElements: 'input, textarea, select, button:not(.modal__stories-nav-button), a[href], [tabindex]'
})
```

Подставь свой класс навигационных кнопок вместо `.modal__stories-nav-button`. Если нужно, чтобы drag работал поверх **всех** кнопок слайда — расширь `:not(...)`, но не убирай селектор целиком: формы и реальные CTA должны оставаться «не-draggable».

**`rewind` и `rewindByDrag` (перемотка без loop):**

- **`rewind: true`** — после последнего слайда переход на первый (и наоборот с первого на последний). Работает **без** `loop`: через `next()` / `prev()`, стрелки, autoplay, `scrollTo`. При включённом `loop` rewind не применяется.
- **`rewindByDrag`** — **`false` по умолчанию**. Разрешает **перемотку на противоположный конец ленты жестом drag**, если уже включён `rewind`.
  - При **`rewindByDrag: false`** (дефолт): пользователь может дотянуть ленту за край, но после отпускания слайдер **остаётся на последнем/первом** слайде — rewind **не** срабатывает. Через стрелки, `next()` / `prev()` и autoplay rewind по-прежнему работает.
  - При **`rewindByDrag: true`**: свайп «через» последний слайд вперёд (или мимо первого назад) после отпускания **перекидывает на противоположный конец** ленты. Анимация идёт с обычным **`speed`**, а не по длине drag.
- Прямого аналога Splide в таблице нет — при миграции проверь, ожидалось ли «зацикливание края» именно от перетаскивания; если да и `loop: false`, добавь `rewindByDrag: true` вместе с `rewind: true`.

```js
new TvistV1(root, {
  rewind: true,
  rewindByDrag: true, // перемотка края drag-жестом; без этой опции drag упирается в край
  drag: true
})
```

**`syncOnDrag` (синхронизация связанных слайдеров при drag):**

- **`true` по умолчанию** — при вызове **`main.sync(thumbs)`** оба инстанса переключаются вместе на **любое** изменение слайда, в том числе во время перетаскивания.
- **`syncOnDrag: false`** — **отключает синхронизацию на время drag**: пока пользователь тянет один слайдер, связанный **не** следует за ним. Синхронизация срабатывает при **клике** по слайду (в т.ч. в ленте с **`isNavigation: true`**), по **стрелкам**, через **`scrollTo` / `next` / `prev`** и прочие не-drag переходы.
- Типичный кейс миграции **gallery + thumbnails**: полоску миниатюр можно **прокручивать свайпом** независимо, а основная галерея переключается **только по клику** на миниатюру (или когда основной слайдер меняют не drag-ом). Опцию задают на том инстансе, **drag которого не должен тянуть пару** — обычно на слайдере миниатюр:

```js
const main = new TvistV1('.gallery-tvist-v1', { perPage: 1 })
const thumbs = new TvistV1('.thumbnails-tvist-v1', {
  isNavigation: true,
  perPage: 4,
  syncOnDrag: false // отключаем синхронизацию при перетаскивании
})
main.sync(thumbs)
```

- На **`isNavigation`**-ленте с `syncOnDrag: false` класс активной миниатюры при drag **не** обновляется «на лету» — только после клика или когда drag закончился и сработала обычная синхронизация. Это ожидаемое поведение, не баг верстки.

**Настройки loop:**

- `loop` поддерживает не только `true/false`, но и `'auto'`, а также объект:
  - `loop: { enabled: true, withClones: true }` — включает loop с DOM-клонами.
- **Если одновременно включены `peek` и `loop`**, обязательно задайте объект `loop` с **`withClones: true`** (например `loop: { enabled: true, withClones: true }`). Без `withClones` при такой связке возможны артефакты и некорректная работа слайдера.
- `withClones` полезен, когда нужна «классическая» бесшовность с клон-слайдами, но при миграции нужно учитывать:
  - в DOM появляются `tvist-v1__slide--clone`,
  - для бизнес-логики/аналитики безопаснее опираться на `realIndex` и payload событий, а не на прямой индекс DOM-узла.

**Эффект stack:**

- `effect: 'stack'` — встроенный эффект стопки карточек.
- Тонкая настройка через `stackEffect`:
  - `mode: 'cover' | 'uncover'`
  - `stackLayout: 'track' | 'pile'`
  - `slideShadows`, `rotate`, `perSlideRotate`, `perSlideOffset`, `perSlideScale`, `perSlideDepth`
  - `viewportPadding`, `zIndexProgressScale`, `slideTravelRatio`
- Классы состояния root для CSS/диагностики:
  - `tvist-v1--stack` — активен stack-эффект,
  - `tvist-v1--stack-pile` — режим `stackLayout: 'pile'`.

---

### Шаг 6 — События

| Splide | TvistV1 | Статус |
|---|---|---|
| `mounted` | `created` | переименовать |
| `mounted updated` (одной строкой) | два отдельных: `created` + `optionsUpdated` | разделить |
| `move` | `slideChangeStart` | переименовать событие; новый индекс передаётся в 1-м аргументе (не instance) |
| `moved` | `slideChangeEnd` | переименовать событие; новый индекс передаётся в 1-м аргументе (не instance) |
| `updated` | `optionsUpdated` | переименовать |
| `refresh` | `refresh` | совпадает |
| `resized` | `resized` | совпадает |
| `visible` | `visible` | совпадает |
| `drag` | `dragStart` | переименовать |
| `dragged` | `dragEnd` | переименовать |
| `click` | `click` | совпадает |
| `pagination:mounted` | `pagination:mounted` | совпадает |
| `arrows:updated` | `lock` + `unlock` | заменить логику |
| `active` | `slideChangeStart` | переименовать, индекс из аргумента |
| `autoplay:play` | `autoplayStart` | переименовать |
| `autoplay:pause` | `autoplayPause` | переименовать |
| — | `autoplayProgress` | публичное событие Tvist: прогресс шага autoplay, см. документацию пакета |
| — | `longPressStart` / `longPressEnd` | при `holdToPause`: начало/конец удержания |
| — | `reachEnd` | конец ленты при autoplay без `loop` (и др. условия — см. документацию) |

**Замена `arrows:updated`:**

```js
// До: Splide
splide.on('arrows:updated', (prev, next, prevIndex, nextIndex) => {
  updateArrowsVisibility()
})

// После: Tvist — реагировать на lock/unlock
tvist.on('lock', () => {
  arrowsWrap.classList.add('is-hide')
})
tvist.on('unlock', () => {
  arrowsWrap.classList.remove('is-hide')
})
// Стартовое состояние:
tvist.on('created', (t) => {
  if (t.engine.isLocked) arrowsWrap.classList.add('is-hide')
})
```

---

### Шаг 7 — Обновить snippet.scss

**Замена классов:**

| Splide | TvistV1 |
|---|---|
| `.splide` | `.tvist-v1` |
| `.splide__track` | `.tvist-v1__track` |
| `.splide__list` | `.tvist-v1__container` |
| `.splide__slide` | `.tvist-v1__slide` |
| `.splide__slide.is-active` | `.tvist-v1__slide--active` |
| `.splide__arrows` | `.tvist-v1__arrows` (или кастомный враппер) |
| `.splide__arrow` | `.tvist-v1__arrow` |
| `.splide__arrow--prev` | `.tvist-v1__arrow--prev` |
| `.splide__arrow--next` | `.tvist-v1__arrow--next` |
| `.splide__arrow--disabled` | `.tvist-v1__arrow--disabled` |
| `.splide__pagination` | `.tvist-v1__pagination` |
| `.splide__pagination__page` | `.tvist-v1__bullet` |
| `.splide__pagination__page.is-active` | `.tvist-v1__bullet--active` |

**ВАЖНО — стили `.splide__track` с `overflow: hidden`:**

В `snippet.scss` часто встречается блок вроде:

```scss
.splide__track {
  width: 100%;
  overflow: hidden;
}
```

Такой блок **нужно удалять целиком**, а **не** переносить селектор на `.tvist-v1__track` или `.tvist-v1__container`. `overflow: hidden` на контейнере ленты ломает поведение слайдера Tvist (прокрутку и отображение соседних слайдов). Ширину 100% при необходимости задавай на корне `.tvist-v1` или на внешней обёртке виджета — без сочетания «внутренний контейнер ленты + `overflow: hidden`».

> Если в теме используется кастомный `disabledClass` (например `is-disabled`), передать его в опцию: `arrows: { disabledClass: 'is-disabled' }`.

**Базовые стили Tvist для пагинации (дефолт темы бандла):**

- `.tvist-v1__pagination`: `position: absolute`, `width: 95%`, `bottom: var(--tvist-v1-pagination-bottom, 10px)`, `left: 50%`, `transform: translateX(-50%)`, `display: flex`, `justify-content: center`, **`gap: var(--tvist-v1-pagination-gap, 8px)`**, `margin: 0`, `padding: 0`, `z-index: 10`.
- Буллет `.tvist-v1__bullet`: круг, размер `--tvist-v1-bullet-size`, без margin в дефолте, opacity `--tvist-v1-bullet-opacity`, `cursor: pointer`, `transition: transform 0.2s linear`.
- Активный `.tvist-v1__bullet--active`: фон `--tvist-v1-bullet-active-color`, **`transform: scale(--tvist-v1-bullet-active-scale)`** (дефолт `1.4`), `z-index: 1`.
- Fraction/progress: классы `.tvist-v1__pagination-current`, `-separator`, `-total`, `-progress`, `-progress-bar` — переменные `--tvist-v1-fraction-*`, `--tvist-v1-progress-*` (на ≤768px fraction `12px`, progress width `150px`).
- Скрытие: `.tvist-v1__pagination--hidden`.

Если в стилях виджета для `.splide__pagination__page` был **`margin`** — после замены на `.tvist-v1__bullet` **обнули margin** и перенеси шаг в **`--tvist-v1-pagination-gap`**; см. кейс «margin у точек Splide» в шаге 3.

**Базовые стили Tvist для стрелок (дефолт темы бандла):**

- `.tvist-v1__arrow`: круглая кнопка `--tvist-v1-arrow-size`, фон `--tvist-v1-arrow-bg`, `top: 50%; transform: translateY(-50%)`.
- `--prev`: `left: var(--tvist-v1-arrow-offset)`; `--next`: `right: var(--tvist-v1-arrow-offset)`.
- Disabled: `:disabled` или `.tvist-v1__arrow--disabled` (`opacity: --tvist-v1-arrow-disabled-opacity`, `pointer-events: none`).
- На ≤768px: `--tvist-v1-arrow-size: 32px`, `--tvist-v1-arrow-offset: 5px`.

Это означает, что при кастомизации нужно переопределять CSS-переменные или классы стрелок/буллетов, а не рассчитывать на структуру Splide (`ul/li`, margin+gap одновременно).

**ВАЖНО — вертикальный слайдер: отступы между слайдами не через `margin` на `.tvist-v1__slide`**

У Splide в режиме «сверху вниз» (`direction: 'ttb'` → в Tvist **`direction: 'vertical'`**, см. таблицу опций в шаге 5) расстояние между слайдами нередко задают в CSS: **`margin-bottom`** на `.splide__slide` (иногда в процентах от высоты колонки), плюс **`&:last-child { margin-bottom: 0 }`**. После замены классов на Tvist тот же приём **нельзя оставлять** на `.tvist-v1__slide`: у ленты Tvist зазор между слайдами считается через опцию **`gap`**, а дублирующий margin ломает геометрию прокрутки и совпадение с расчётами движка.

Типичный антипаттерн после слепой замены классов (нужно **удалить** margin у слайдов и обнулить «костыль» для последнего):

```scss
&__gallery-tumbs {
  .tvist-v1 {
    height: 100%;
  }

  .tvist-v1__track {
    height: 100% !important;
  }

  .tvist-v1__slide {
    height: auto;
    margin-bottom: 18.8%;

    @media screen and (max-width: 1280px) {
      margin-bottom: 15%;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
```

**Правило миграции:** убрать **`margin-bottom` / `margin-top`** между вертикальными слайдами (и селекторы вроде «последний без margin»). Нужный шаг задать в **`snippet.js`** опцией **`gap`** (число в px или строка с единицами — как принято в виджете). Разные отступы по ширине экрана — через **`breakpoints`** у того же инстанса Tvist (desktop-first `max-width`, как у Splide), например меньший `gap` при `1280`, а не отдельные `@media` в SCSS для margin слайдов:

```js
new TvistV1(root, {
  direction: 'vertical',
  gap: 12, // подобрать по макету вместо бывших 18.8% / 15%
  breakpoints: {
    1280: { gap: 10 }
  }
})
```

Проценты из старого CSS обычно переводят в **фиксированные px/rem** по макету или по высоте миниатюры — движок задаёт единый `gap` между всеми соседними слайдами, отдельно «последнему» ничего не обнулять.

**Стрелки в вертикали:** после миграции **обязательно проверить визуально** — дефолтное позиционирование `.tvist-v1__arrow` рассчитано на горизонтальную ленту; в узкой колонке миниатюр (`direction: 'vertical'`) стрелки часто должны стоять **по центру поперёк колонки**. Выравнивание по горизонтальной оси колонки можно задать так (подставь свой префикс-обёртку виджета):

```scss
.product__gallery-tumbs .tvist-v1__arrow--prev {
  left: 50%;
  transform: translate(-50%);
}
```

Для **`.tvist-v1__arrow--next`** обычно нужен тот же **`left: 50%`** и **`transform: translate(-50%)`**, плюс **`top` / `bottom`** по макету (верхняя и нижняя стрелка). Если у стрелки уже используется `transform` для поворота иконки, не затирай его вслепую: либо объединяй значения в одном `transform`, либо центрируй внутренний элемент, а не ломай поворот кнопки.

**ВАЖНО — кастомные составные классы с именем виджета:**

Виджеты часто используют классы вида `{widget-name}-splide`, `{widget-name}-splide__body` и т.п. — это кастомные классы, не стандартные Splide-классы. Простой `sed`-замены `splide` → `tvist-v1` недостаточно: нужно вручную найти и переименовать все такие классы **во всех трёх файлах**: `snippet.scss`, `snippet.liquid` и `snippet.js`.

```scss
/* До */
.stories-splide { ... }
.stories-splide__body { ... }

/* После */
.stories-tvist-v1 { ... }
.stories-tvist-v1__body { ... }
```

```html
<!-- До -->
<div class="stories-splide">
  <div class="stories-splide__contanier">
    <div class="stories-splide__body">

<!-- После -->
<div class="stories-tvist-v1">
  <div class="stories-tvist-v1__contanier">
    <div class="stories-tvist-v1__body">
```

Проверить: после замены в **каждом** из трёх файлов не должно остаться ни одного вхождения слова `splide` (кроме комментариев).

**Кастомные классы-идентификаторы слайдеров (gallery-splide, thumbnails-splide и т.п.):**

Если слайдер имеет кастомный класс-идентификатор вида `gallery-splide` или `thumbnails-splide`, его нужно переименовать во всех трёх файлах одновременно. Иначе CSS-стили (скрытие, адаптив) не будут применяться, а JS не найдёт элемент.

```html
<!-- До -->
<div class="tvist-v1 gallery-splide">
<div class="tvist-v1 thumbnails-splide">

<!-- После -->
<div class="tvist-v1 gallery-tvist-v1">
<div class="tvist-v1 thumbnails-tvist-v1">
```

```js
// До
widget_type.find('.gallery-splide').get(0)
widget_type.find('.thumbnails-splide').get(0)

// После
widget_type.find('.gallery-tvist-v1').get(0)
widget_type.find('.thumbnails-tvist-v1').get(0)
```

---

### Шаг 8 — Специальные случаи

**Sync-пара (gallery + thumbnails):**

```js
// До
const main = new Splide('.main', { ... })
const thumbs = new Splide('.thumbs', { isNavigation: true, ... })
main.sync(thumbs).mount()

// После
const main = new TvistV1('.main', { ... })
const thumbs = new TvistV1('.thumbs', {
  isNavigation: true,
  syncOnDrag: false, // лента миниатюр скроллится свайпом без сдвига основной галереи
  ...
})
main.sync(thumbs)
```

Подробнее про **`syncOnDrag`** и **`rewindByDrag`** — блоки в шаге 5 (таблица опций).

**Grid extension:**

```js
// До
new Splide(root, { ... }).mount({ Grid: window.splide.Extensions.Grid })
// с опциями: grid: { rows: 2, cols: 3, gap: { row: '10px', col: '10px' } }

// После — те же rows/cols/gap; при необходимости dimensions для span ячеек
new TvistV1(root, {
  grid: {
    rows: 2,
    cols: 3,
    gap: { row: '10px', col: '10px' } // или одна строка/число; иначе возьмётся root gap
    // dimensions: [[2, 1], [1, 2]]
  }
})
```

Семантика полей `grid` (дефолты `rows`/`cols`, `gap` vs глобальный `gap`, циклический `dimensions`) — в таблице опций шага 5 выше.

**Динамический perPage (slideMinSize):**

```js
// До: ручной расчёт
function getSlidesPerView(containerWidth, slideWidth, gap) { ... }
splide.options = { perPage: getSlidesPerView(...) }

// После: Tvist считает сам
new TvistV1(root, {
  slideMinSize: 280,  // минимальная ширина слайда в px
  gap: 16
})
// При изменении настроек:
tvist.updateOptions({ slideMinSize: newWidth })
```

**Destroy + reinit в редакторе:**

```js
// До
splide.destroy()
splide = new Splide(root, newOptions).mount()

// После — предпочитать updateOptions
tvist.updateOptions(newOptions)
// Если нужен полный пересоздание:
tvist.destroy()
tvist = new TvistV1(root, newOptions)
```

---

## Чек-лист проверки после миграции

- [ ] `info.json`: убраны все `splide*`, добавлен `tvist-v1`
- [ ] `snippet.liquid`: **иерархия** `.tvist-v1` → `.tvist-v1__track` → `.tvist-v1__container` без лишних обёрток (`splide__slider` / `tvist-v1__slider` удалены или вынесены вне цепочки)
- [ ] `snippet.liquid`: классы заменены; div пагинации Tvist добавлен, если пагинация нужна (учти дефолт Splide 3: без `pagination: false` она была включена, даже без узла в Liquid); проверь `snippet.scss` на скрытие `.splide__pagination` по брейкпоинтам; при «ложном» `pagination: false` во Splide см. кейс кастомной пагинации
- [ ] `snippet.liquid`: баланс тегов не нарушен — количество `<div` равно количеству `</div>` (проверить командой `grep -c "<div" snippet.liquid && grep -c "</div>" snippet.liquid`)
- [ ] `snippet.js`: `new Splide().mount()` → `new TvistV1()`, методы переименованы
- [ ] `snippet.scss`: все `.splide__*` заменены на `.tvist-v1__*` (кроме удалённых блоков `.splide__track` с `overflow: hidden` — см. шаг 7); кастомные `{name}-splide` → `{name}-tvist-v1`; в файле не осталось слова `splide`; у пагинации **`margin: 0` на буллетах**, шаг между точками через **`--tvist-v1-pagination-gap`** (не дублировать margin Splide); у **вертикальной** ленты нет **`margin` между `.tvist-v1__slide`** — отступы только через **`gap`** и **`breakpoints`** в `snippet.js`
- [ ] Стрелки: убраны ручные обработчики кликов; если стрелки вне root — переданы через `arrows: { prev: el, next: el }` в опциях; при **`direction: 'vertical'`** — проверить выравнивание по макету (часто по центру колонки: `left: 50%` и `transform: translate(-50%)` на `--prev` / `--next`, см. шаг 7)
- [ ] `focusableElements`: для stories/tap-зон на `<button>` — `:not(...)` для навигационных кнопок
- [ ] События: `arrows:updated` заменён на `lock/unlock`
- [ ] Редактор: `destroy/reinit` и `updateOptions` работают корректно
- [ ] Адаптив: `breakpoints` проверены, `destroy: true` заменён на `enabled: false`
- [ ] `center`: Splide `focus: 'center'` + trim → **`center: { focus: true }`**; без trim → `center: true` / `{ active: true }`; не путать с `{ justify: true }`; lock-выравнивание — `{ focus: true, justify: true }`
- [ ] Вложенные «истории»: внешний уровень без конфликтующего autoplay; внутренний — `autoplay` + при необходимости `holdToPause` / `waitForVideo`; сегменты прогресса из `autoplayProgress`; оверлеи с `data-tvist-no-hold` при использовании `exclude`
- [ ] Свайп/drag работает на мобильных (если нет — проверь иерархию DOM, см. шаг 3)

---

## Источники для сверки

**Репозиторий Tvist (основной):** [https://github.com/VladimirIvanin/tvist](https://github.com/VladimirIvanin/tvist)

- Документация и интерактивные примеры: [https://vladimirivanin.github.io/tvist/](https://vladimirivanin.github.io/tvist/)
- Сборка для браузера: `browser-build/tvist.css`, `browser-build/tvist.min.js` (глобальный конструктор `TvistV1`)
- Справочник опций: `docs/api/options.md`, метаданные `docs/.vitepress/options-meta.json`

**Если агент не может точно решить задачу миграции** (неочевидная опция, изменившееся поведение, расхождение со скиллом) — **обязательно** загляни в репозиторий: исходники модулей (`src/modules/`), базовые стили (`src/styles/`), актуальный `browser-build/tvist.css`. Не угадывай по памяти.

**Локальные копии в workspace** (для офлайн-сверки):

- Tvist: `.cursor/tvist-main`
- Splide: `.cursor/splide-master`

---

## Дополнительные ресурсы

- Полные таблицы маппинга API, опций, событий: [api-map.md](api-map.md)
- Шаблоны кода для типовых сценариев: [patterns.md](patterns.md)
- Публичный API TvistV1 с примерами: [tvist-reference.md](tvist-reference.md)
- Репозиторий библиотеки: [github.com/VladimirIvanin/tvist](https://github.com/VladimirIvanin/tvist)
