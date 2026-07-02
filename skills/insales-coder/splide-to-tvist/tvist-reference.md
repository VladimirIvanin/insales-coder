# TvistV1: публичный API с примерами

Этот файл — быстрый справочник по публичному API TvistV1:
- методы экземпляра,
- опции конфигурации,
- события,
- свойства экземпляра.

Фокус: только публичный API и практические примеры.

## Быстрый старт

```js
const slider = new TvistV1('.js-slider', {
  perPage: 3,
  gap: 16,
  arrows: true,
  pagination: true
})
```

---

## 1) Методы экземпляра

### Навигация

#### `scrollTo(index, instant?)`
Переход к слайду по индексу.

```js
slider.scrollTo(2)        // анимированный переход
slider.scrollTo(0, true)  // мгновенный переход
```

#### `next()`
Переход к следующему слайду.

```js
if (slider.canScrollNext) slider.next()
```

#### `prev()`
Переход к предыдущему слайду.

```js
if (slider.canScrollPrev) slider.prev()
```

### Управление состоянием

#### `update()`
Пересчёт размеров/позиций после изменения DOM или размеров контейнера.

```js
slider.container.appendChild(newSlideEl)
slider.update()
```

#### `updateOptions(partialOptions)`
Динамическое изменение опций без пересоздания экземпляра.

```js
slider.updateOptions({
  perPage: 2,
  gap: 12
})
```

#### `destroy()`
Уничтожение экземпляра.

```js
slider.destroy()
```

### Связь слайдеров

#### `sync(targetSlider)`
Синхронизация с другим экземпляром.

```js
const main = new TvistV1('.js-main', { perPage: 1 })
const thumbs = new TvistV1('.js-thumbs', { perPage: 5, isNavigation: true })
main.sync(thumbs)
```

### События

#### `on(event, handler)`
Подписка на событие.

```js
slider.on('slideChangeStart', (index) => {
  console.log('Новый индекс:', index)
})
```

#### `off(event, handler?)`
Отписка от конкретного обработчика или от всех обработчиков события.

```js
const handler = (i) => console.log(i)
slider.on('slideChangeStart', handler)
slider.off('slideChangeStart', handler)
slider.off('slideChangeStart')
```

#### `once(event, handler)`
Подписка на одно срабатывание.

```js
slider.once('created', () => {
  console.log('Сработает один раз')
})
```

#### `emit(event, ...args)`
Ручной вызов пользовательского события.

```js
slider.on('custom:event', (payload) => console.log(payload))
slider.emit('custom:event', { ok: true })
```

### Работа с модулями

#### `getModule(name)`
Получение экземпляра модуля (если зарегистрирован и активен).

```js
const autoplay = slider.getModule('autoplay')
autoplay?.pause?.()
```

---

## 2) Опции (настройки)

## Базовые

- `perPage`: число видимых слайдов.
- `slidesPerGroup`: сколько слайдов листать за действие.
- `slideMinSize`: минимальный размер слайда для авто-расчёта `perPage`.
- `fixedWidth` / `fixedHeight`: фиксированная ширина или высота слайда (число px или CSS-строка). В горизонтали при `fixedWidth` и в вертикали при `fixedHeight` движок пересчитывает видимое число слайдов и **перезаписывает `perPage`**; на поперечной оси опция задаёт только второй размер слайда.
- `gap`: отступ между слайдами.
- `peek`: показывать части соседних слайдов.
- `peekTrim`: подрезать peek по краям.
- `center`: центрирование слайдов. Тип — булево или объект с полями **`active`** и **`justify`** (оба необязательны).
  - **`true`** — центрирует **активный** слайд во viewport (режим «активный по центру»).
  - **`{ active: true }`** — то же по смыслу, что **`center: true`**.
  - **`{ justify: true }`** — когда лента в состоянии locked, **все** слайды визуально выравниваются по центру оси трека (поведение уровня `justify-content: center`); комбинируется с **`active`** при необходимости.
