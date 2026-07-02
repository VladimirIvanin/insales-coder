# Ajax-компоненты: ui-ajax-products, ui-ajax-product, AJAX-фильтры

---

## ui-ajax-products — список товаров из категории

### Структура корневых элементов

```liquid
<div data-ajax-products>
  <div data-ajax-products-list='{ ... настройки ... }'></div>

  <!-- Все шаблоны ОБЯЗАТЕЛЬНО внутри data-ajax-products -->
  <template data-ajax-products-list-item-template>...</template>
  <template data-ajax-products-list-item-image-template>...</template>
  <!-- необязательные: -->
  <template data-ajax-products-list-item-option-values-images-item-template>...</template>
  <template data-ajax-products-list-item-option-values-item-text-template>...</template>
</div>
```

### Настройки data-ajax-products-list

```liquid
<div data-ajax-products-list='{
  "collection": "my-collection",
  "limit": "20",
  "imageResizingRules": [
    {"size":"1000", "format":"webp", "resizing_type":"fit_width", "quality":"100"},
    {"size":"500",  "format":"webp", "resizing_type":"fit_width", "quality":"100"},
    {"size":"1000", "resizing_type":"fit_width", "quality":"100"}
  ],
  "switchImages": "false",
  "withoutManyVariants": "true",
  "hideVariants": "false",
  "shortDescriptionWordsCount": "10"
}'></div>
```

| Параметр | Описание |
|---|---|
| `collection` | handle категории, из которой нужно получить товары |
| `limit` | Максимальное количество товаров |
| `imageResizingRules` | Массив правил ресайза изображений. Индекс в массиве соответствует `data-ajax-products-image-resizing-rules-index` в шаблоне |
| `switchImages` | `"true"` — загружать первые два изображения (для hover-эффекта), `"false"` — только первое |
| `withoutManyVariants` | `"true"` — товары с большим кол-вом вариантов загружаются только с одним вариантом. Рекомендуется если нет селектора вариантов |
| `hideVariants` | `"true"` — не загружать варианты вообще |
| `shortDescriptionWordsCount` | Ограничение количества слов в кратком описании |

**CSS-классы на `[data-ajax-products-list]`:**
- `ajax-products-is-loading` — во время загрузки
- `ajax-products-is-init` — после загрузки и отрисовки

### Инициализация

Компонент **не инициализируется автоматически** — нужно опубликовать событие:

```js
const productListNodes = Array.from(document.querySelectorAll('[data-ajax-products-list]'))
if (productListNodes.length) {
  productListNodes.forEach(node => {
    EventBus.publish('ui-ajax-products:load-products-list', node)
  })
}
```

После загрузки и отрисовки публикуется `init-products:ui-ajax-products`:

```js
EventBus.subscribe('init-products:ui-ajax-products', function(data) {
  // data.productsListNode — DOM-узел [data-ajax-products-list]
  FavoritesProducts.update()
  Compare.update()
  new LazyLoad({ container: data.productsListNode, elements_selector: '.lazyload' })
})
```

---

### Шаблон превью товара: data-ajax-products-list-item-template

Основной шаблон. Корневой элемент — `data-ajax-products-list-item`, внутри обязательно `data-ajax-products-list-item-form`.

#### Атрибуты внутри data-ajax-products-list-item-form

