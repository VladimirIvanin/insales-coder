# Панели блоков и строковые фильтры

Пермалинк панели (`handle`) задаётся в бэк-офисе при создании панели блоков. В Liquid: `block_lists['handle'].blocks` — квадратные скобки надёжны, если в handle есть дефисы (иначе `a-b` может читаться как вычитание).

Ниже — **условные** имена (`social-links`, `messengers`); подставляйте свои handles.

Префикс **`system--`** бывает у **системных** панелей из поставки темы/шаблонов InSales; у кастомных панелей магазина обычно свои названия без этого префикса.

## Цикл по блокам панели

```liquid
{% if block_lists['social-links'].blocks.size > 0 %}
  {% for social in block_lists['social-links'].blocks %}
    {% if social.link %}
      <a href="{{ social.link }}" target="_blank" class="{{ social.handle }}">{{ social.title }}</a>
    {% endif %}
  {% endfor %}
{% endif %}
```

## Первый блок панели

```liquid
{% if block_lists['office-address'].blocks.first.text != blank %}
  <div>{{ block_lists['office-address'].blocks.first.text }}</div>
{% endif %}
```

Поле `text` зависит от шаблона блока; у блока «заголовок + HTML» чаще `content`, у текстового поля — как в редакторе блока.

## Условие «есть хотя бы одна группа ссылок»

```liquid
{% if block_lists.messengers.blocks.size > 0 or block_lists['social-links'].blocks.size > 0 %}
  …
{% endif %}
```

## `capture` + две группы ссылок

```liquid
{% capture social_content %}
  {% for social in block_lists['social-links'].blocks %}
    {% if social.link %}…{% endif %}
  {% endfor %}
{% endcapture %}

{% capture messenger_content %}
  {% for messenger in block_lists.messengers.blocks %}
    {% if messenger.link %}…{% endif %}
  {% endfor %}
{% endcapture %}

{% if social_content != blank or messenger_content != blank %}
  <div class="social">{{ social_content }}{{ messenger_content }}</div>
{% endif %}
```

## Нормализация телефона для `tel:`

```liquid
<a href="tel:{{ widget_settings.phone_link | strip_html | remove: '(' | remove: ')' | remove: '-' | remove: ' ' | lstrip }}">
  {{ widget_settings.phone_link }}
</a>
```

## Координаты: строка «lat,lng» → массив

```liquid
{% assign address_points = address_point | split: ',' %}
<iframe src="/maps/dgis_iframe?lat={{ address_points[0] }}&lng={{ address_points[1] }}&zoom=15"></iframe>
```

## Ссылки на мессенджеры с префиксом

```liquid
{% assign messenger_link = messenger.link %}
{% if messenger.handle contains 'whatsapp' %}
  {% assign messenger_link = messenger.link | prepend: 'https://wa.me/' %}
{% endif %}
<a href="{{ messenger_link }}">…</a>
```
