# Изображения и отложенная загрузка

## `vanilla-lazyload` — загрузка медиа при появлении

Подключает JS 17.9.0 и глобальный `LazyLoad`; собственного CSS нет. `container` и `elements_selector` ограничивают поиск конкретным экземпляром виджета. После добавления карточек в этот контейнер вызывай `update()` на сохранённом экземпляре, а при его удалении — `destroy()`. Системные каталоги и меню используют тот же принцип; ниже `jquery` объявлен явно, даже если старый виджет работал без него в своём `info.json`.

```json
{ "libraries": ["jquery", "vanilla-lazyload"] }
```

```liquid
<div class="js-products">
  {% for item in collection.products limit: 12 %}
    <img class="lazyload" data-src="{{ item.first_image.large_url }}"
         alt="{{ item.title | escape }}">
  {% endfor %}
</div>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const lazy = new LazyLoad({
      container: root,
      elements_selector: '.lazyload'
    })

    // В обработчике, который добавил карточки внутрь root:
    root.addEventListener('products:inserted', function () { lazy.update() })
  })
})
```

`products:inserted` здесь — событие **самого примера**, которое должен отправить код добавления карточек; это не событие платформы. Можно вызвать `lazy.update()` напрямую после вставки DOM. Источник API: [документация и методы](https://github.com/verlok/vanilla-lazyload); подключаемую версию проверяй в каталоге магазина.

## `fslightbox` — просмотр изображений и видео

Подключает JS 3.4.1 и обрабатывает ссылки с `data-fslightbox`. Одинаковое значение атрибута объединяет ссылки в галерею. После изменения набора ссылок вызывай глобальную `refreshFsLightbox()`. В товарных виджетах ссылки заменяются при смене варианта; имя галереи должно отличаться у разных экземпляров.

```json
{ "libraries": ["jquery", "commonjs_v2", "fslightbox"] }
```

```liquid
<div class="js-gallery"></div>
<div class="js-gallery-source" hidden>
  {% for image in product.images %}
    <a data-image-id="{{ image.id }}" href="{{ image.original_url }}">
      <img src="{{ image.large_url }}" alt="{{ product.title | escape }}">
    </a>
  {% endfor %}
</div>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const gallery = root.querySelector('.js-gallery')
    const source = root.querySelector('.js-gallery-source')
    if (!gallery || !source) return

    const group = `product-photos-${root.dataset.widgetDropItemId}`
    const originals = [...source.querySelectorAll('a[data-image-id]')]

    function showPhotos(imageIds) {
      const ids = new Set((imageIds || []).map(String))
      const shown = ids.size
        ? originals.filter(link => ids.has(link.dataset.imageId))
        : originals
      gallery.replaceChildren(...shown.map(link => {
        const clone = link.cloneNode(true)
        clone.dataset.fslightbox = group
        return clone
      }))
      refreshFsLightbox()
    }

    showPhotos()
    EventBus.subscribe('change_variant:insales:product', function (data) {
      const productRoot = data.action && data.action.product && data.action.product[0]
      if (!productRoot || !root.contains(productRoot)) return
      showPhotos(data.image_ids)
    })
  })
})
```

Для реальной галереи согласуй набор фото с логикой товара: у варианта могут быть общие и собственные изображения. Источник API: [официальная документация](https://fslightbox.com/javascript/documentation/how-to-use); подключаемую версию проверяй в каталоге магазина.