| Атрибут | Что делает |
|---|---|
| `data-ajax-products-list-item-title` | Записывает название товара в `textContent` |
| `data-ajax-products-list-item-link` | Добавляет `href` со ссылкой на товар |
| `data-ajax-products-list-item-image` | Место для рендера шаблона изображения (`data-ajax-products-list-item-image-template`) |
| `data-ajax-products-list-item-short-description` | Выводит краткое описание товара |
| `data-ajax-products-list-item-price-min` | Минимальная цена товара |
| `data-ajax-products-list-item-price-max` | Максимальная цена товара |
| `data-ajax-products-list-item-zero-price-text="..."` | Текст если цена = 0. Ставится на тот же элемент что и `price-min` |
| `data-ajax-products-list-item-stickers` | Блок для стикеров. Внутри можно использовать `data-product-card-sale-value` и свои стикеры. Требует `properties` + `characteristics` в productData |
| `data-ajax-products-list-item-add-cart` | Удаляет блок из разметки если товара нет в наличии и в магазине запрещён заказ сверх остатка |
| `data-ajax-products-list-item-variants-select-block='{"default":"option-radio","Цвет":"option-preview"}'` | Селектор вариантов. Вид отображения задаётся здесь, а не в `data-product-variants` |
| `data-ajax-products-list-item-option-values='{"imagesOptionNames":"цвет,color","showVariantsText":"false"}'` | Вывод значений свойств в виде картинок/текста. Нужен вложенный `data-ajax-products-list-item-option-values-images` |
| `data-ajax-products-list-item-favorites-trigger` | Ставится вместе с `data-ui-favorites-trigger`. После загрузки обязательно вызвать `FavoritesProducts.update()` |
| `data-ajax-products-list-item-compare-trigger` | Ставится вместе с `data-compare-trigger`. После загрузки обязательно вызвать `Compare.update()` |

**CSS-классы на `[data-ajax-products-list-item-form]`:**

| Класс | Условие |
|---|---|
| `with-old-price` / `without-old-price` | Есть/нет старая цена |
| `with-sku` / `without-sku` | Есть/нет артикул |
| `is-available` / `not-available` | Есть/нет в наличии |
| `with-sale-value` | Цена продажи ниже старой |
| `ajax-products-list-item-has-many-variants` | Больше одного варианта с заданным свойством |
| `ajax-products-list-item-has-many-sale-prices` | Разные цены продажи у вариантов |
| `ajax-products-list-item-has-many-old-prices` | Разные старые цены у вариантов |
| `ajax-products-list-item-is-bundle` | Товар является комплектом |

**CSS-классы на `[data-ajax-products-list-item-option-values]`:**

| Класс | Условие |
|---|---|
| `ajax-products-list-item-option-list-values-colors` | У варианта нет изображения для свойства-цвета |
| `ajax-products-list-item-option-images-values-first` | Свойство с картинками имеет минимальную позицию |
| `ajax-products-list-item-option-images-values-last` | Свойство с картинками имеет максимальную позицию |
| `ajax-products-list-item-option-list-values` | Каждый блок с текстовыми значениями свойств |

Пример шаблона превью:

```liquid
<template data-ajax-products-list-item-template>
  <div data-ajax-products-list-item>
    <form action="{{ cart_url }}" method="post" data-ajax-products-list-item-form>

      <div data-ajax-products-list-item-stickers>
        <div data-product-card-sale-value></div>
      </div>

      <div data-ajax-products-list-item-image></div>

      <a data-ajax-products-list-item-link data-ajax-products-list-item-title></a>

      <div data-ajax-products-list-item-short-description></div>

      <span data-ajax-products-list-item-price-min
            data-ajax-products-list-item-zero-price-text="Цена по запросу"></span>
      <span data-product-card-price-from-cart
            data-product-card-zero-price-text="Цена по запросу"></span>
      <span data-product-card-old-price></span>

      <div data-ajax-products-list-item-variants-select-block='{
        "default": "option-radio",
        "Цвет": "{{ widget_settings.display-property-color }}"
      }'>
        <select name="variant_id" data-product-variants></select>
      </div>

      <div data-ajax-products-list-item-add-cart>
        <div data-add-cart-counter='{"step": "1"}'>
          <button type="button" data-add-cart-counter-btn>В корзину</button>
          <div>
            <button type="button" data-add-cart-counter-minus>-</button>
            <span data-add-cart-counter-count></span>
            <button type="button" data-add-cart-counter-plus>+</button>
          </div>
        </div>
      </div>

      <div data-ajax-products-list-item-option-values='{
        "imagesOptionNames": "цвет,color,расцветка",
        "showVariantsText": "false"
      }'>
        <div data-ajax-products-list-item-option-values-images></div>
      </div>

      {% if settings.favorite_enabled %}
        <span data-ui-favorites-trigger data-ajax-products-list-item-favorites-trigger></span>
      {% endif %}

      {% if settings.compare_enabled %}
        <span data-compare-trigger data-ajax-products-list-item-compare-trigger></span>
      {% endif %}

    </form>
  </div>
</template>
```

