# Шаблоны кода: Splide → TvistV1

## 1. Базовый слайдер

### До (Splide v2)

```js
const splide = new Splide(sliderRoot, {
  type: 'loop',
  perPage: 3,
  gap: 16,
  autoplay: true,
  interval: 4000,
  pauseOnHover: true,
  arrows: true,
  pagination: true,
  breakpoints: {
    768: { perPage: 1, gap: 8 }
  }
})
splide.mount()
```

### После (TvistV1)

```js
const tvist = new TvistV1(sliderRoot, {
  loop: true,
  perPage: 3,
  gap: 16,
  autoplay: { delay: 4000, pauseOnHover: true },
  arrows: true,
  pagination: { type: 'bullets', clickable: true },
  breakpoints: {
    768: { perPage: 1, gap: 8 }
  }
})
```

**Liquid — добавить div пагинации:**

```html
<div class="tvist-v1">
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      {% for item in items %}
        <div class="tvist-v1__slide">...</div>
      {% endfor %}
    </div>
  </div>
  <div class="tvist-v1__pagination"></div>
</div>
```

---

## 2. Слайдер с кастомными стрелками и lock/unlock

### До (Splide)

```js
const splide = new Splide(root, { perPage: 3, gap: 16 })

splide.on('arrows:updated', (prev, next) => {
  if (!prev.disabled && !next.disabled) {
    arrowsWrap.classList.remove('is-hide')
  } else {
    arrowsWrap.classList.add('is-hide')
  }
})

// Ручные обработчики кликов
root.querySelectorAll('.js-move-slide').forEach(btn => {
  btn.addEventListener('click', () => {
    splide.go(btn.dataset.dir === 'prev' ? '-' : '+')
  })
})

splide.mount()
```

### После (TvistV1)

```js
const prevBtn = root.querySelector('.js-arrow-prev')
const nextBtn = root.querySelector('.js-arrow-next')
const arrowsWrap = root.querySelector('.js-arrows-wrap')

const tvist = new TvistV1(root, {
  perPage: 3,
  gap: 16,
  arrows: { prev: prevBtn, next: nextBtn }
})

// Tvist сам вешает обработчики на стрелки — ручные клики не нужны

tvist.on('created', (t) => {
  if (t.engine.isLocked) arrowsWrap.classList.add('is-hide')
})
tvist.on('lock', () => {
  arrowsWrap.classList.add('is-hide')
})
tvist.on('unlock', () => {
  arrowsWrap.classList.remove('is-hide')
})
```

**Liquid — стрелки без js-move-slide:**

```html
<div class="js-arrows-wrap">
  <button class="js-arrow-prev">←</button>
  <button class="js-arrow-next">→</button>
</div>
<div class="tvist-v1">
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      <div class="tvist-v1__slide">...</div>
    </div>
  </div>
</div>
```

---

## 3. Слайдер с динамическим perPage (slideMinSize)

### До (Splide)

```js
function getSlidesPerView(containerWidth, slideMinWidth, gap) {
  let count = 1
  while ((count + 1) * slideMinWidth + count * gap <= containerWidth) count++
  return count
}

let splide = new Splide(root, {
  perPage: getSlidesPerView(root.offsetWidth, 280, 16),
  gap: 16
})
splide.mount()

window.addEventListener('resize', () => {
  splide.options = { perPage: getSlidesPerView(root.offsetWidth, 280, 16) }
})
```

### После (TvistV1)

```js
const slideMinWidth = parseInt(root.dataset.slideMinWidth) || 280
const gap = parseInt(root.dataset.slideGap) || 16

const tvist = new TvistV1(root, {
  slideMinSize: slideMinWidth,
  gap: gap
})
// Tvist сам пересчитывает perPage при resize
```

**При обновлении из редактора:**

```js
function updateSlider(changedKey, newValue) {
  const inst = root.tvistInstance
  if (!inst) return

  if (changedKey === 'slide-min-width') {
    inst.updateOptions({ slideMinSize: parseInt(newValue) })
  } else if (changedKey === 'slide-gap') {
    inst.updateOptions({ gap: parseInt(newValue) })
  } else {
    inst.update()
  }
}
```

---

## 4. Sync-пара (gallery + thumbnails)

### До (Splide v3)

```js
const primary = new Splide('.js-gallery-main', {
  type: 'fade',
  perPage: 1,
  arrows: false,
  pagination: false
})

const thumbnails = new Splide('.js-gallery-thumbs', {
  perPage: 5,
  gap: 8,
  isNavigation: true,
  arrows: false,
  pagination: false
})

primary.sync(thumbnails).mount()
```

### После (TvistV1)

```js
const primary = new TvistV1(root.querySelector('.js-gallery-main'), {
  effect: 'fade',
  perPage: 1,
  arrows: false,
  pagination: false
})

const thumbnails = new TvistV1(root.querySelector('.js-gallery-thumbs'), {
  perPage: 5,
  gap: 8,
  isNavigation: true,
  arrows: false,
  pagination: false
})

primary.sync(thumbnails)
```

---

## 5. Editor flow: destroy + reinit

### До (Splide)

