# Товар: цены, варианты, отзывы, картинки из настройки

## Диапазон цен и одна цена

```liquid
{% if product.price_varies? %}
  <span>{{ messages.from_upper }}</span>
  <span>{{ product.price_min | money }}</span>
{% else %}
  <span>{{ product.price | money }}</span>
{% endif %}
```

## Старая цена у варианта

```liquid
{% if variant.old_price > variant.price %}
  <span class="price-old">{{ variant.old_price | money }}</span>
{% endif %}
```

## Рейтинг звёздами (цикл 1..5)

```liquid
{% if product.rating %}
  {% assign r = 1 %}
  {% for i in (1..5) %}
    <span class="star {% if r <= product.rating %}is-active{% endif %}"></span>
    {% assign r = r | plus: 1 %}
  {% endfor %}
{% endif %}
```

## Отзывы включены в аккаунте

```liquid
{% if account.reviews_enabled? and product.reviews_count > 0 %}
  <span>{{ product.reviews_count }}</span>
{% endif %}
```

## Товар из настройки виджета (`product-id` — пример handle)

Так в системных сниппетах пробрасывают выбранный в редакторе товар.

```liquid
{% if widget_settings.product-id %}
  <a href="{{ widget_settings.product-id.url }}">{{ widget_settings.product-id.title }}</a>
  {% if widget_settings.product-id.price_varies? %}
    {{ widget_settings.product-id.price_min | money }}
  {% else %}
    {{ widget_settings.product-id.price | money }}
  {% endif %}
{% endif %}
```

## Фоновая картинка из файла настройки + `image_url`

```liquid
{% if widget_settings.background-image %}
  {% assign img_width = 1200 %}
  <picture>
    <source
      srcset="{{ widget_settings.background-image | image_url: img_width, format: 'webp', resizing_type: 'fit_width', quality: 100 }}"
      type="image/webp">
    <img src="{{ widget_settings.background-image | image_url: img_width, resizing_type: 'fit_width', quality: 100 }}" alt="">
  </picture>
{% endif %}
```

## Форма в корзину на карточке

```liquid
<form action="{{ cart_url }}" method="post" data-product-id="{{ product.id }}">
  <input type="hidden" name="variant_id" value="{{ product.variants.first.id }}">
  <input type="hidden" name="quantity" value="1">
  <button type="submit">В корзину</button>
</form>
```

## Несколько вариантов — увод на карточку

```liquid
{% if product.show_variants? and product.variants.size > 1 %}
  <a href="{{ product.url }}">Подробнее</a>
{% else %}
  … кнопка «В корзину» …
{% endif %}
```