- `speed`: скорость анимации.
- `direction`: `horizontal` / `vertical`.
- `start`: стартовый индекс.
- `debug`: режим отладки.

```js
new TvistV1('.js-slider', {
  perPage: 3,
  slidesPerGroup: 1,
  gap: 16,
  speed: 350,
  start: 0
})
```

## Режимы и отображение

- `loop`: бесконечная прокрутка (`true | false | 'auto' | { enabled, withClones }`).
- `rewind`: возврат к первому слайду после последнего (когда `loop: false`).
- `effect`: `slide | fade | cube | stack`.
- `fadeEffect`: параметры fade.
- `stackEffect`: параметры stack (`mode`, `stackLayout`, `perSlideOffset`, `perSlideScale`, ...).
- `cubeEffect`: параметры cube.
- `autoWidth`, `autoHeight`: размер слайдов по контенту.
- `grid`: сетка — `rows`, `cols` (если задано только одно из двух, второе по умолчанию 1), `gap` как у корня или `{ row, col }`, опционально `dimensions: [colSpan, rowSpan][]` с циклическим повторением.
- `marquee`: бегущая строка.

```js
new TvistV1('.js-slider', {
  loop: { enabled: true, withClones: true },
  effect: 'stack',
  stackEffect: {
    mode: 'cover',
    stackLayout: 'pile',
    perSlideOffset: 6,
    perSlideRotate: 2
  },
  speed: 500
})
```

## Перетаскивание и поведение ввода

- `drag`: `true | false | 'free'`.
- `dragSpeed`: чувствительность drag.
- `rubberband`: эффект резинки на краях.
- `freeSnap`: snap в режиме `drag: 'free'`.
- `flickPower`, `flickMaxPages`: инерция.
- `focusableElements`: селектор элементов, исключаемых из drag-конфликта.
- `preventClicks`, `preventClicksPropagation`.
- `keyboard`: клавиатурная навигация.
- `wheel`: управление колесом.

```js
new TvistV1('.js-slider', {
  drag: 'free',
  freeSnap: true,
  wheel: { sensitivity: 1.2, releaseOnEdges: true }
})
```

## Навигация UI

- `arrows`: `true` или объект:
  - `prev`, `next`,
  - `disabledClass`, `hiddenClass`,
  - `addIcons`,
  - `hideWhenSinglePage`.
- `pagination`: `true` или объект:
  - `container`,
  - `type` (`bullets`, `fraction`, `progressbar`, `custom`),
  - `clickable`,
  - `bulletClass`, `bulletActiveClass`,
  - `renderBullet`, `renderFraction`, `renderCustom`,
  - `hideWhenSinglePage`, `limit`, `strategy`, `remainderStrategy`.
- `scrollbar`: `true` или объект (`container`, `hide`, `hideDelay`, ...).

```js
new TvistV1('.js-slider', {
  arrows: {
    prev: '.js-prev',
    next: '.js-next',
    disabledClass: 'is-disabled'
  },
  pagination: {
    container: '.js-pagination',
    type: 'bullets',
    clickable: true
  }
})
```

## Автоматизация и медиа

- `autoplay`: `false | true | number | object`
  - `delay`, `pauseOnHover`, `pauseOnInteraction`, `disableOnInteraction`, `waitForVideo`.
- `video`: `false | true | object`
  - `autoplay`, `muted`, `loop`, `playsinline`, `pauseOnLeave`, `resetOnLeave`, `pauseOnHold` (пауза видео при удержании, обычно вместе с `holdToPause`).
- `holdToPause`: `true | object` — пауза автопрокрутки при долгом удержании указателя на слайдере.
  - поля объекта: `enabled`, `threshold` (мс), `root` (`'slider' | 'container'`), `exclude` (CSS-селектор узлов без удержания), `cancelOnDrag`.
- `visibility`: пауза autoplay/marquee при выходе из viewport.
- `lazy`: lazy-load изображений.