---

### Шаблон изображения: data-ajax-products-list-item-image-template

Рендерится в место с `data-ajax-products-list-item-image`.

| Атрибут | Что делает |
|---|---|
| `data-ajax-products-list-item-picture` | Корневой элемент шаблона (обычно `<picture>`) |
| `data-ajax-products-image-resizing-rules-index="N"` | Индекс правила из массива `imageResizingRules`. Ставится на `<source>` и `<img>`. Без атрибута — оригинальный размер |

```liquid
<template data-ajax-products-list-item-image-template>
  <picture data-ajax-products-list-item-picture>
    <source media="(min-width:481px)"
            data-ajax-products-image-resizing-rules-index="0"
            type="image/webp" class="lazyload">
    <source media="(max-width:480px)"
            data-ajax-products-image-resizing-rules-index="1"
            type="image/webp" class="lazyload">
    <img data-ajax-products-image-resizing-rules-index="2" class="lazyload">
  </picture>
</template>
```

---

### Шаблон значений свойств в виде изображений: data-ajax-products-list-item-option-values-images-item-template

Необязательный. Рендерится внутри `data-ajax-products-list-item-option-values-images`.

| Атрибут | Что делает |
|---|---|
| `data-ajax-products-list-item-option-values-images-item` | Корневой элемент шаблона |
| `data-ajax-products-list-item-option-values-images-item-img` | Устанавливает `src` на `<img>` — ссылка на изображение варианта |

```liquid
<template data-ajax-products-list-item-option-values-images-item-template>
  <div data-ajax-products-list-item-option-values-images-item>
    <img data-ajax-products-list-item-option-values-images-item-img>
  </div>
</template>
```

---

### Шаблон значений свойств в виде текста: data-ajax-products-list-item-option-values-item-text-template

Необязательный. Текстовые значения автоматически добавляются в `data-ajax-products-list-item-option-values`.

| Атрибут | Что делает |
|---|---|
| `data-ajax-products-list-item-option-values-item-text` | Записывает название значения свойства в `textContent` |
| `data-ajax-products-list-item-option-values-item-id` | Записывает ID значения свойства в атрибут |

```liquid
<template data-ajax-products-list-item-option-values-item-text-template>
  <div data-ajax-products-list-item-option-values-item-text
       data-ajax-products-list-item-option-values-item-id></div>
</template>
```

---

## ui-ajax-product — один товар по ID

### Настройки data-ajax-product

```liquid
<div data-ajax-product='{
  "productId": "{{ product.id }}",
  "productData": ["variants", "short_description", "price_kinds", "first_image", "images",
                  "properties", "characteristics", "option_names", "bundle_info", "video_links"],
  "initOnLoadPage": "true",
  "imageResizingRules": [
    {"size":"1000", "format":"webp", "resizing_type":"fit_width", "quality":"100"},
    {"size":"500",  "format":"webp", "resizing_type":"fit_width", "quality":"100"},
    {"size":"1000", "resizing_type":"fit_width", "quality":"100"}
  ],
  "videoBeforeImage": "false",
  "videoLinksDetails": "true"
}'>
  <!-- шаблоны -->
</div>
```

| Параметр | Описание |
|---|---|
| `productId` | ID товара в InSales |
| `productData` | Массив строк — какие данные запросить (см. таблицу ниже) |
| `initOnLoadPage` | `"true"` — инициализировать автоматически после `DOMContentLoaded`. `"false"` — только через JS |
| `imageResizingRules` | Правила ресайза. Индекс соответствует `data-ajax-product-image-resizing-rules-index` |
| `videoBeforeImage` | `"true"` — видео выводятся до изображений в галерее |
| `videoLinksDetails` | `"true"` — загружать детали видео (iframe, превью). Рекомендуется всегда `true` |

