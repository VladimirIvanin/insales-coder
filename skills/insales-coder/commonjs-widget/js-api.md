# JS API common.js для snippet.js

## EventBus

```js
// Подписка
EventBus.subscribe('событие', function(data) { ... })

// Публикация
EventBus.publish('событие', data)

// Отписка
EventBus.unsubscribe('событие', callbackFn)

// Подписка на несколько событий сразу
EventBus.subscribe(['событие1', 'событие2'], function(data) { ... })

// Отладка в консоли браузера
EventBus.logger.add('cart')   // или 'product', 'search', 'compares', 'favorites_products'
```

### Полная таблица событий

**Корзина:**

| Событие | Когда |
|---|---|
| `add_items:insales:cart` | Товар добавлен |
| `update_items:insales:cart` | Корзина обновлена |
| `delete_items:insales:cart` | Позиция удалена |
| `remove_items:insales:cart` | Уменьшено количество |
| `clear_items:insales:cart` | Корзина очищена |
| `set_items:insales:cart` | Установлено точное количество |
| `set_coupon:insales:cart` | Купон применён |
| `before:insales:cart` | Перед любым действием |
| `always:insales:cart` | После любого действия |
| `add_items:insales:cart:light` | Лёгкое добавление (без полного обновления) |

**Товар:**

| Событие | Когда |
|---|---|
| `init_instance:insales:product` | Инициализация формы товара |
| `change_variant:insales:product` | Выбран вариант |
| `update_variant:insales:product` | Вариант обновлён |
| `change_quantity:insales:product` | Изменено количество |
| `unchange_quantity:insales:product` | Введено количество больше доступного |
| `overload:quantity:insales:product` | Достигнут максимум quantity (при `useMax: true`) |
| `before:insales:product` | Перед любым действием |
| `always:insales:product` | После любого действия |

**Позиция в корзине (item):**

| Событие | Когда |
|---|---|
| `change_quantity:insales:item` | Изменено количество позиции |
| `update_variant:insales:item` | Обновлён вариант позиции |
| `always:insales:item` | После любого действия |

**Избранное:**

| Событие | Когда |
|---|---|
| `add_item:insales:favorites_products` | Товар добавлен |
| `remove_item:insales:favorites_products` | Товар удалён |
| `update_items:insales:favorites_products` | Список обновлён |
| `overload:insales:favorites_products` | Достигнут максимум |

**Сравнение:**

| Событие | Когда |
|---|---|
| `add_item:insales:compares` | Товар добавлен |
| `remove_item:insales:compares` | Товар удалён |
| `update_items:insales:compares` | Список обновлён |
| `overload:insales:compares` | Достигнут максимум |

**Поиск:**

| Событие | Когда |
|---|---|
| `update:insales:search` | Результаты обновлены |

**Ajax-компоненты:**

| Событие | Когда |
|---|---|
| `ui-ajax-products:load-products-list` | Публикуй для загрузки списка товаров |
| `init-products:ui-ajax-products` | Товары загружены и отрисованы |
| `ui-ajax-product:load-product` | Публикуй для загрузки одного товара |
| `init-product:ui-ajax-product` | Товар загружен и отрисован |
| `init-filter:ui-ajax-filter` | Фильтры инициализированы |

**Опции товара (accessories):**

| Событие | Когда |
|---|---|
| `accessories-rendered:insales:ui_accessories` | Компонент инициализирован |
| `accessory_value_changed:insales:ui_accessories` | Выбрана опция |
| `prices-calculated:insales:ui_accessories` | Пересчитаны цены |
| `accessories-errors:insales:ui_accessories` | Ошибка валидации |
| `unchange_quantity:insales:ui_add-cart-counter` | Достигнут максимум в счётчике |

**Счётчик корзины:**

| Событие | Когда |
|---|---|
| `show-preorder:insales:ui_product` | Нажата кнопка предзаказа |

**Редактор (только в режиме редактирования):**

| Событие | Когда |
|---|---|
| `widget:input-setting:insales:system:editor` | Изменяется настройка |
| `widget:change-setting:insales:system:editor` | Настройка изменена |

**Формы:**

| Событие | Когда |
|---|---|
| `send-feedback:insales:ui_feedback` | Обратная связь отправлена |
| `error-feedback:insales:ui_feedback` | Ошибка отправки |
| `show-modal-feedback:insales:ui_feedback` | Нажата кнопка открытия модалки |
| `send-review:insales:ui_reviews` | Отзыв отправлен |
| `error-reviews:insales:ui_reviews` | Ошибка отправки отзыва |
| `send-comment:insales:ui_comments` | Комментарий отправлен |
| `error-comments:insales:ui_comments` | Ошибка отправки комментария |

---

## Cart

```js
// Добавить товары
Cart.add({
  items: { 123456: 2, 123457: 1 },       // variant_id: quantity
  comments: { 123456: 'Комментарий' },
  coupon: 'PROMO'
})

// Удалить позиции по ID позиции (не variant_id!)
Cart.delete({ items: [160549240] })

// Уменьшить количество
Cart.remove({ items: { 123456: 1 } })

// Установить точное количество (0 = удалить)
Cart.set({ items: { 123456: 3, 123457: 0 } })

// Очистить корзину
Cart.clear()

// Применить купон
Cart.setCoupon({ coupon: 'PROMO' })

// Принудительно обновить данные корзины
Cart.forceUpdate()

// Синхронный доступ к текущему состоянию (без запроса)
Cart.order.order_lines   // массив позиций
Cart.order.total_price
Cart.order.items_count
```

