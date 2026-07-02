# Data-атрибуты common.js для snippet.liquid

## Форма товара

Корень — `<form data-product-id>`. Все остальные атрибуты товара работают только внутри него.

```liquid
<form
  action="{{ cart_url }}"
  method="post"
  data-product-id="{{ product.id }}"
  data-product-updated-at="{{ product.updated_at }}"
>
  <!-- содержимое -->
</form>
```

| Атрибут | Назначение |
|---|---|
| `data-product-id="{{ product.id }}"` | Обязательный. Инициализирует логику вариантов, цен, кнопок |
| `data-product-updated-at="{{ product.updated_at }}"` | Инвалидация кэша товара |
| `data-product-json="{{ product \| json \| escape }}"` | Передать данные через Liquid — ускоряет инициализацию, не делает запрос к серверу |
| `data-product-without-many-variants="true"` | Загружать только 1 вариант (для превью без селектора вариантов) |

## Варианты товара

```liquid
{% if product.show_variants? %}
  <select name="variant_id" data-product-variants='{
    "default": "option-radio",
    "Цвет": "option-preview"
  }'>
    {% for variant in product.variants %}
      <option value="{{ variant.id }}">{{ variant.title | escape }}</option>
    {% endfor %}
  </select>
{% else %}
  <input type="hidden" name="variant_id" value="{{ product.variants.first.id }}">
{% endif %}
```

Доступные виды отображения: `option-select`, `option-select-image`, `option-span`, `option-radio`, `option-preview`, `option-preview-text`, `option-default`

## Кнопки корзины

### Счётчик (рекомендуемый способ)

```liquid
<div data-add-cart-counter='{"step": "1"}'>
  <button type="button" data-add-cart-counter-btn>
    Добавить в корзину
  </button>
  <div class="add-cart-counter__controls">
    <button type="button" data-add-cart-counter-minus>-</button>
    <span data-add-cart-counter-count></span>
    <button type="button" data-add-cart-counter-plus>+1</button>
  </div>
</div>
```

Класс `is-add-cart` появляется на `[data-add-cart-counter]` когда товар добавлен — используй для CSS.

### Простая кнопка

```liquid
<button type="submit" data-item-add>Добавить в корзину</button>
```

### Количество

```liquid
<div data-quantity data-min="1">
  <button type="button" data-quantity-change="-1">-</button>
  <input type="text" name="quantity" value="1">
  <button type="button" data-quantity-change="1">+</button>
</div>
```

## Цены и наличие

```liquid
<span data-product-card-price></span>
<span data-product-card-price-from-cart
      data-product-card-zero-price-text="Цена по запросу"></span>
<span data-product-card-old-price></span>
<span data-product-card-sku='{"skuLabel": "Арт."}'></span>
<span data-product-card-available='{
  "availableText": "В наличии",
  "notAvailableText": "Нет в наличии"
}'></span>
<div data-product-card-sale-value></div>
```

## Быстрая покупка

```liquid
{% if account.quick_checkout.enabled %}
  <button data-quick-checkout="[data-product-id='{{ product.id }}']">
    Купить в 1 клик
  </button>
{% endif %}
```

## Опции товара (accessories)

```liquid
{% unless product.is_bundle %}
  {% if product.accessories.size > 0 %}
    <div data-product-accessories></div>

    <template data-product-accessories-template>
      <div data-product-accessories-item>
        <span data-product-accessory-name></span>
        <span data-product-accessory-minmax-count='{"minCountMessage":"от","maxCountMessage":"до"}'></span>
        <div data-product-accessory-values></div>
        <div data-product-accessory-error='{
          "lessThenMinCount": "Выбрано меньше минимального",
          "moreThenMaxCount": "Выбрано больше максимального",
          "scrollEnabled": "true"
        }'></div>
      </div>
    </template>

    <template data-product-accessory-values-template>
      <label data-product-accessory-values-item data-product-accessory-values-item-id>
        <span data-product-accessory-values-item-name></span>
        (+<span data-product-accessory-values-item-price></span>)
      </label>
    </template>
  {% endif %}
{% endunless %}
```

## Корзина

```liquid
<form action="{{ cart_url }}" method="post" data-cart-form>
  <input type="hidden" name="_method" value="put">

  {% for item in cart.items %}
    <div data-product-id="{{ item.product.id }}" data-item-id="{{ item.id }}">
      <div data-quantity>
        <input type="text" name="cart[quantity][{{ item.id }}]" value="{{ item.quantity }}">
        <span data-quantity-change="-1">-</span>
        <span data-quantity-change="1">+</span>
      </div>
      <span data-item-delete="{{ item.id }}">Удалить</span>

      <!-- Опции позиции -->
      {% if item.accessory_lines.size > 0 %}
        <div data-item-accessories>
          {% for accessory in item.accessory_lines %}
            <span data-item-accessory-value-id="{{ accessory.accessory_value_id }}">
              {{ accessory.accessory_value_name }}
            </span>
          {% endfor %}
        </div>
      {% endif %}
    </div>
  {% endfor %}

  <button data-cart-clear>Очистить</button>
  <button data-cart-update>Обновить</button>
  <button type="submit" data-cart-submit>Оформить</button>
</form>
```

Атрибуты для отображения итогов (можно ставить где угодно на странице):

| Атрибут | Что выводит |
|---|---|
| `data-cart-positions-count` | Количество позиций |
| `data-cart-total-price` | Сумма без скидок |
| `data-cart-full-total-price` | Сумма со скидками |
| `data-cart-item-count` | Количество товаров |
| `data-cart-discounts-ajax` | Информация о скидках (требует `data-reload-on-coupon="false"` на форме) |
| `data-cart-discounts-error` | Ошибки купона |

Купон:

```liquid
<input type="text" name="cart[coupon]" value="{{ cart.coupon }}">
<input type="button" value="Применить" data-coupon-submit>
```

## Избранное

```liquid
<!-- Кнопка-переключатель -->
<span data-ui-favorites-trigger="{{ product.id }}"
      data-ui-favorites-trigger-added-text="В избранном"
      data-ui-favorites-trigger-not-added-text="В избранное">
  В избранное
</span>

<!-- Отдельные кнопки добавить/удалить -->
<button data-ui-favorites-add="{{ product.id }}">Добавить</button>
<button data-ui-favorites-delete="{{ product.id }}">Удалить</button>

<!-- Счётчик в хедере -->
<span data-ui-favorites-counter>0</span>
<a href="/favorites" data-ui-favorites-counter-btn>Избранное</a>

<!-- Очистить всё -->
<button data-ui-favorites-clear>Очистить</button>
```

Классы на кнопке: `favorites-added` / `favorites-not-added`

## Сравнение

```liquid
<!-- Кнопка-переключатель -->
<span data-compare-trigger="{{ product.id }}"
      data-compare-trigger-added-text="В сравнении"
      data-compare-trigger-not-added-text="Сравнить">
  Сравнить
</span>

<!-- Счётчик в хедере -->
<span data-compare-counter>0</span>
<a href="/compares" data-compare-counter-btn>Сравнение</a>
```

Классы на кнопке: `compare-added` / `compare-not-added`

## Живой поиск

```liquid
<form action="/search" method="get">
  <input type="hidden" name="lang" value="{{ language.locale }}">
  <input type="text" name="q" value="" data-search-field placeholder="Поиск">
  <button type="submit">Найти</button>
  <div data-search-result></div>
</form>
```

Настройка через JS:

```js
AjaxSearch.setConfig({
  letters: 3,
  delay: 300,
  hide_items_out_of_stock: true
})
```
