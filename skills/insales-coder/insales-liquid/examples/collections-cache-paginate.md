# Категории: кеш, `menu_image`, пагинация

## Ключ `{% cache %}`: базовые ключи (рекомендуется)

Тег `{% cache %}` описан в разделе **Операторы** на [Liquidhub](https://liquidhub.ru/collection/shpargalka-liquid) (поиск по `cache`). Строку ключа удобно собирать через `capture` или цепочку [`append` / иные фильтры](https://liquidhub.ru/collection/filtry-liquid), но **источник сброса кеша** — не «ручные» даты и не перечисление `widget_settings`, а **базовые ключи** виджета и аккаунта.

| Что внутри кеша | Добавить в ключ |
|-----------------|-----------------|
| дерево/список категорий, картинки коллекций | `account.collections_basic_cache_key` |
| блоклист виджета (`data.blocks`) | `data.basic_cache_key` |
| любой виджет | `widget_basic_cache_key` (учитывает настройки виджета — **не** дублировать `widget_settings.*` в ключе) |

### Цикл по корневым коллекциям (только категории)

```liquid
{% assign collections_limit = widget_settings.coll_limit | default: 20 %}
{% capture cache_collections_key %}
  {{ widget_basic_cache_key }}_{{ account.collections_basic_cache_key }}
{% endcapture %}
{% cache cache_collections_key %}
  {% if collections.size > 0 %}
    {% if paginate.current_page == 1 or paginate.current_page == null %}
      {% for collection in collections limit: collections_limit %}
        <a href="{{ collection.url }}">
          {% assign collection_photo = collection.menu_image %}
          {% if collection_photo.original_url contains 'no_image' %}
            <img src="{{ collection_photo.large_url }}" loading="lazy" alt="{{ collection.title | escape }}">
          {% else %}
            {% assign img_width = 200 %}
            {% assign img_height = 200 %}
            <img
              src="{{ collection_photo | image_url: img_width, height: img_height, resizing_type: 'fill-down', quality: 100 }}"
              loading="lazy"
              alt="{{ collection.title | escape }}">
          {% endif %}
          {{ collection.title }}
        </a>
      {% endfor %}
    {% endif %}
  {% endif %}
{% endcache %}
```

`collections_limit` по-прежнему из `widget_settings`, но **в ключ не входит**: смена лимита уже меняет `widget_basic_cache_key`.

### Кеш панели блоков (`data.blocks`) и подколлекции

Рендер затрагивает и блоклист, и каталог → оба базовых ключа.

```liquid
{% if data.blocks.size > 0 %}
  {% capture cache_block_list_key %}
    {{ widget_basic_cache_key }}_{{ data.basic_cache_key }}_{{ account.collections_basic_cache_key }}
  {% endcapture %}
  {% cache cache_block_list_key %}
    {% for block in data.blocks %}
      {% if block.collection.subcollections.size > 0 %}
        {% for subcollection in block.collection.subcollections limit: 4 %}
          <a href="{{ subcollection.url }}">{{ subcollection.title }}</a>
        {% endfor %}
      {% endif %}
    {% endfor %}
  {% endcache %}
{% endif %}
```

---

## Антипаттерны в ключах кеша

1. **`collections.last_updated_at`** — уступает **`account.collections_basic_cache_key`**: корректный сброс при изменениях каталога (в т.ч. картинок коллекций).
2. **`{{ widget_settings.* }}` в ключе** при том же виджете, где уже есть **`widget_basic_cache_key`** — лишнее: настройки уже учтены в `widget_basic_cache_key`, дублирование усложняет ключ и легко даёт ошибки при новых опциях.
3. **`data.id` + `data.updated_at`** вместо **`data.basic_cache_key`** — хуже согласованность с локалью и форматом инвалидации блоклиста.
4. Кешировать вывод, зависящий от товаров/цен, **без** `account.products_basic_cache_key` — риск устаревшего HTML (если внутри кеша появятся товары, добавьте ключ по таблице выше).

---

## Бесконечная подгрузка каталога

`paginate.next.url` — URL следующей страницы списка товаров.

```liquid
<div class="catalog-list" data-collection-infinity="{{ paginate.next.url }}">
  …
</div>
```
