# Каталог, поиск, SEO-фильтр

## Переключение между `products` и результатами поиска

В некоторых шаблонах каталога (виджеты) для страницы поиска используют `search.results.products`. В обычных темах часто итерируют `search.results` напрямую — сверяться с шпаргалкой и своим шаблоном.

```liquid
{% if search.performed? and products.size > 0 or template == 'search' and search.results.size > 0 %}
  {% if template == 'search' %}
    {% assign product_arr = search.results.products %}
  {% else %}
    {% assign product_arr = products %}
  {% endif %}
{% else %}
  {% assign product_arr = products %}
{% endif %}

{% for product in product_arr %}
  …
{% endfor %}
```

## URL страницы: коллекция, фильтр, номер страницы

```liquid
<link rel="canonical" href="{{ collection.url }}{% if filter %}/{{ filter.handle }}{% endif %}{% if paginate.current_page != 1 %}?page={{ paginate.current_page }}{% endif %}">
```

## Заголовок: фильтр или коллекция

```liquid
{% if filter.title %}
  <h1>{{ filter.title }}</h1>
{% else %}
  <h1>{{ collection.title }}</h1>
{% endif %}
```

## Описание для meta: фильтр / коллекция

```liquid
{% if filter %}
  {% if filter.description %}
    <meta name="description" content="{{ filter.description | strip_html | truncate: 200 }}">
  {% elsif filter.seo_description %}
    <meta name="description" content="{{ filter.seo_description | strip_html | truncate: 200 }}">
  {% endif %}
{% else %}
  {% if collection.description %}
    <meta name="description" content="{{ collection.description | strip_html | truncate: 200 }}">
  {% endif %}
{% endif %}
```

## Первый доступный вариант товара

```liquid
{% assign product_variants_first = product.variants | where: "available" | first %}
{% unless product_variants_first.available %}
  … нет в наличии …
{% endunless %}
```

## Анонс в карточке: лимит слов

```liquid
{% assign preview_text = product.short_description | strip_html | truncatewords: 20 %}
```

## Картинка коллекции для разметки (без `menu_image`)

В каталоге иногда оставляют явный фолбек на первый товар; для меню чаще достаточно `collection.menu_image` (см. [collections-cache-paginate.md](collections-cache-paginate.md)).

```liquid
{% assign collection_photo = collection.image %}
{% if collection.image.original_url contains 'no_image' %}
  {% assign collection_first_product = collection.products | first %}
  {% if collection_first_product.images.size > 0 %}
    {% assign collection_photo = collection_first_product.first_image %}
  {% endif %}
{% endif %}
<meta property="og:image" content="{{ collection_photo | image_url: 500, resizing_type: 'fit_width', quality: 100 }}">
```
