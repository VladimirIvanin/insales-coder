# API Map: Splide → TvistV1

## Методы

| Splide v2/v3 | TvistV1 | Статус | Примечание |
|---|---|---|---|
| `new Splide(root, opts).mount()` | `new TvistV1(root, opts)` | замена | mount в конструкторе, отдельного вызова нет |
| `splide.destroy()` | `tvist.destroy()` | совпадает | |
| `splide.destroy(true)` | `tvist.destroy()` | частичный аналог | проверить нужен ли ручной reset DOM |
| `splide.refresh()` | `tvist.update()` | переименовать | |
| `splide.options = {...}` | `tvist.updateOptions({...})` | замена | setter → явный метод |
| `splide.go('+')` | `tvist.next()` | замена | |
| `splide.go('-')` | `tvist.prev()` | замена | |
| `splide.go('>')` | `tvist.next()` | замена | |
| `splide.go('<')` | `tvist.prev()` | замена | |
| `splide.go(n)` | `tvist.scrollTo(n)` | замена | |
| `splide.go(n, false)` | `tvist.scrollTo(n, true)` | замена | второй аргумент инвертирован: `false=wait` → `true=instant` |
| `splide.sync(other)` | `tvist.sync(other)` | совпадает | |
| `splide.on(event, cb)` | `tvist.on(event, cb)` | совпадает | |
| `splide.off(event, cb)` | `tvist.off(event, cb)` | совпадает | |
| `splide.emit(event, ...args)` | `tvist.emit(event, ...args)` | совпадает | |
| `splide.mount({ Grid: ... })` | `new TvistV1(root, { grid: {...} })` | замена | extensions через опции |
| `splide.is('loop')` | `tvist.options.loop` | замена | |

## Свойства

| Splide v2/v3 | TvistV1 | Статус |
|---|---|---|
| `splide.index` | `tvist.activeIndex` | переименовать |
| `splide.length` | `tvist.slides.length` | замена |
| `splide.options` (get) | `tvist.options` | совпадает |
| `splide.Components.Elements.list` | `tvist.container` | замена |
| `splide.Components.Elements.slides` | `tvist.slides` | замена |
| `splide.Components.Elements.track` | `tvist.root` | замена |
| `splide.Components.Elements.length` | `tvist.slides.length` | замена |
| `root.splide` (кастомное поле) | `root.tvistInstance` | замена |

## Опции — ядро и layout

| Splide | TvistV1 | Статус |
|---|---|---|
| `type: 'slide'` | (по умолчанию, убрать) | убрать |
| `type: 'loop'` | `loop: true \| 'auto' \| { enabled, withClones }` | замена |
| `type: 'fade'` | `effect: 'fade'` | замена |
| (прямого аналога нет; обычно кастом на `type: 'slide'`) | `effect: 'stack'` + `stackEffect` | режим Tvist (отдельная реализация) |
| `perPage` | `perPage` | совпадает |
| `perMove` | `slidesPerGroup` | переименовать |
| `gap` | `gap` | совпадает |
| `padding` | `peek` | переименовать |
| `start` | `start` | совпадает |
| `speed` | `speed` | совпадает |
| `rewind` | `rewind` | совпадает |
| `direction: 'ltr'` | (по умолчанию) | убрать |
| `direction: 'ttb'` | `direction: 'vertical'` | замена |
| `fixedWidth` | `fixedWidth` | тот же смысл: фикс. ширина; в горизонтали `perPage` пересчитывается |
| `fixedHeight` | `fixedHeight` | фикс. высота; в вертикали `perPage` пересчитывается |
| — | `slideMinSize` | авто `perPage` по минимальному размеру слайда (не то же, что `fixedWidth`) |
| `focus: 'center'` | **`center: { focus: true }`** (Splide + `trimSpace: true`); без trim — `center: true` / `{ active: true }`; lock — `{ justify: true }` | замена |
| `trimSpace: true` | встроено в `center: { focus: true }` | замена |
| `trimSpace: false` | `center: true` / `center: { active: true }` | замена |
| `isNavigation` | `isNavigation` | совпадает |

## Опции — drag/scroll

| Splide | TvistV1 | Статус |
|---|---|---|
| `drag: true` | `drag: true` | совпадает |
| `drag: false` | `drag: false` | совпадает |
| `drag: 'free'` | `drag: 'free'` | совпадает |
| `flickPower` | `flickPower` | совпадает |
| `flickMaxPages` | `flickMaxPages` | совпадает |
| — | `focusableElements` | опция | CSS-селектор элементов (по умолчанию `input, textarea, select, button, a[href], [tabindex]`), клик по которым не начинает drag. При необходимости переопределить для кнопок, работающих как слои поверх слайда. |
| `keyboard` | `keyboard` | частичный аналог |
| `wheel` | `wheel` | частичный аналог |

## Опции — навигация/UI

| Splide | TvistV1 | Статус |
|---|---|---|
| `arrows: true/false` | `arrows: true/false` | совпадает |
| `arrowPath` | `arrows: { addIcons: ... }` | замена |
| `pagination: true/false` | `pagination: true/false` | совпадает по флагу; во Splide 3, если опцию не задавали, по умолчанию `true` и разметка могла создаваться в JS без Liquid — см. SKILL.md «Splide: что было по умолчанию»; если во Splide было `false`, но в JS ручные точки и `move`/`go` — см. кейс «ложное pagination: false» в SKILL.md |

