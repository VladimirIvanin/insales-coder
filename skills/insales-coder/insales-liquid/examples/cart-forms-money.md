# Корзина: формы, ссылки, расчёты

## Ссылка на корзину

```liquid
<a href="{{ cart_url }}">Корзина</a>
```

## Ссылка на товар с выбранным вариантом

```liquid
<a href="{{ product.url | add_param: 'variant_id', variant.id }}">{{ product.title }}</a>
```

## Цена строки и учёт ограничения по остатку

```liquid
{% assign item_total_price = item.sale_price | times: item.quantity %}
{% if total_quantity < requested_quantity and account.forbid_order_over_existing == true %}
  {% assign item_total_price = item.sale_price | times: total_quantity %}
{% endif %}
{{ item_total_price | money }}
```

## Сумма по корзине в цикле (накопление)

```liquid
{% assign total_cart_price = 0 %}
{% for item in cart.items %}
  {% assign line = item.sale_price | times: item.quantity %}
  {% assign total_cart_price = total_cart_price | plus: line %}
{% endfor %}
{{ total_cart_price | money }}
```

## Вывод цен позиции (как в разметке корзины)

```liquid
<span>{{ item.sale_price | money }}</span>
{% if item.variant.old_price > item.sale_price %}
  <span>{{ item.variant.old_price | money }}</span>
{% endif %}
```

## Картинка позиции

```liquid
<img src="{{ item.variant.first_image.large_url }}" alt="{{ item.title | escape }}">
```

## Объект «общая корзина» (виджеты)

В части виджетов используется `shared_cart` вместо `cart`:

```liquid
{% if shared_cart.items.size > 0 %}
  {% for item in shared_cart.items %}
    <div data-product-id="{{ item.product.id }}" data-item-id="{{ item.id }}">
      …
    </div>
  {% endfor %}
{% endif %}
```