**productData — что передавать:**

| Значение | Что даёт | Нужно для |
|---|---|---|
| `variants` | Варианты товара | Селектор вариантов |
| `first_image` | Первое изображение | Минимальная карточка |
| `images` | Все изображения | Галерея, шаблон `one-photo` |
| `video_links` | Ссылки на видео | Галерея с видео |
| `short_description` | Краткое описание | Шаблон `short-description` |
| `description` | Полное описание | Шаблон `full-description` |
| `price_kinds` | Типы цен | Отображение типов цен |
| `properties` | Параметры товара | Стикеры `label`, таблица параметров |
| `characteristics` | Значения параметров | Вместе с `properties` |
| `option_names` | Названия свойств вариантов | Селектор вариантов |
| `bundle_info` | Информация о комплекте | Шаблон компонентов комплекта |

По умолчанию (без `productData`): название, URL, наличие, единицы измерения, мин/макс цена.

**CSS-классы на `[data-ajax-product]`:**
- `ajax-product-is-loading` — во время загрузки
- `ajax-product-is-init` — после загрузки и отрисовки

### Инициализация через JS (для модалки)

```js
const node = document.querySelector('[data-ajax-product]')
node.dataset.ajaxProduct = JSON.stringify({
  productId: productId,
  productData: ['variants', 'images', 'short_description', 'price_kinds',
                'first_image', 'properties', 'characteristics', 'option_names'],
  initOnLoadPage: false,
  imageResizingRules: [
    { size: 1000, format: 'webp', resizing_type: 'fit_width', quality: 100 },
    { size: 500,  format: 'webp', resizing_type: 'fit_width', quality: 100 },
    { size: 1000, resizing_type: 'fit_width', quality: 100 }
  ],
  videoBeforeImage: false,
  videoLinksDetails: true
})
EventBus.publish('ui-ajax-product:load-product', node)
```

После загрузки публикуется `init-product:ui-ajax-product`:

```js
EventBus.subscribe('init-product:ui-ajax-product', function(data) {
  FavoritesProducts.update()
  Compare.update()
  // инициализация галереи
})
```

---

### Шаблон карточки товара: data-ajax-product-template

Основной шаблон. Внутри обязательно `data-ajax-product-form`.

#### Атрибуты внутри data-ajax-product-form

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-title` | Записывает название товара в `textContent` |
| `data-ajax-product-link` | Добавляет `href` со ссылкой на товар |
| `data-ajax-product-unit` | Записывает единицы измерения в `textContent` |
| `data-ajax-product-stickers` | Блок для стикеров. Внутри можно `data-product-card-sale-value`. Требует `properties` + `characteristics` |
| `data-ajax-product-gallery` | Место для рендера шаблона галереи (`data-ajax-product-gallery-template`). Используется если > 1 изображения или есть видео |
| `data-ajax-product-one-photo` | Место для рендера шаблона единственного фото (`data-ajax-product-one-photo-template`). Требует `images` в productData |
| `data-ajax-product-variants-select-block='{"default":"option-radio","Цвет":"option-preview"}'` | Селектор вариантов. Требует `variants` в productData |
| `data-ajax-product-short-description` | Место для рендера шаблона краткого описания. Требует `short_description` |
| `data-ajax-product-full-description` | Место для рендера шаблона полного описания. Требует `description` |
| `data-ajax-product-properties='{"maxCount":"100","maxVisibleItemsCount":"5","excludeHandles":"label"}'` | Место для рендера шаблона параметров. Требует `properties` + `characteristics` |
| `data-ajax-product-add-cart` | Удаляет блок если товара нет в наличии и запрещён заказ сверх остатка |
| `data-ajax-product-sizes-table-btn="Размер,Size"` | Удаляет блок если у товара нет варианта со свойством из списка (кроме комплектов) |
| `data-ajax-product-bundle-discount` | Выводит скидку на комплект (если товар — комплект с скидкой) |
| `data-ajax-product-bundle-components` | Место для рендера шаблона компонентов комплекта. Требует `bundle_info` |
| `data-ajax-product-favorites-trigger` | Ставится вместе с `data-ui-favorites-trigger`. После загрузки вызвать `FavoritesProducts.update()` |
| `data-ajax-product-compare-trigger` | Ставится вместе с `data-compare-trigger`. После загрузки вызвать `Compare.update()` |

**CSS-классы на `[data-ajax-product-form]`:**

| Класс | Условие |
|---|---|
| `with-old-price` / `without-old-price` | Есть/нет старая цена |
| `with-sku` / `without-sku` | Есть/нет артикул |
| `is-available` / `not-available` | Есть/нет в наличии |
| `with-sale-value` | Цена продажи ниже старой |
| `ajax-product-has-many-variants` | Больше одного варианта с заданным свойством |
| `ajax-product-has-many-sale-prices` | Разные цены продажи у вариантов |
| `ajax-product-has-many-old-prices` | Разные старые цены у вариантов |
| `ajax-product-is-bundle` | Товар является комплектом |
| `ajax-product-gallery-video-before-image` | `videoBeforeImage: true` передан в productData |

---

### Шаблон галереи: data-ajax-product-gallery-template

Используется если у товара > 1 изображения или есть видео. Требует `images` и `video_links` в productData.

В шаблоне до 6 блоков разных типов:

#### data-ajax-product-gallery-image-item — основное изображение

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-image-link` | Добавляет `href` со ссылкой на изображение |
| `data-ajax-product-image-id` | Добавляет `id` с идентификатором изображения |
| `data-ajax-product-image-resizing-rules-index="N"` | Индекс правила из `imageResizingRules`. На `<source>` и `<img>` |

