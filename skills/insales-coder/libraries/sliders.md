# Слайдеры

Для создания готового виджета начни с [полного пакета слайдера контента](../widget-architecture/slider-content.md). Ниже — контракт библиотеки и отдельные приёмы адаптации.

## Новый слайдер: `tvist-v1`

Handle загружает CSS и два JS-файла — ядро и модули. Глобальный конструктор — `TvistV1`; отдельного `.mount()` нет. На дату исследования подключаемые файлы объявляли **Tvist 1.16.11**, хотя запись каталога называлась `tvist@1.0.0`. Перед применением новых опций проверь доступный исходник подключаемой сборки, а при доступе к магазину — её актуальную запись каталога. Полный перечень методов — в [справочнике Tvist](../splide-to-tvist/tvist-reference.md); шаги переноса старого виджета — в [миграции](../splide-to-tvist/reference.md).

**Разметка — часть API Tvist.** Сохраняй вложенность `.tvist-v1` → `.tvist-v1__track` → `.tvist-v1__container` → `.tvist-v1__slide`. Свои классы оформления добавляй рядом: `class="tvist-v1__track advantages__track"`. Замена штатных классов без явной поддерживаемой настройки селекторов ломает конструктор (`track not found`); произвольный стиль не отменяет контракт библиотеки.

«Три карточки на desktop, одна на mobile» задаёт число **видимых** слайдов (`perPage`), а не обязательно размер всего списка. Ниже один цельный пример инициализации: сохраняй его lifecycle при адаптации разметки.

При нескольких экземплярах передавай стрелки как DOM-элементы своего виджета. Строковые `prev`/`next` в этой сборке ищутся через `document.querySelector` и могут связать все экземпляры с первой парой кнопок:

```js
arrows: {
  prev: root.querySelector('.js-slider-prev'),
  next: root.querySelector('.js-slider-next')
}
```

Сами кнопки должны присутствовать в разметке; конструктор не создаёт отсутствующие кастомные элементы. Условие «заголовок заполнен» должно скрывать только заголовок, сохраняя стрелки для ленты. Область поиска `pagination.container` зависит от сборки; для независимости также передавай найденный внутри экземпляра DOM-элемент.

Для редактируемого списка карточек выбирай BlockList и совместимый шаблон блоков; [готовый вариант content-карточки](../widget-architecture/reference.md#блоки-схема-шаблона-и-defaults) не требует выдуманных `block.link` или других полей. Фиксированные поля `card-1`, `card-2`, `card-3` подходят, когда задача требует именно фиксированные слоты. Сохраняй доступ к остальным карточкам и обработку короткого/пустого списка.

`Number()` подходит для числового `data-slide-gap="20"`, но не для CSS-значения `20px`. Для пиксельной CSS-переменной:

```js
const rawGap = parseFloat(getComputedStyle(root).getPropertyValue('--card-gap'))
const gap = Number.isFinite(rawGap) ? rawGap : 20
```

Так сохраняется и допустимый нулевой отступ. Для `rem`, `%` и других единиц одного `parseFloat` недостаточно: приведи значение к требуемым библиотекой пикселям либо передавай отдельное числовое значение.

## Цельный пример слайдера

Для этого примера объяви `jquery` и `tvist-v1` в `libraries`; `my-layout` добавь, если используешь его layout-классы. Данные `data.blocks` предполагают BlockList и схему `content` из примера архитектуры. Оформление выбирай по задаче.

```liquid
<div class="slider-heading">
  {% if widget_settings.title != blank %}
    <h2>{{ widget_settings.title | escape }}</h2>
  {% endif %}
  <button class="tvist-v1__arrow js-slider-prev" type="button" aria-label="Назад">←</button>
  <button class="tvist-v1__arrow js-slider-next" type="button" aria-label="Вперёд">→</button>
</div>
<div class="tvist-v1 js-cards-slider"
     data-slide-gap="{{ widget_settings.slide-gap | default: 20 }}">
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      {% for block in data.blocks %}
        <article class="tvist-v1__slide">{{ block.content }}</article>
      {% endfor %}
    </div>
  </div>
</div>
```

Подписи кнопок также вынеси в messages/настройки готового пакета.

```js
$(function () {
  $widget.each(function (_, root) {
    const cleanupKey = '__cardsSliderCleanup'
    if (root[cleanupKey]) root[cleanupKey]()
    const sliderRoot = root.querySelector('.js-cards-slider')
    if (!sliderRoot || !sliderRoot.querySelector('.tvist-v1__slide')) return

    const rawGap = Number(sliderRoot.dataset.slideGap)
    const slider = new TvistV1(sliderRoot, {
      perPage: 3,
      gap: Number.isFinite(rawGap) ? rawGap : 20,
      breakpoints: { 767: { perPage: 1 } },
      arrows: {
        prev: root.querySelector('.js-slider-prev'),
        next: root.querySelector('.js-slider-next'),
        hideWhenSinglePage: true
      }
    })
    let active = true
    function destroy() {
      if (!active) return
      active = false
      observer.disconnect()
      slider.destroy()
      delete root[cleanupKey]
    }
    const observer = new MutationObserver(function () {
      if (!root.isConnected || !root.contains(sliderRoot)) destroy()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    root[cleanupKey] = destroy
  })
})
```

Хранения функции на `root[cleanupKey]` **недостаточно для удаления**: её должен вызвать владелец или observer, как здесь. Для новой разметки снова нужен запуск initializer. Если владелец предоставляет teardown, используй его вместо observer; не убирай observer без подключения этого teardown. Проверь два запуска, затем удаление одного из двух экземпляров: старый слайдер уничтожен, соседний работает. Полный контракт, включая собственные EventBus-подписки редактора, — в [runtime.md](../widget-architecture/runtime.md); при использовании EventBus добавь `commonjs_v2` и сними свою подписку в destroy.

Исходный API: подключаемые ядро и модули из каталога магазина, [документация Tvist](https://github.com/VladimirIvanin/tvist). Без доступной сборки укажи, что совместимость с целевым runtime ещё не проверена.

Подмена `TvistV1` заглушкой проверяет вызовы твоего кода, но не обязательные классы, область селекторов стрелок или свайп настоящей библиотеки.

## Существующие Splide

`splide` подключает Splide **2.4.21**, `splide3` — **3.6.12**. Оба дают глобальный `Splide`, CSS и API `new Splide(root, options).mount()`. Некоторые старые виджеты объявляют оба handle: нельзя определить работающую версию только по строке в `info.json`; смотри порядок загрузки и конкретные вызовы в JS. Для нового виджета используй `tvist-v1`, если функциональность подходит; существующий Splide сохраняй или мигрируй по задаче.

`splide-grid` — расширение 0.1.2, используемое через `mount({ Grid: window.splide.Extensions.Grid })`; ему нужен базовый Splide. `splide-video` — расширение 0.6.3 с CSS, но **не опубликовано** в каталоге: встречается в старых системных виджетах, в новый тип его не добавляй. При миграции расширений проверяй поведение, разметку и медиа, а не только имя опции.

Источники: подключаемые JS/CSS из каталога магазина, [официальные руководства Splide v3](https://splidejs.com/v3/guides/getting-started/) и [Grid](https://splidejs.com/v3/extensions/grid/). Для Splide 2 и старых расширений проверяй документацию их версии и фактический подключаемый код.
