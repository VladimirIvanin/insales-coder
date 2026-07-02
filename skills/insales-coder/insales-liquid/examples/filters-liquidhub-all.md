# Все фильтры Liquid (InSales) — примеры

Сводка по [фильтрам на Liquidhub](https://liquidhub.ru/collection/filtry-liquid). Уточнения и краевые случаи — на сайте.

---

## Массивы

### `size`

```liquid
{% assign array = "a, b, c" | split: ", " %}
{{ array | size }}
{% comment %} => 3 {% endcomment %}
```

### `first` / `last`

```liquid
{% assign array = "wooden, deepsnow, season2006" | split: ", " %}
{{ array | first }}
{{ array | last }}
```

### `split` / `join`

```liquid
{% assign array = "wooden, deepsnow, season2006" | split: ", " %}
{{ array[0] }}
{{ array | join: ", " }}
```

### `reverse`

```liquid
{% assign array = "a, b, c" | split: ", " | reverse %}
{{ array | first }}
```

### `sort`

```liquid
{% assign products = collection.products | sort: "title" %}
{% for product in products %}
  {{ product.title }}
{% endfor %}
```

### `map`

```liquid
{% assign titles = collections | map: "title" %}
{% for title in titles %}{{ title }}, {% endfor %}
```

### `where`

```liquid
{{ collections.all.products | where: "available", false | size }}
{% assign first_available = product.variants | where: "available" | first %}
```

### `concat`

```liquid
{% assign fruits = "a, b" | split: ", " %}
{% assign more = "c, d" | split: ", " %}
{% assign all = fruits | concat: more %}
```

### `uniq`

```liquid
{% assign items = "x, y, y" | split: ", " | uniq %}
{{ items | json }}
```

---

## Математика

### `plus` / `minus` / `times` / `divided_by`

```liquid
{{ 2 | plus: 2 }}
{{ 5 | minus: 2 }}
{{ 10 | times: 2 }}
{{ 10 | divided_by: 2 }}
```

### `round`

```liquid
{{ 4.6 | round: 0 }}
{{ 4.5612 | round: 2 }}
```

### `modulo`

```liquid
{{ 12 | modulo: 5 }}
```

### `to_integer`

```liquid
{{ "10" | to_integer }}
{{ nil | to_integer }}
{% assign n = "10" | to_integer %}
{% if n > 9 %}ok{% endif %}
```

---

## Ссылки и файлы

### `asset_url`

```liquid
{{ "shop.css" | asset_url }}
```

### `asset_url_if_exists`

```liquid
{% assign path = "image.png" | asset_url_if_exists %}
{% if path %}<img src="{{ path }}" alt="">{% endif %}
```

### `file_url`

```liquid
{{ "banner.pdf" | file_url }}
```

### `add_param`

```liquid
{{ "/product?lang=ru" | add_param: "variant_id", 123456 }}
```

### `locale_url`

```liquid
{{ "/page/about" | locale_url }}
```

---

## Строки и текст

### `money`

```liquid
{{ product.price | money }}
{{ 1000 | money }}
```

### `append` / `prepend`

```liquid
{{ "sales" | append: ".jpg" }}
{{ "sale" | prepend: "Made a great " }}
```

### `capitalize` / `upcase` / `downcase`

```liquid
{{ "capitalize me" | capitalize }}
{{ "hi" | upcase }}
{{ "HI" | downcase }}
```

### `replace` / `remove` / `remove_first`

```liquid
{{ product.title | replace: "Awesome", "Mega" }}
{{ "Hello, world. Goodbye, world." | remove: "world" }}
{{ "Hello, world. Goodbye, world." | remove_first: "world" }}
```

### `escape`

```liquid
{{ "<p>test</p>" | escape }}
```

### `newline_to_br`

```liquid
{% capture var %}One
Two{% endcapture %}
{{ var | newline_to_br }}
```

### `strip_html` / `strip_newlines`

```liquid
{{ "<p>Текст</p>" | strip_html | truncate: 20 }}
{{ "a\nb" | strip_newlines }}
```

### `md5`

```liquid
{{ "test md5" | md5 }}
```

### `lstrip`

```liquid
{{ "  text" | lstrip }}
```

### `truncate` / `truncatewords`

```liquid
{{ "The cat came back the very next day" | truncate: 13 }}
{{ "The cat came back the very next day" | truncate: 18, ", and so on" }}
{{ "The cat came back the very next day" | truncatewords: 4 }}
{{ "The cat came back the very next day" | truncatewords: 4, "--" }}
```

### `url_encode` / `url_decode`

```liquid
{{ "john@liquidhub.ru" | url_encode }}
{{ "john%40liquidhub.ru" | url_decode }}
```

---

## Прочее

### `default`

```liquid
{{ empty_price | default: 2.99 }}
```

### `date`

```liquid
{{ "now" | date: "%Y-%m-%d" }}
{{ product.updated_at | date: "%d.%m.%y" }}
```

Спецификаторы (`%d`, `%H`, `%B` …) — в [документации фильтра `date`](https://liquidhub.ru/collection/filtry-liquid).

### `json`

```liquid
<script>
  var data = {
    text: {{ "<p>html</p>" | json }},
    product: {{ product | json }}
  };
</script>
```

### `custom_json`

```liquid
<script>
  var article = {{ article | custom_json: "title", "id", "author" }};
</script>
```

### `file_type_by_url`

```liquid
{% assign ft = "https://example.com/image.jpg?v=1" | file_type_by_url %}
{{ ft.type }}
{{ ft.ext }}
```

### `dark?` (только hex)

```liquid
{{ "#000000" | dark? }}
{{ "#ffffff" | dark? }}
```

### `change_lightness`

```liquid
{{ "#0036b3" | change_lightness: -20 }}
{{ "#0036b3" | change_lightness: 0 }}
{{ "#0036b3" | change_lightness: 20 }}
```

---

## Изображения (не для ассетов темы / `media`)

### `image_url`

Диапазон размера 16–4096 px. Опции: `format: 'jpg'` / `'webp'`, `resizing_type: 'fit_width'`, `height:`, `quality:` (как в ваших сниппетах).

quality поумолчанию 80
resizing_type по умолчанию по длинной стороне

```liquid
<img src="{{ product.first_image | image_url: 800, resizing_type: 'fit_width' }}" alt="">
<img src="{{ article.image | image_url: 320, format: 'jpg' }}" alt="">
<img src="{{ collection.image | image_url: 600, format: 'webp' }}" alt="">
```

### `webp_picture_tag`

```liquid
{% assign image_title = product.title | escape %}
{{ product.first_image | webp_picture_tag: 600, class: "product-image", alt: image_title, title: image_title }}
{{ collection.image | webp_picture_tag: 600 }}
```

---

## HTML-хелперы

### `select_option`

Значение опции `| select_option: текущее_значение, "Подпись"`.

```liquid
{% assign page_size = "24" %}
<form action="{{ collection.url }}" method="get">
  <select name="page_size">
    {{ "24" | select_option: page_size, "24 товара" }}
    {{ "48" | select_option: page_size, "48 товара" }}
  </select>
</form>
```

### `link_to`

Текст ссылки `| link_to: url, title_атрибута_опционально`.

```liquid
{{ "Перейти в корзину" | link_to: cart_url, "Ваша корзина" }}
```

---

## Цепочки фильтров

```liquid
{{ product.short_description | strip_html | truncatewords: 15 }}
{{ product.title | escape }}
{% assign key = "prefix_" | append: collection.handle | append: "_" | append: language.locale %}
```

Полный перечень с официальными формулировками — [filtry-liquid на Liquidhub](https://liquidhub.ru/collection/filtry-liquid).
