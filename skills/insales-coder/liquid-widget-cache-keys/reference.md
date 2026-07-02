
# Обновление ключей кеша в виджетах (Liquid)

## Задача

Привести ключи кеша в виджетах к единому формату на основе базовых ключей кеша. Тег `cache` создаёт временный кеш с ограниченным временем жизни; при смене ключа кеш обновляется.

## Принцип: что внутри блока кеша

Внутри `{% cache %}…{% endcache %}` может быть любой вывод: товары, категории, меню, статьи, отзывы, блоки блоклиста и т.д. **Ключ кеша собирают по фактическому содержимому блока:** для каждой сущности, данные которой попадают в HTML внутри кеша, в ключ добавляют соответствующий **базовый ключ**:

| Что рендерится внутри кеша | Добавить в ключ |
|----------------------------|-----------------|
| товары, цены, остатки, корзина и т.п. | `account.products_basic_cache_key` |
| категории, дерево каталога, картинки коллекций | `account.collections_basic_cache_key` |
| меню / линклисты (цикл по `linklists`) | `account.linklists_basic_cache_key` |
| статьи / блог | `account.blogs_basic_cache_key` |
| отзывы | `account.reviews_basic_cache_key` |
| контент из блоков виджета (блоклист) | `data.basic_cache_key` |

Почти всегда в ключ входит **widget_basic_cache_key** (виджет, настройки, виджет-тайп). Если в одном блоке и товары, и категории — в ключ нужны **оба** `products_basic_cache_key` и `collections_basic_cache_key`, иначе при обновлении одной сущности кеш не сбросится. Для меню действует развилка: если внутри кеша есть **цикл по linklists** — добавляй `linklists_basic_cache_key`; если **linklists не используются** и внутри только цикл по `collections`, используй `collections_basic_cache_key`.

## Правила замен

1. **Вместо** `{{ collections.last_updated_at }}` **использовать** `{{ account.collections_basic_cache_key }}`.
2. **Во все ключи виджета добавлять** `{{ widget_basic_cache_key }}`.
3. **Если в ключе есть** `{{ widget_basic_cache_key }}` **— из ключа убирать все ключи настроек** (все вхождения вида `{{ widget_settings.* }}`), например:  
   `{{ widget_settings.hide-menu-photo }}_{{ widget_settings.subcollections-items-limit }}`,  
   `{{ widget_settings.count-collections }}`,  
   `{{ widget_settings.limit }}` и т.п.
4. **Замена data.id / data.updated_at на базовый ключ:** если ключ кеша содержит **оба** фрагмента `{{ data.id }}` и `{{ data.updated_at }}` (не важно, стоят ли они рядом, в каком порядке и разделены ли другими частями ключа) — в итоге в ключе должен остаться **только** `{{ data.basic_cache_key }}` (а отдельные `{{ data.id }}` и `{{ data.updated_at }}` нужно удалить).
5. **Удаление локали:** `widget_basic_cache_key`, `data.basic_cache_key` и `account.*_basic_cache_key` уже включают локаль, поэтому `{{ language.locale }}` в ключах с базовыми ключами нужно удалять всегда, даже если оно записано с переносами строк/пробелами внутри фигурных скобок (например `{{ language.locale\n}}`).

`widget_basic_cache_key` нужен в ключе даже когда настройки не используются: по нему удаляются старые версии кеша и при обновлении кода внутри блока с кешем вёрстка обновится без смены префикса ключа (например `cache_block_list_key_ci4_`).

---

## Из чего состоят базовые ключи (факты)

- **data.basic_cache_key** — идентификатор блоклиста и дата обновления блоков этого блоклиста (и локаль).
- **account.collections_basic_cache_key** — сбрасывается при смене картинок коллекций, в остальном аналогичен по смыслу `collections.last_updated_at` (версия коллекций + локаль).
- **widget_basic_cache_key** — id виджета, widget_list_id, widget_type_id, последнее обновление виджета и виджет-тайпа, позиция, текущий язык. Уже учитывает последнее обновление настроек, поэтому перечислять `widget_settings` в ключе не нужно.

