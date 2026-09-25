# Слайдеры

## Новый слайдер: `tvist-v1`

Handle загружает CSS и два JS-файла — ядро и модули. Глобальный конструктор — `TvistV1`; отдельного `.mount()` нет. На дату исследования подключаемые файлы объявляли **Tvist 1.16.11**, хотя запись каталога называлась `tvist@1.0.0`. Перед применением новых опций проверь текущую сборку через каталог магазина. Полный перечень методов — в [справочнике Tvist](../splide-to-tvist/tvist-reference.md); шаги переноса старого виджета — в [миграции](../splide-to-tvist/reference.md).

Пример основан на системном виджете `system_widget_v4_article_previews_2`: несколько экземпляров, разметка track → container → slide и реакция на изменения редактора. Его старый `info.json` использует `EventBus` без собственного `commonjs_v2`; ниже зависимость объявлена явно. Для самостоятельного виджета здесь нужны CSS `my-layout`, `$widget`/`$` из `jquery`, события `EventBus` из `commonjs_v2` и Tvist:

```json
{ "libraries": ["my-layout", "jquery", "commonjs_v2", "tvist-v1"] }
```

```liquid
<div class="tvist-v1 js-article-slider"
     data-slide-min-size="{{ widget_settings.slide-width | default: 220 }}"
     data-slide-gap="{{ widget_settings.slide-gap | default: 16 }}">
  <div class="tvist-v1__track">
    <div class="tvist-v1__container">
      {% for article in blogs[widget_settings.permalink_blog].articles limit: 8 %}
        <a class="tvist-v1__slide" href="{{ article.url }}">{{ article.title | escape }}</a>
      {% endfor %}
    </div>
  </div>
  <div class="tvist-v1__pagination"></div>
</div>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const sliderRoot = root.querySelector('.js-article-slider')
    if (!sliderRoot) return

    const slider = new TvistV1(sliderRoot, {
      slideMinSize: Number(sliderRoot.dataset.slideMinSize),
      gap: Number(sliderRoot.dataset.slideGap),
      pagination: { type: 'bullets', clickable: true }
    })

    const editorWidgetId = $(root).closest('.editable-widget').data('widgetId')
    EventBus.subscribe(
      ['widget:input-setting:insales:system:editor', 'widget:change-setting:insales:system:editor'],
      function (data) {
        if (String(data.widget_id) !== String(editorWidgetId)) return
        if (data.setting_name === 'slide-width') {
          slider.updateOptions({ slideMinSize: Number(data.value) })
        } else if (data.setting_name === 'slide-gap') {
          slider.updateOptions({ gap: Number(data.value) })
        }
      }
    )
  })
})
```

В редакторе при удалении или пересоздании экземпляра снимай свою подписку и вызывай `destroy()` для старого слайдера. Источники: подключаемые ядро и модули из каталога магазина, [публичная документация проекта](https://github.com/VladimirIvanin/tvist).

## Существующие Splide

`splide` подключает Splide **2.4.21**, `splide3` — **3.6.12**. Оба дают глобальный `Splide`, CSS и API `new Splide(root, options).mount()`. Некоторые старые виджеты объявляют оба handle: нельзя определить работающую версию только по строке в `info.json`; смотри порядок загрузки и конкретные вызовы в JS. Для нового виджета используй `tvist-v1`, если функциональность подходит; существующий Splide сохраняй или мигрируй по задаче.

`splide-grid` — расширение 0.1.2, используемое через `mount({ Grid: window.splide.Extensions.Grid })`; ему нужен базовый Splide. `splide-video` — расширение 0.6.3 с CSS, но **не опубликовано** в каталоге: встречается в старых системных виджетах, в новый тип его не добавляй. При миграции расширений проверяй поведение, разметку и медиа, а не только имя опции.

Источники: подключаемые JS/CSS из каталога магазина, [официальные руководства Splide v3](https://splidejs.com/v3/guides/getting-started/) и [Grid](https://splidejs.com/v3/extensions/grid/). Для Splide 2 и старых расширений проверяй документацию их версии и фактический подключаемый код.
