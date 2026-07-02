# JSON в разметке и экранирование

## Товар в data-атрибут для JS (страница товара)

Документация Liquidhub: фильтр `json` для `product` ориентирован на шаблон карточки товара; в виджетах тот же приём часто используют для передачи данных в скрипт.

```liquid
<div data-product-json="{{ product | json | escape }}"></div>
```

## Товар из настройки виджета

```liquid
<div data-product-json="{{ widget_settings.product-id | json | escape }}"></div>
```

`escape` нужен, чтобы кавычки внутри JSON не ломали HTML-атрибут.

## Кастомный набор полей в скрипт

```liquid
<script>
  var article = {{ article | custom_json: 'title', 'id', 'url' }};
</script>
```

(Список полей — по [Liquidhub, фильтр custom_json](https://liquidhub.ru/collection/filtry-liquid).)