У аккаунта также есть другие базовые ключи кеша (для согласованности именования и выбора ключа при работе с другими сущностями):

- **account.collections_basic_cache_key** — коллекции (версия + локаль).
- **account.products_basic_cache_key** — товары (версия товаров, локаль, настройки витрины: скрытие отсутствующих, валюта, кнопка корзины, маркетплейс, режим продаж, отзывы, группа клиента, BNPL, мультисклад).
- **account.blogs_basic_cache_key** — блоги (версия блогов + локаль).
- **account.reviews_basic_cache_key** — отзывы (версия отзывов, включены ли отзывы, локаль).
- **account.linklists_basic_cache_key** — меню/линклисты (изменения в категориях, блогах, страницах и самих линклистах + локаль).

**widget_basic_cache_key** доступен во всех виджетах. Он сбрасывает кеш при изменении настроек виджета, а также хранит id виджета и дату обновления виджет-тайпа.

---

## Использование базовых ключей по типам контента

Сначала смотри, что именно рендерится внутри `{% cache %}` (см. таблицу выше), затем подключай нужные базовые ключи. Ниже — типовые комбинации для целых виджетов.

### Виджет со списком товаров (блоклист + товары + категории)

Кеш должен сбрасываться при изменении товаров, категорий (в т.ч. позиций товара в каталоге), блоков виджета и настроек виджета.

```liquid
{% capture cache_widget %}{{ widget_basic_cache_key }}_{{ data.basic_cache_key }}_{{ account.products_basic_cache_key }}_{{ account.collections_basic_cache_key }}{% endcapture %}
{% cache cache_widget %}
  ...
{% endcache %}
```

- **widget_basic_cache_key** — сброс при смене настроек виджета; id виджета и дата обновления виджет-тайпа.
- **data.basic_cache_key** — id и дата обновления блоков, привязанных к виджету.
- **account.products_basic_cache_key** — последнее обновление любого раздела, связанного с товарами.
- **account.collections_basic_cache_key** — последнее обновление любого раздела, связанного с категориями; в виджете товаров нужен, чтобы при смене позиций товара в каталоге виджет сбросил кеш.

### Виджет со статьями (блог)

Кеш зависит только от виджета и от контента блогов.

```liquid
{% capture cache_key %}{{ widget_basic_cache_key }}_{{ account.blogs_basic_cache_key }}{% endcapture %}
{% cache cache_key %}
  ...
{% endcache %}
```

- **widget_basic_cache_key** — настройки виджета и обновление виджет-тайпа.
- **account.blogs_basic_cache_key** — последнее обновление статей/блогов.

### Виджет меню / линклиста

Выбор ключа зависит от источника данных внутри кеша:

- если внутри есть цикл по `linklists` — использовать `account.linklists_basic_cache_key`;
- если `linklists` нет и внутри только цикл по `collections` — использовать `account.collections_basic_cache_key`.

```liquid
{%- comment -%} Меню строится по linklists {%- endcomment -%}
{% capture cache_menu_key %}{{ widget_basic_cache_key }}_{{ account.linklists_basic_cache_key }}{% endcapture %}
{% cache cache_menu_key %}
  ...
{% endcache %}
```

```liquid
{%- comment -%} Меню строится только по collections {%- endcomment -%}
{% capture cache_menu_collections_key %}{{ widget_basic_cache_key }}_{{ account.collections_basic_cache_key }}{% endcapture %}
{% cache cache_menu_collections_key %}
  ...
{% endcache %}
```

### Виджет с отзывами

Подключить **account.reviews_basic_cache_key**, если вывод зависит от отзывов.

---

## Примеры (рефакторинг старых ключей)

### Ключ только по коллекциям и настройкам

**До:**
```liquid
{% capture cache_collections_key %}cache_collections_key_ci2_{{ collections.last_updated_at }}_{{ language.locale }}_{{ widget_settings.count-collections }}{% endcapture %}
```