#### data-ajax-product-gallery-thumb-image-item — миниатюра изображения

Те же вложенные атрибуты что и у основного изображения.

#### data-ajax-product-gallery-main-iframe — iframe-видео (YouTube/Vimeo/Rutube)

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-gallery-media-content` | Добавляет `innerHTML` с `<iframe>` видео |
| `data-ajax-product-gallery-media-preview` | Добавляет `src` с превью видео на `<img>` |
| `data-ajax-product-gallery-media-index-href` | Добавляет `href` с якорной ссылкой `#video-{id}` — для связи с миниатюрой |
| `data-ajax-product-gallery-media-link` | Добавляет `href` с прямой ссылкой на видео |

#### data-ajax-product-gallery-thumb-iframe — миниатюра iframe-видео

Те же вложенные атрибуты что и у `gallery-main-iframe`.

#### data-ajax-product-gallery-main-video — видео из файлов магазина

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-gallery-media-content` | Заменяет элемент на `<video>` с `<source>` |
| `data-ajax-product-gallery-media-preview` | Добавляет `src` с картинкой-заглушкой |
| `data-ajax-product-gallery-media-link` | Добавляет `href` со ссылкой на видео-файл |

#### data-ajax-product-gallery-thumb-video — миниатюра видео из файлов

Те же вложенные атрибуты что и у `gallery-main-video`.

```liquid
<template data-ajax-product-gallery-template>
  <!-- Основное изображение -->
  <div data-ajax-product-gallery-image-item>
    <a data-ajax-product-image-link>
      <picture>
        <source data-ajax-product-image-resizing-rules-index="0"
                media="(min-width:768px)" type="image/webp" class="lazyload">
        <source data-ajax-product-image-resizing-rules-index="1"
                media="(max-width:767px)" type="image/webp" class="lazyload">
        <img data-ajax-product-image-resizing-rules-index="2" class="lazyload">
      </picture>
    </a>
  </div>

  <!-- Миниатюра -->
  <div data-ajax-product-gallery-thumb-image-item>
    <img data-ajax-product-image-resizing-rules-index="3" class="lazyload">
  </div>

  <!-- iframe-видео -->
  <div data-ajax-product-gallery-main-iframe>
    <a data-ajax-product-gallery-media-index-href>
      <img data-ajax-product-gallery-media-preview>
      <div data-ajax-product-gallery-media-content></div>
    </a>
  </div>

  <!-- Миниатюра видео -->
  <div data-ajax-product-gallery-thumb-iframe>
    <img data-ajax-product-gallery-media-preview>
  </div>