```js
new TvistV1('.js-slider', {
  autoplay: { delay: 3500, pauseOnHover: true },
  lazy: { preloadPrevNext: 1 }
})
```

### Сценарий «истории»: автоплей + видео + удержание

```js
new TvistV1(root, {
  holdToPause: {
    threshold: 300,
    exclude: '[data-tvist-no-hold]',
    cancelOnDrag: true,
  },
  autoplay: {
    delay: 5000,
    pauseOnHover: false,
    waitForVideo: true,
  },
  video: {
    autoplay: true,
    muted: true,
    pauseOnHold: true,
  },
  on: {
    autoplayProgress: ({ progress, index }) => {
      /* progress 0..1 — активный сегмент; index — текущий слайд */
    },
  },
})
```

У вложенных слайдеров внешний уровень обычно с `autoplay: false`, внутренний — с `autoplay` и `holdToPause`, чтобы не было двух независимых таймеров. При смене активной «группы» у неактивных внутренних экземпляров выключайте autoplay через `updateOptions({ autoplay: false })` (или `autoplay.stop()`), после `update()` на активном.

## Дополнительно

- `enabled`: включение/выключение слайдера.
- `isNavigation`: режим навигационного слайдера.
- `thumbs`: связь слайдера с миниатюрами.
- `breakpoints`: адаптивные overrides (desktop-first, max-width).
- `breakpointsBase`: `window` или `container`.
- `on`: объект хендлеров событий при инициализации.

```js
new TvistV1('.js-slider', {
  enabled: false,
  breakpoints: {
    768: { enabled: true, perPage: 1 }
  }
})
```

---

## 3) События

Ниже группы событий и по одному короткому примеру.

## Жизненный цикл

- `created`
- `beforeDestroy`
- `destroyed`
- `refresh`
- `optionsUpdated`

```js
slider.on('created', (tvist) => {
  console.log('Создан:', tvist.id)
})
```

## Смена слайда

- `beforeSlideChange`
- `slideChangeStart`
- `slideChangeEnd`
- `beforeTransitionStart`
- `transitionStart`
- `transitionEnd`
- `scroll`
- `progress` (`!loop`)
- `reachBeginning`
- `reachEnd`

```js
slider.on('slideChangeEnd', (index) => {
  console.log('Активный слайд:', index)
})
```

## Взаимодействие

- `click`
- `dragStart`
- `drag`
- `dragEnd`

```js
slider.on('click', (index, slide, event) => {
  console.log('Клик по слайду:', index, slide, event.type)
})
```

## Состояние и адаптивность

- `resized`
- `breakpoint`
- `lock`
- `unlock`
- `disabled`
- `enabled`

```js
slider.on('lock', () => {
  root.querySelector('.js-arrows')?.classList.add('is-hide')
})
slider.on('unlock', () => {
  root.querySelector('.js-arrows')?.classList.remove('is-hide')
})
```

## Видимость

- `visible`
- `hidden`
- `sliderVisible`
- `sliderHidden`

```js
slider.on('sliderHidden', () => {
  console.log('Слайдер ушёл из viewport')
})
```

## Автопрокрутка

- `autoplayStart`
- `autoplayStop`
- `autoplayPause`
- `autoplayResume`
- `autoplayProgress` — прогресс **текущего** шага автопрокрутки: `progress` от 0 до 1 для активного слайда; при `waitForVideo: true` на слайде с `<video>` прогресс привязан к воспроизведению ролика (см. документацию к вашей версии пакета).
- `reachEnd` — автопрокрутка дошла до конца ленты без `loop` / `rewind` (удобно закрыть модалку или переключить внешний слайдер).

```js
slider.on('autoplayProgress', ({ progress, index }) => {
  console.log('autoplay', index, progress)
})
```

## Удержание (long press)

Требуется опция `holdToPause`.

