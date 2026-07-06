# Тег `{% prefetch %}` — выборка товаров и отзывов

Тег `{% prefetch %}` оборачивает блок и на время рендера выставляет в контекст `prefetch_limit`, а при необходимости — `prefetch_sort`, `prefetch_offset`, `only_available`. **Каждый дроп сам решает**, какие из этих параметров учитывать: поведение **не унифицировано**.

Типичный сценарий — ограничить SQL-выборку для **товаров коллекции** или **отзывов магазина**; без `prefetch` такие коллекции часто грузятся в полном объёме. У **связанных списков на карточке товара** (`related_products`, `similar_products`, `related_articles`, `reviews`) из контекста надёжно работает в основном **лимит**; **`offset` из тега на них не действует** (см. ниже).

**Синтаксис:**

```liquid
{% prefetch <коллекция> limit <число>[, sort: '<ключ>'][, offset: <число>][, only_available: true|false] %}
  …
{% endprefetch %}
```

- `limit` — обязательный; от 1 до 100.
- `sort`, `offset`, `only_available` — необязательные, через запятую после limit.

---

## Где работает `offset`, а где нет

| Объект в теге `prefetch` | `limit` | `offset` | `sort` / `only_available` (если поддерживаются) |
|--------------------------|---------|----------|---------------------------------------------------|
| `collection.products` (и др. товары через `ProductCollectionDrop`) | да | да | да (см. таблицы ниже) |
| Коллекции статей (`ArticleCollectionDrop`) | да | да | по реализации дропа |
| `account.reviews`, `reviews_not_spam`, `reviews_spam` | да | да | да (см. таблицу отзывов) |
| `product.related_products`, `product.similar_products`, `product.related_articles` | да | **нет** | порядок задаётся ассоциацией/аккаунтом, **не** произвольным `sort` из тега |
| `product.reviews` | да (в т.ч. внутренний потолок в коде) | **нет** | фиксированный порядок в запросе, **не** ключи из таблицы отзывов для `account.reviews` |

Итог для витрины: **постраничность через `offset:`** имеет смысл для **коллекции** и **отзывов магазина**. Для **похожих / сопутствующих товаров и статей на товаре** сдвиг начала списка задать `offset` в `prefetch` **нельзя** — только обрезать длину через `limit` (список всегда с первого элемента в своём порядке).

---

## Товары коллекции

### Базовый пример

```liquid
{% prefetch collection.products limit 12 %}
  {% for product in collection.products %}
    {{ product.title }}
  {% endfor %}
{% endprefetch %}
```

### С сортировкой и фильтром по наличию

```liquid
{% prefetch collection.products limit 24, sort: 'descending_price', only_available: true %}
  {% for product in collection.products %}
    {{ product.title }} — {{ product.price | money }}
  {% endfor %}
{% endprefetch %}
```

### С offset (для постраничной выдачи вручную)

Работает для **товаров коллекции** (и аналогичных коллекционных списков). **Не** распространяется на `product.similar_products`, `product.related_products`, `product.related_articles`, `product.reviews`.

```liquid
{% prefetch collection.products limit 12, offset: 12 %}
  {% for product in collection.products %}
    {{ product.title }}
  {% endfor %}
{% endprefetch %}
```

### Лимит из настроек виджета

```liquid
{% assign products_limit = widget_settings.products_limit | default: 8 %}
{% prefetch collection.products limit products_limit, sort: 'descending_age' %}
  {% for product in collection.products %}
    {{ product.title }}
  {% endfor %}
{% endprefetch %}
```

### Важно про `size` внутри и вне `prefetch`

`size` зависит от контекста:
- вне `{% prefetch %}` возвращает общее количество в базе;
- внутри `{% prefetch %}` возвращает количество элементов с учётом лимита текущего блока.

Пример: если у товара `related_products` = `160`, то:
- `product.related_products.size` вне `prefetch` вернёт `160`;
- `product.related_products.size` внутри `{% prefetch product.related_products limit 20 %}` вернёт `20`.

