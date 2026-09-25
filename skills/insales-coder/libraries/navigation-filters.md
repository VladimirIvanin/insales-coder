# Меню и числовые фильтры

## `cut-list` — переполнение меню

Подключает JS и CSS, даёт глобальный `InsalesCutList`. Конструктор принимает jQuery-коллекцию и опции `moreBtnTitle`, `alwaysVisibleElem`, `showMoreOnHover`, `minWidth`; создаёт пункт «Ещё» для ссылок, которые не помещаются. У экземпляра есть `redrawList()` для пересчёта и `destroy()` для удаления обработчиков. В системных шапках меню ограничивают корнем виджета. Библиотека сама добавляет классы `cut-list__*` и следит за изменением размера.

```json
{ "libraries": ["jquery", "cut-list"] }
```

```liquid
<nav class="js-cut-list" aria-label="Разделы магазина">
  {% for link in linklists[widget_settings.menu-handle].links %}
    <a href="{{ link.url }}">{{ link.title | escape }}</a>
  {% endfor %}
</nav>
```

```js
$(function () {
  $widget.each(function (_, root) {
    new InsalesCutList($(root).find('.js-cut-list'), {
      moreBtnTitle: 'Ещё',
      showMoreOnHover: true,
      minWidth: 767
    })
  })
})
```

При динамической замене пунктов меню сохрани экземпляр и вызови `redrawList()`; не запускай второй конструктор над тем же DOM вслепую. API проверен по подключаемому файлу на дату исследования; актуальные JS/CSS смотри в каталоге магазина.

## `nouislider` — диапазон числового фильтра

Подключает JS и CSS 14.6.3, даёт глобальный `noUiSlider`. `noUiSlider.create(element, options)` добавляет API в `element.noUiSlider`; события `slide` и `set` различаются: `slide` обновляет видимые поля во время движения, `set` срабатывает после установки значения. В системных фильтрах поля цены сохраняют платформенные имена `price_min` и `price_max`; AJAX-фильтр и шаблоны формы описаны в [common.js](../commonjs-widget/ajax-components.md).

Короткий пример формы цены с демонстрационными границами 0–10000. В рабочем фильтре получай границы от его данных после инициализации, чтобы не отсечь товары магазина.

```json
{ "libraries": ["jquery", "nouislider"] }
```

```liquid
<form action="{{ collection.url }}" method="get" class="js-price-filter">
  <div class="js-price-slider" data-min="0" data-max="10000"></div>
  <label>От <input name="price_min" class="js-price-min" value="{{ price_min }}"></label>
  <label>До <input name="price_max" class="js-price-max" value="{{ price_max }}"></label>
  <button type="submit">Применить</button>
</form>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const form = root.querySelector('.js-price-filter')
    if (!form) return
    const slider = form.querySelector('.js-price-slider')
    const minInput = form.querySelector('.js-price-min')
    const maxInput = form.querySelector('.js-price-max')
    const min = Number(slider.dataset.min)
    const max = Number(slider.dataset.max)
    if (!(max > min)) return

    noUiSlider.create(slider, {
      start: [Number(minInput.value) || min, Number(maxInput.value) || max],
      range: { min, max },
      connect: true
    })

    function syncFields(values) {
      minInput.value = Math.floor(Number(values[0]))
      maxInput.value = Math.floor(Number(values[1]))
    }
    slider.noUiSlider.on('slide', syncFields)
    slider.noUiSlider.on('set', syncFields)
    minInput.addEventListener('change', function () {
      slider.noUiSlider.set([minInput.value, null])
    })
    maxInput.addEventListener('change', function () {
      slider.noUiSlider.set([null, maxInput.value])
    })
  })
})
```

Если диапазон фильтра перестроен AJAX-компонентом, уничтожь старый `element.noUiSlider` перед новой инициализацией. Источник API: [официальная документация и события](https://refreshless.com/nouislider/events-callbacks/); подключаемую версию проверяй в каталоге магазина.