```js
let splide = null

function initSlider() {
  if (splide) splide.destroy()
  splide = new Splide(root, getOptions()).mount()
}

EventBus.subscribe('widget-editor-updated', (data) => {
  if (data.key === 'type') {
    initSlider() // полный пересоздание при смене типа
  } else {
    splide.options = { [data.key]: data.value }
    splide.refresh()
  }
})
```

### После (TvistV1)

```js
let tvist = null

function initSlider() {
  if (tvist) tvist.destroy()
  tvist = new TvistV1(root, getOptions())
}

EventBus.subscribe('widget-editor-updated', (data) => {
  if (!tvist) return

  // Предпочитать updateOptions вместо destroy/reinit
  if (data.key === 'effect' || data.key === 'loop') {
    // Эти опции требуют пересоздания
    initSlider()
  } else {
    tvist.updateOptions({ [data.key]: data.value })
  }
})
```

---

## 6. Слайдер с пагинацией и кастомным disabledClass

Используется когда тема уже имеет стили для `is-disabled` (не хочется менять SCSS).

```js
const tvist = new TvistV1(root, {
  perPage: 3,
  gap: 16,
  arrows: {
    prev: root.querySelector('.js-arrow-prev'),
    next: root.querySelector('.js-arrow-next'),
    disabledClass: 'is-disabled'  // сохраняем совместимость с темой
  },
  pagination: {
    type: 'bullets',
    clickable: true
  }
})
```

---

## 7. Слайдер с Grid (многорядный)

### До (Splide + Grid extension)

```js
new Splide(root, {
  perPage: 3,
  gap: 16,
  grid: {
    rows: 2,
    cols: 3,
    gap: { row: '16px', col: '16px' }
  }
}).mount({ Grid: window.splide.Extensions.Grid })
```

### После (TvistV1)

```js
new TvistV1(root, {
  grid: {
    rows: 2,
    cols: 3,
    gap: '16px'
  }
})
```

---

## 8. Отключение слайдера на десктопе

### До (Splide)

```js
new Splide(root, {
  perPage: 1,
  breakpoints: {
    1024: { destroy: true }
  }
}).mount()
```

### После (TvistV1)

```js
new TvistV1(root, {
  // По умолчанию (десктоп) — отключён
  enabled: false,
  perPage: 1,
  pagination: true,
  drag: true,
  // На мобильных — включён
  breakpoints: {
    1024: { enabled: true }
  }
})
```

---

## 9. Подписка на события — типовые паттерны

```js
const tvist = new TvistV1(root, { ... })

// Аналог Splide 'mounted'
tvist.on('created', (t) => {
  // инициализация дополнительной логики
  syncExternalUI(t.activeIndex)
})

// Аналог Splide 'move'
tvist.on('slideChangeStart', (index) => {
  updateCounter(index)
})

// Аналог Splide 'moved'
tvist.on('slideChangeEnd', (index) => {
  lazyLoadNext(index)
})

// Аналог Splide 'mounted updated' (одной строкой)
tvist.on('created', handler)
tvist.on('optionsUpdated', handler)

// Аналог Splide 'resized'
tvist.on('resized', () => {
  recalcLayout()
})
```

---

## 10. Полный шаблон виджета (Liquid + JS + SCSS)

### snippet.liquid

```html
<div
  class="my-slider tvist-v1"
  data-slide-gap="{{ widget_settings.slide-gap | default: 16 }}"
  data-slide-min-width="{{ widget_settings.slide-width | default: 280 }}"
>
  <div class="my-slider__arrows js-arrows-wrap">
    <button class="my-slider__arrow my-slider__arrow--prev js-arrow-prev">←</button>
    <button class="my-slider__arrow my-slider__arrow--next js-arrow-next">→</button>
  </div>
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      {% for item in items %}
        <div class="tvist-v1__slide">
          <!-- контент слайда -->
        </div>
      {% endfor %}
    </div>
  </div>
  <div class="tvist-v1__pagination"></div>
</div>
```

### snippet.js

```js
function initMySlider(root) {
  const gap = parseInt(root.dataset.slideGap) || 16
  const slideMinWidth = parseInt(root.dataset.slideMinWidth) || 280
  const prevBtn = root.querySelector('.js-arrow-prev')
  const nextBtn = root.querySelector('.js-arrow-next')
  const arrowsWrap = root.querySelector('.js-arrows-wrap')

  const tvist = new TvistV1(root, {
    slideMinSize: slideMinWidth,
    gap: gap,
    arrows: { prev: prevBtn, next: nextBtn },
    pagination: { type: 'bullets', clickable: true }
  })

  tvist.on('created', (t) => {
    if (t.engine.isLocked) arrowsWrap.classList.add('is-hide')
  })
  tvist.on('lock', () => arrowsWrap.classList.add('is-hide'))
  tvist.on('unlock', () => arrowsWrap.classList.remove('is-hide'))

  return tvist
}

// Инициализация
document.querySelectorAll('.my-slider').forEach(initMySlider)
```

### snippet.scss

```scss
.my-slider {
  position: relative;

  &__arrows {
    display: flex;
    gap: 8px;

    &.is-hide {
      display: none;
    }
  }

  &__arrow {
    // стили стрелок

    &.tvist-v1__arrow--disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }
}

// Пагинация
.tvist-v1__bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  cursor: pointer;

  &--active {
    background: #333;
  }
}
```