</template>
```

---

### Шаблон единственного фото: data-ajax-product-one-photo-template

Используется если у товара только одно изображение и нет видео. Требует `images` в productData.

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-one-photo-item` | Корневой элемент шаблона |

```liquid
<template data-ajax-product-one-photo-template>
  <div data-ajax-product-one-photo-item>
    <a data-ajax-product-image-link>
      <picture>
        <source data-ajax-product-image-resizing-rules-index="0"
                media="(min-width:768px)" type="image/webp" class="lazyload">
        <source data-ajax-product-image-resizing-rules-index="1"
                media="(max-width:767px)" type="image/webp" class="lazyload">
        <img data-ajax-product-image-resizing-rules-index="2" class="lazyload">
      </picture>
    </a>
  </div>
</template>
```

---

### Шаблон краткого описания: data-ajax-product-short-description-template

Требует `short_description` в productData.

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-short-description-item-text` | Записывает текст краткого описания в `innerHTML` |

```liquid
<template data-ajax-product-short-description-template>
  <div data-ajax-product-short-description-item-text></div>
</template>
```

---

### Шаблон полного описания: data-ajax-product-full-description-template

Требует `description` в productData.

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-full-description-item-text` | Записывает текст полного описания в `innerHTML` |

```liquid
<template data-ajax-product-full-description-template>
  <div data-ajax-product-full-description-item-text></div>
</template>
```

---

### Шаблон параметров: data-ajax-product-properties-template

Требует `properties` + `characteristics` в productData.

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-property` | Блок одного параметра |
| `data-ajax-product-property-title` | Название параметра |
| `data-ajax-product-property-characteristic-title` | Значение параметра |
| `data-ajax-product-properties-show-more-btn` | Кнопка "Показать ещё" (не добавляется если параметров меньше `maxVisibleItemsCount`) |
| `data-ajax-product-properties-hide-btn` | Кнопка "Свернуть" |

**CSS-класс на `[data-ajax-product-property]`:**
- `ajax-product-property-hidden` — параметры сверх `maxVisibleItemsCount`

```liquid
<template data-ajax-product-properties-template>
  <div>
    <div data-ajax-product-property>
      <span data-ajax-product-property-title></span>
      <span data-ajax-product-property-characteristic-title></span>
    </div>
    <button data-ajax-product-properties-show-more-btn>Показать ещё</button>
    <button data-ajax-product-properties-hide-btn>Свернуть</button>
  </div>
</template>
```

---

### Шаблон компонентов комплекта: data-ajax-product-bundle-components-item-template

Требует `bundle_info` в productData.

**CSS-классы на `[data-ajax-product-bundle-components]`:**
- `ajax-product-bundle-items-loading` — во время загрузки
- `ajax-product-bundle-items-loaded` — после загрузки

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-bundle-components-item` | Корневой элемент компонента комплекта |
| `data-ajax-product-bundle-components-item-title` | Название товара в `textContent` |
| `data-ajax-product-bundle-components-item-link` | `href` со ссылкой на товар |
| `data-ajax-product-bundle-components-item-image` | `src` с изображением товара |
| `data-ajax-product-bundle-components-item-quantity` | Количество в `textContent` |
| `data-ajax-product-bundle-components-item-product-price` | Цена товара. Если 0 — на `item` добавляется `ajax-product-bundle-item-is-free` |
| `data-ajax-product-bundle-components-item-variant-price` | Цена варианта. Если 0 — на `item` добавляется `ajax-product-bundle-item-is-free` |
| `data-ajax-product-bundle-components-item-options` | Место для рендера шаблона свойств варианта (`data-ajax-product-bundle-components-item-options-template`) |

### Шаблон свойств варианта комплекта: data-ajax-product-bundle-components-item-options-template

| Атрибут | Что делает |
|---|---|
| `data-ajax-product-bundle-components-item-options-item` | Корневой элемент одного свойства |
| `data-ajax-product-bundle-components-item-options-item-name-title` | Название свойства |
| `data-ajax-product-bundle-components-item-options-item-value-title` | Значение свойства |