### Сопутствующие товары: лимит из настроек виджета

Лимит задаётся в **`{% prefetch %}`**; список уже укорочен, поэтому в **`{% for %}` не обязательно** (и чаще всего не нужно) дублировать `limit:`.
Для `related_products` и `similar_products` держите **один `prefetch` на весь участок вывода** (слайдер, модалки и т.п.), чтобы не делать повторную выборку в этом же шаблоне.
Важно: открывайте `{% prefetch %}` **до** любой проверки `size`; это правило распространяется на все случаи, иначе первая проверка может инициировать лишнюю загрузку без лимита.

```liquid
{% assign special_count = widget_settings.count-special-products | default: 20 %}
{% prefetch product.related_products limit special_count %}
  {% if product.related_products.size > 0 %}
    {% for related in product.related_products %}
      {{ related.title }}
    {% endfor %}
  {% endif %}
{% endprefetch %}
```

Удобнее не называть элемент цикла `product`, чтобы не затенять текущий товар страницы.

Тот же принцип: лимит только в `prefetch`, в `{% for %}` отдельный `limit:` не обязателен.

```liquid
{% prefetch product.similar_products limit 6 %}
  {% if product.similar_products.size > 0 %}
    {% for similar in product.similar_products %}
      {{ similar.title }}
    {% endfor %}
  {% endif %}
{% endprefetch %}
```

### Один prefetch для нескольких проходов по тому же списку

Если один и тот же список рендерится в нескольких местах (например, карточки + модальные окна), оборачивайте **весь участок** в один `{% prefetch %}`, а не ставьте второй такой же блок ниже.

```liquid
{% assign special_count = widget_settings.count-special-products | default: 20 %}
{% prefetch product.related_products limit special_count %}
  {% if product.related_products.size > 0 %}
    {% comment %} 1) Слайдер {% endcomment %}
    {% for related in product.related_products %}
      {{ related.title }}
    {% endfor %}

    {% comment %} 2) Модалки по тем же товарам {% endcomment %}
    {% for related in product.related_products %}
      {{ related.id }}
    {% endfor %}
  {% endif %}
{% endprefetch %}
```

**Типичная ошибка:** проверять `size` до входа в `{% prefetch %}`. Такая проверка может выполнить выборку без лимита и увеличить нагрузку.

---

## Отзывы магазина

Тег работает с `account.reviews`, `account.reviews_not_spam`, `account.reviews_spam`.

### Базовый пример

```liquid
{% prefetch account.reviews_not_spam limit 10 %}
  {% for review in account.reviews_not_spam %}
    {{ review.content }} — {{ review.rating }}
  {% endfor %}
{% endprefetch %}
```

### С сортировкой и проверкой наличия

```liquid
{% prefetch account.reviews_not_spam limit 5, sort: 'rating_desc_date_desc' %}
  {% if account.reviews_not_spam.size > 0 %}
    {% for review in account.reviews_not_spam %}
      {{ review.author }}: {{ review.content }}
    {% endfor %}
  {% endif %}
{% endprefetch %}
```

---

## Сортировка товаров (`sort:`)

| Ключ | Описание |
|------|----------|
| `title` | По названию (А–Я) |
| `descending_title` | По названию (Я–А) |
| `price` | По цене (сначала дешевле) |
| `descending_price` | По цене (сначала дороже) |
| `old_price` | По старой цене (сначала дешевле) |
| `descending_old_price` | По старой цене (сначала дороже) |
| `price_available` | По цене среди товаров в наличии |
| `descending_price_available` | По цене среди товаров в наличии (дороже сначала) |
| `discount` | По размеру скидки (сначала меньше) |
| `descending_discount` | По размеру скидки (сначала больше) |
| `discount_available` | По скидке среди товаров в наличии |
| `descending_discount_available` | По скидке среди товаров в наличии (больше сначала) |
| `age` | По давности добавления (старые первые) |
| `descending_age` | По давности добавления (новые первые) |
| `sort_weight` | По весу сортировки (возрастание) |
| `descending_sort_weight` | По весу сортировки (убывание) |
| `updated_at` | По дате обновления (старые первые) |
| `descending_updated_at` | По дате обновления (новые первые) |
| `popularity` | По популярности (сначала менее популярные) |
| `descending_popularity` | По популярности (сначала популярнее) |
| `relevance` | По релевантности (при поиске) |
| `manual` | Вручную (порядок в коллекции) |