Структура позиции в `Cart.order.order_lines` и в `data` событий корзины:

```json
{
  "cart_line_id": "db81e3d0-a471-4503-a07b-5c29ae9f3910",
  "variant_id": 1937385913,
  "product_id": 1645937577,
  "quantity": 1,
  "title": "Название товара",
  "sale_price": 1500.0,
  "total_price": 1500.0,
  "full_total_price": 1500.0,
  "first_image": { "medium_url": "...", "small_url": "..." },
  "images": [...],
  "accessory_lines": [],
  "accessory_value_ids": null,
  "comment": null,
  "vat": 10
}
```

Структура `data` в событии `add_items:insales:cart`:

```js
EventBus.subscribe('add_items:insales:cart', function(data) {
  data.action.button        // jQuery-объект кнопки которую нажали
  data.action.currentItems  // массив добавленных вариантов [{ variant_id, ... }]
  data.action.items         // объект { variant_id: quantity }
  data.order_lines          // актуальный состав корзины
  data.items_count          // количество позиций
  data.total_price          // сумма
  data.errors               // массив ошибок
})
```

---

## Products

```js
// Инициализировать логику товара в динамически вставленном DOM
// ОБЯЗАТЕЛЬНО вызывать после клонирования/вставки формы с data-product-id
Products.initInstance($('[data-product-id]'))
  .done(() => { /* открыть модалку */ })
  .fail((err) => { console.log(err) })

// Получить данные о товарах по массиву ID
Products.getList([123456, 123457])
  .done(function(data) {
    // data — объект { id: productData }
    const product = data[123456]
    product.title
    product.url
    product.price_min
    product.price_max
    product.first_image.medium_url
    product.variants
  })

// Получить список ID недавно просмотренных товаров
Products.getRecentlyViewed()
  .done(function(productIds) {
    // productIds — массив ID
  })
```

---

## FavoritesProducts

```js
FavoritesProducts.update()                 // обновить состояние кнопок (после ajax-загрузки товаров)
FavoritesProducts.add({ item: 123456 })
FavoritesProducts.remove({ item: 123456 })
FavoritesProducts.clear()
FavoritesProducts.getFavoritesProducts()   // текущий список
```

---

## Compare

```js
Compare.update()                 // обновить состояние кнопок (после ajax-загрузки товаров)
Compare.add({ item: 123456 })
Compare.remove({ item: 123456 })
Compare.clear()
Compare.getCompare()             // текущий список
```

---

## Shop

```js
Shop.money.format(1500.0)        // → "1 500 руб."
Shop.units.getName('kg')         // → "кг"
Shop.config.getProducId()        // ID товара на странице товара, иначе null
Shop.config.get()                // конфиг магазина
```

---

## InSalesUI

```js
// После перерисовки HTML корзины — переинициализировать обработчики quantity/delete
InSalesUI.initAjaxInstance($('.js-dynamic-cart'))
```

---

## ajaxAPI

Все методы возвращают jQuery Deferred (`.done()` / `.fail()`).

```js
// Корзина
ajaxAPI.cart.get().done(fn)
ajaxAPI.cart.add({ 123456: 1 }, { comments: {}, coupon: '' }).done(fn)
ajaxAPI.cart.update({ 123456: 2, 123457: 0 }).done(fn)
ajaxAPI.cart.remove(variant_id).done(fn)

// Товары (кэшируются в sessionStorage, лимит 700)
ajaxAPI.product.get(123456).done(fn)
ajaxAPI.product.getList([123456, 123457]).done(fn)
ajaxAPI.product.getList([123456], { no_cache: true }).done(fn)

// Категория
ajaxAPI.collection.get('my-collection',
  { price_min: 1000, price_max: 5000 },
  { page_size: 20, page: 1 }
).done(fn)

// Клиент
ajaxAPI.shop.client.get().done(fn)
// { status: "ok", client: {...} } или { status: "error", url: "/login" }

// Отзыв к товару
ajaxAPI.shop.review({
  author: 'Имя',
  email: 'email@mail.ru',
  content: 'Текст',
  rating: 5
}, '/product/my-product').done(fn)

// Комментарий к статье
ajaxAPI.shop.comment({
  author: 'Имя',
  email: 'email@mail.ru',
  content: 'Текст'
}, '/blogs/blog/my-article').done(fn)

// Обратная связь
ajaxAPI.shop.message({
  'feedback[name]': 'Имя',
  'feedback[from]': 'email@mail.ru',
  'feedback[phone]': '79001234567',
  'feedback[content]': 'Сообщение',
  'feedback[subject]': 'Тема'
}).done(fn)

// Сравнение
ajaxAPI.compare.add(123456).done(fn)
ajaxAPI.compare.remove(123456).done(fn)
ajaxAPI.compare.get().done(fn)
```