---

## AJAX-фильтры

Инициализируется **автоматически** после `DOMContentLoaded` на странице категории при наличии формы с `data-ajax-filter`.

### Настройки data-ajax-filter

| Параметр | Описание |
|---|---|
| `useImages` | `"true"` — значения свойств как картинки (использует шаблон `template-color`), `"false"` — текст |
| `visibleItemsSize` | Кол-во значений до кнопки "Показать всё" |
| `maxFilterItems: 0` | Показать все значения сразу без кнопки |

### Атрибуты разметки формы

| Атрибут | Что делает |
|---|---|
| `data-ajax-filter-items` | Контейнер куда рендерятся все группы фильтров |
| `data-ajax-filter-item` | Корневой элемент группы фильтра (в шаблоне `template-item`) |
| `data-ajax-filter-item-title` | Название группы фильтра |
| `data-ajax-filter-item-content` | Контейнер значений внутри группы |
| `data-ajax-filter-option-label` | Текстовое значение фильтра (в шаблоне `template-usual`) |
| `data-ajax-filter-option-image` | Изображение значения фильтра (в шаблоне `template-color`) |
| `data-ajax-filter-range` | Блок диапазона (цена или числовой параметр) |
| `data-ajax-filter-range-field-min` | Поле ввода минимального значения диапазона |
| `data-ajax-filter-range-field-max` | Поле ввода максимального значения диапазона |
| `data-ajax-filter-items-preloader` | Элемент прелоадера (в шаблоне `template-preloader`) |

### Скрытые поля — обязательно передавать

```liquid
{% if order %}<input type="hidden" name="order" value="{{ order }}">{% endif %}
{% if page_size %}<input type="hidden" name="page_size" value="{{ page_size }}">{% endif %}
{% if language.not_default? %}<input type="hidden" name="lang" value="{{ language.locale }}">{% endif %}
{% if search.query != '' %}<input type="hidden" name="q" value="{{ search.query }}">{% endif %}
```

### Все 5 шаблонов (все нужны)

```liquid
<!-- 1. Шаблон фильтра по цене -->
<template data-ajax-filter-template-price>
  <div class="filter-item">
    <div data-ajax-filter-range>
      <input data-ajax-filter-range-field-min type="text" name="price_min"
             value="{{ price_min }}" {% unless price_min %}disabled{% endunless %}>
      <input data-ajax-filter-range-field-max type="text" name="price_max"
             value="{{ price_max }}" {% unless price_max %}disabled{% endunless %}>
    </div>
  </div>
</template>

<!-- 2. Шаблон группы фильтра -->
<template data-ajax-filter-template-item>
  <div data-ajax-filter-item>
    <span data-ajax-filter-item-title></span>
    <div data-ajax-filter-item-content></div>
  </div>
</template>

<!-- 3. Шаблон текстового значения (свойства и параметры) -->
<template data-ajax-filter-template-usual>
  <label>
    <input type="checkbox" autocomplete="off">
    <span data-ajax-filter-option-label></span>
  </label>
</template>

<!-- 4. Шаблон значения в виде картинки (только свойства) — нужен name="options[][]" -->
<template data-ajax-filter-template-color>
  <label>
    <input type="checkbox" autocomplete="off" name="options[][]">
    <span data-ajax-filter-option-image></span>
  </label>
</template>

<!-- 5. Шаблон числового параметра (диапазон) -->
<template data-ajax-filter-template-numeric>
  <div data-ajax-filter-range>
    <input data-ajax-filter-range-field-min type="text">
    <input data-ajax-filter-range-field-max type="text">
  </div>
</template>

<!-- 6. Шаблон прелоадера -->
<template data-ajax-filter-items-template-preloader>
  <div data-ajax-filter-items-preloader></div>
</template>
```

### Событие после инициализации

```js
EventBus.subscribe('init-filter:ui-ajax-filter', function(data) {
  console.log(data)
})
```