---

## Сортировка отзывов (`sort:`)

| Ключ | Описание |
|------|----------|
| `date` | По дате (старые первые) |
| `date_desc` | По дате (новые первые) |
| `rating` | По оценке (низкие первые) |
| `rating_desc` | По оценке (высокие первые) |
| `rating_desc_date_desc` | Сначала по оценке (высокие), затем по дате (новые) |
| `rating_date_desc` | Сначала по оценке (низкие), затем по дате (новые) |

---

## Комбинация с `{% cache %}`

`{% prefetch %}` можно вкладывать внутрь `{% cache %}`. Ключ кеша должен включать параметры выборки (лимит, сортировку), чтобы разные конфигурации не перекрывали друг друга. Используйте `widget_basic_cache_key` — он уже учитывает настройки виджета.

```liquid
{% assign products_limit = widget_settings.products_limit | default: 8 %}
{% assign products_sort = widget_settings.products_sort | default: 'descending_age' %}

{% capture cache_key %}
  {{ widget_basic_cache_key }}_{{ account.products_basic_cache_key }}
{% endcapture %}

{% cache cache_key %}
  {% prefetch collection.products limit products_limit, sort: products_sort %}
    {% for product in collection.products %}
      {{ product.title }} — {{ product.price | money }}
    {% endfor %}
  {% endprefetch %}
{% endcache %}
```

> Не дублируйте `products_limit` и `products_sort` в ключе кеша вручную — `widget_basic_cache_key` уже учитывает настройки виджета.

---

## Типичные ошибки

1. **Нет `{% prefetch %}` вокруг цикла** — коллекция загружается целиком, лимит `for … limit:` работает только на уровне Liquid-итерации, но не ограничивает SQL-запрос.
2. **Проверка `size` вне `prefetch` при ожидании лимита** — вне блока вернётся общее количество элементов в базе, а не лимитированное значение.
4. **Неверный ключ `sort:`** — несуществующий ключ молча игнорируется, сортировка не применяется. Сверяйтесь с таблицей выше.
5. **`only_available` без кавычек** — значение передаётся как строка: `only_available: 'true'` и `only_available: true` оба работают, но `only_available: false` тоже нужно писать явно, если хотите включить товары без наличия.
6. **`offset` ≤ 0** — игнорируется (смещение не применяется).
7. **`limit` > 100** — автоматически обрезается до 100.
8. **`offset` у списков на товаре** — для `product.related_products`, `product.similar_products`, `product.related_articles`, `product.reviews` параметр `offset:` в `{% prefetch %}` **не подхватывается** дропом: ожидать «вторую страницу» сопутствующих только через offset нельзя; работает ограничение длины через `limit`.
9. **`sort:` на связанных товарах/статьях товара** — ключи из таблиц сортировки ниже относятся к **коллекциям товаров** и **отзывам магазина**; для `related_products` / `similar_products` / `related_articles` порядок не переключается этим атрибутом тега.
9. **Проверка `size` до `prefetch`** — сначала открывайте `{% prefetch ... %}`, и только внутри блока проверяйте коллекцию; правило общее для всех кейсов, иначе можно получить лишний запрос без prefetch-ограничений.
10. **Два одинаковых `prefetch` подряд для одного списка** — при рендере “слайдер + модалки” не дублируйте блок; используйте один общий `prefetch` и несколько циклов внутри него.