**После:**
```liquid
{% capture cache_collections_key %}cache_collections_key_ci2_{{ widget_basic_cache_key }}_{{ account.collections_basic_cache_key }}{% endcapture %}
```

### Ключ по блоклисту (data) и коллекциям

**До:**
```liquid
{% capture cache_block_list_key %}cache_block_list_key_ci4_{{ data.id }}_{{ data.updated_at }}_{{ collections.last_updated_at }}_{{ language.locale }}{% endcapture %}
```

**После:**
```liquid
{% capture cache_block_list_key %}cache_block_list_key_ci4_{{ widget_basic_cache_key }}_{{ data.basic_cache_key }}_{{ account.collections_basic_cache_key }}{% endcapture %}
```

### Ключ по блоклисту, когда data.id и data.updated_at разнесены

Если `{{ data.id }}` и `{{ data.updated_at }}` встречаются в ключе **в разных местах** (между ними могут быть другие части ключа), всё равно заменяем их на `{{ data.basic_cache_key }}` и добавляем `{{ widget_basic_cache_key }}`:

**До:**
```liquid
{% capture cache_block_collections_key %}cache_block_collections_key_ps9_{{ data.id }}_{{ collections.last_updated_at }}_{{ data.updated_at }}_{{ language.locale }}_{{widget_settings.collection-handle}}_{{widget_settings.hide-menu}}_{{widget_settings.hide-block-content}}{% endcapture %}
```

**После:**
```liquid
{% capture cache_block_collections_key %}cache_block_collections_key_ps9_{{ data.basic_cache_key }}_{{ account.collections_basic_cache_key }}_{{ widget_basic_cache_key }}{% endcapture %}
```

### Ключ с несколькими настройками

**До:**
```liquid
{% capture cache_menu_key %}cache_menu_key_hm1_{{ collections.last_updated_at }}_{{ language.locale }}_{{ widget_settings.hide-menu-photo }}_{{ widget_settings.subcollections-items-limit }}_{{ widget_basic_cache_key }}{% endcapture %}
```

**После:**  
Настройки убираем, `collections.last_updated_at` и `language.locale` заменяем на базовые ключи. В этом примере меню завязано на `linklists`, поэтому используем `account.linklists_basic_cache_key` (локаль уже внутри `widget_basic_cache_key` и `account.linklists_basic_cache_key`):
```liquid
{% capture cache_menu_key %}cache_menu_key_hm1_{{ widget_basic_cache_key }}_{{ account.linklists_basic_cache_key }}{% endcapture %}
```

### Ключ без data, только collections и level_limit (без linklists)

Если в ключе есть переменные вроде `level_limit` (не настройки виджета, а контекст уровня меню), их оставляем:

**До:**
```liquid
{% capture cache_menu_key %}cache_menu_key_hc1_{{ collections.last_updated_at }}_{{ language.locale }}_{{ level_limit }}{% endcapture %}
```

**После:**
```liquid
{% capture cache_menu_key %}cache_menu_key_hc1_{{ widget_basic_cache_key }}_{{ account.collections_basic_cache_key }}_{{ level_limit }}{% endcapture %}
```

---

## Чеклист при обновлении ключа

- [ ] `collections.last_updated_at` заменён на `account.collections_basic_cache_key`
- [ ] В ключ добавлен `widget_basic_cache_key`
- [ ] Все `widget_settings.*` убраны из ключа
- [ ] `data.id` и `data.updated_at` (даже если они разнесены по ключу) заменены на `data.basic_cache_key`
- [ ] Все вхождения `language.locale` удалены (в том числе «разорванные» переносами строк)
- [ ] Контекстные переменные (например `level_limit`), не являющиеся настройками виджета, при необходимости оставлены в ключе
- [ ] Для меню с циклом по `linklists` используется `account.linklists_basic_cache_key`
- [ ] Если `linklists` не используются и внутри только `collections`, используется `account.collections_basic_cache_key`
- [ ] Префикс ключа (например `cache_block_list_key_ci4_`) можно не менять при обновлении кода блока