## Опции — автопрокрутка

| Splide | TvistV1 | Статус |
|---|---|---|
| `autoplay: true` | `autoplay: true` | совпадает |
| `interval: N` | `autoplay: { delay: N }` | замена |
| `pauseOnHover: true` | `autoplay: { pauseOnHover: true }` | вложить в autoplay |
| `pauseOnFocus: true` | `autoplay: { pauseOnInteraction: true }` | замена |
| `resetProgress: false` | `autoplay: { disableOnInteraction: false }` | замена |

## Опции — адаптивность

| Splide | TvistV1 | Статус |
|---|---|---|
| `breakpoints` | `breakpoints` | совпадает |
| `destroy: true` внутри breakpoints | `enabled: false` внутри breakpoints | замена |
| `mediaQuery: 'max'` | `breakpointsBase: 'window'` (по умолчанию) | совпадает |

## Опции — extensions

| Splide | TvistV1 | Статус |
|---|---|---|
| `mount({ Grid: ... })` + `grid: { rows, cols, gap }` | `grid: { rows?, cols?, gap?, dimensions? }` | встроено; дефолт `rows`/`cols` = 1 при задании только одного из них; `gap` может быть числом/строкой или `{ row, col }`, иначе берётся корневой `gap`; `dimensions` — циклический список `[colSpan, rowSpan]` |
| `mount({ Video: ... })` + video-опции | `video: { autoplay, muted, loop }` | встроено |
| `lazyLoad: 'nearby'` | `lazy: true` | замена |
| `preloadPages: N` | `lazy: { preloadPrevNext: N }` | замена |

## Опции — loop/effects

При **`peek` + `loop`** в Tvist нужно явно задать **`withClones: true`** в объекте `loop` (например `loop: { enabled: true, withClones: true }`); иначе возможны артефакты.

| Splide | TvistV1 | Статус |
|---|---|---|
| `type: 'loop'` | `loop: { enabled?: boolean, withClones?: boolean }` | замена |
| — | `loop: 'auto'` | опция |
| `type: 'slide'` + ручные card-стили | `effect: 'stack'` | подход Tvist (не прямой аналог Splide) |
| — | `stackEffect.mode: 'cover' \| 'uncover'` | опция |
| — | `stackEffect.stackLayout: 'track' \| 'pile'` | опция |
| — | `stackEffect.perSlideOffset/perSlideScale/perSlideDepth` | опция |
| — | `stackEffect.viewportPadding` | опция |

## События

| Splide | TvistV1 | Статус |
|---|---|---|
| `mounted` | `created` | переименовать |
| `updated` | `optionsUpdated` | переименовать |
| `refresh` | `refresh` | совпадает |
| `move` | `slideChangeStart` | переименовать событие; новый индекс передаётся в 1-м аргументе (не instance) |
| `moved` | `slideChangeEnd` | переименовать событие; новый индекс передаётся в 1-м аргументе (не instance) |
| `active` | `slideChangeStart` | переименовать, индекс из аргумента |
| `visible` | `visible` | совпадает |
| `hidden` | `hidden` | совпадает |
| `drag` | `dragStart` | переименовать |
| `dragged` | `dragEnd` | переименовать |
| `click` | `click` | совпадает |
| `resized` | `resized` | совпадает |
| `pagination:mounted` | `pagination:mounted` | совпадает |
| `navigation:mounted` | `navigation:mounted` | совпадает |
| `arrows:updated` | `lock` + `unlock` | заменить логику |
| `autoplay:play` | `autoplayStart` | переименовать |
| `autoplay:pause` | `autoplayPause` | переименовать |
| `autoplay:playing` | `autoplayProgress` | переименовать |
| `lazyload:loaded` | `lazyLoaded` | переименовать |

## CSS-классы

| Splide | TvistV1 |
|---|---|
| `.splide` | `.tvist-v1` |
| `.splide__track` | `.tvist-v1__track` |
| `.splide__list` | `.tvist-v1__container` |
| `.splide__slide` | `.tvist-v1__slide` |
| `.splide__arrows` | `.tvist-v1__arrows` |
| `.splide__arrow` | `.tvist-v1__arrow` |
| `.splide__arrow--prev` | `.tvist-v1__arrow--prev` |
| `.splide__arrow--next` | `.tvist-v1__arrow--next` |
| `.splide__arrow--disabled` | `.tvist-v1__arrow--disabled` |
| `.splide__pagination` | `.tvist-v1__pagination` |
| `.splide__pagination__page` | `.tvist-v1__bullet` |
| `.splide__pagination__page.is-active` | `.tvist-v1__bullet--active` |
| `.is-active` (слайд) | `.tvist-v1__slide--active` |
| `.is-visible` (слайд) | `.tvist-v1__slide--visible` |
| `.splide--dragging` | `.tvist-v1--dragging` |
| `.splide--loop` | `.tvist-v1--loop` |

## Состояния root-элемента (TvistV1)

| Класс | Когда добавляется |
|---|---|
| `tvist-v1--created` | после инициализации |
| `tvist-v1--locked` | когда все слайды помещаются в контейнер |
| `tvist-v1--destroyed` | после `destroy()` |
| `tvist-v1--loop` | при `loop: true` |
| `tvist-v1--stack` | при `effect: 'stack'` |
| `tvist-v1--stack-pile` | при `effect: 'stack'` + `stackEffect.stackLayout: 'pile'` |
| `tvist-v1--dragging` | во время drag |