- `longPressStart` — срабатывает после удержания дольше `holdToPause.threshold` (payload: `index`, `pointerType` — см. типы в документации пакета).
- `longPressEnd` — отпускание / отмена удержания.

На узле слайда при необходимости можно подписаться на нативные `CustomEvent` **без всплытия** к родителю: имена событий задаёт константа `TVIST_DOM_EVENTS` (экспорт из пакета `tvist` / из бандла платформы — уточните в документации к подключаемой сборке). Удобно во Vue/React, когда обработчик вешают прямо на разметку слайда.

```js
slider.on('longPressStart', ({ index, pointerType }) => {
  document.body.classList.add('story-hold')
})
slider.on('longPressEnd', ({ index, pointerType }) => {
  document.body.classList.remove('story-hold')
})
```

## Видео

- `videoReady`
- `videoPlay`
- `videoPause`
- `videoEnded`
- `videoProgress`

```js
slider.on('videoEnded', ({ index }) => {
  console.log('Видео завершилось на слайде', index)
})
```

## Lazy-load

- `lazyLoaded`
- `lazyLoadError`

```js
slider.on('lazyLoadError', (img, idx) => {
  console.warn('Ошибка загрузки', idx, img.dataset.src)
})
```

## Навигационные события модулей

- `navigation:mounted`
- `pagination:mounted`
- `navigation:click`

```js
slider.on('navigation:click', (index) => {
  console.log('Клик по thumbs:', index)
})
```

---

## 4) Свойства экземпляра

## Идентификация

### `id: string`
Уникальный ID инстанса.

```js
console.log(slider.id)
```

### `root.tvistInstance`
Ссылка на экземпляр через DOM-элемент.

```js
const root = document.querySelector('.js-slider')
const inst = root?.tvistInstance
inst?.next()
```

## DOM-доступ

### `root: HTMLElement`
Корневой элемент слайдера.

### `container: HTMLElement`
Контейнер слайдов (`.tvist-v1__container`).

### `slides: HTMLElement[]`
Массив слайдов.

```js
console.log(slider.root, slider.container, slider.slides.length)
```

## Состояние

### `activeIndex: number`
Текущий индекс активного слайда.

### `realIndex?: number`
Логический индекс (особенно полезен в `loop`).

### `canScrollNext: boolean`
Можно ли листать вперёд.

### `canScrollPrev: boolean`
Можно ли листать назад.

```js
if (slider.canScrollNext) slider.next()
```

## Конфиг и ядро

### `options: TvistOptions` (readonly)
Текущие опции (для изменения использовать `updateOptions()`).

### `engine: Engine`
Экземпляр ядра (для продвинутых сценариев).

```js
console.log(slider.options.perPage)
console.log(slider.engine.isLocked)
```

---

## 5) Статический API класса (дополнительно)

Это не методы экземпляра, а API класса `TvistV1`.

- `TvistV1.VERSION`
- `TvistV1.MODULES`
- `TvistV1.registerModule(name, ModuleClass)`
- `TvistV1.unregisterModule(name)`
- `TvistV1.getRegisteredModules()`

```js
console.log(TvistV1.VERSION)
```

---

## 6) Минимальные рабочие рецепты

## Адаптив через breakpoints

```js
new TvistV1('.js-slider', {
  perPage: 4,
  gap: 20,
  breakpoints: {
    1200: { perPage: 3, gap: 16 },
    768: { perPage: 1, gap: 8 }
  }
})
```

## Auto perPage через `slideMinSize`

```js
new TvistV1('.js-slider', {
  slideMinSize: 260,
  gap: 16
})
```

## Sync main + thumbs

```js
const main = new TvistV1('.js-main', { perPage: 1 })
const thumbs = new TvistV1('.js-thumbs', { perPage: 5, isNavigation: true })
main.sync(thumbs)
```

## Безопасный доступ к экземпляру

```js
const root = document.querySelector('.js-slider')
const slider = root?.tvistInstance || new TvistV1(root, { perPage: 1 })
```
