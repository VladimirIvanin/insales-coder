# InSales Liquid — локальный указатель

**Основной публичный справочник** полей и примеров — [шпаргалка переменных на liquidhub.ru](https://liquidhub.ru/collection/shpargalka-liquid) и [фильтры](https://liquidhub.ru/collection/filtry-liquid). Здесь — компактные таблицы; если поля нет в этом файле, сначала ищите его на Liquidhub в разделе объекта (Product, Collection, …).

**Liquidhub не исчерпывающий:** часть переменных платформы в шпаргалке **не описана**, но доступна в Liquid (часто в контексте **виджетов 4 поколения** или кеша). Примеры:

| Переменная | Зачем |
|------------|--------|
| `widget_basic_cache_key` | Версия виджета, настроек и типа — для ключа `{% cache %}` |
| `data.basic_cache_key` | Версия блоклиста, привязанного к виджету |
| `account.collections_basic_cache_key` | Версия каталога/коллекций для инвалидации кеша |
| `account.products_basic_cache_key` | Версия товаров/витрины для инвалидации кеша |

Правила сборки ключей и антипаттерны — [examples/collections-cache-paginate.md](examples/collections-cache-paginate.md). Другие «скрытые» поля встречаются в системных сниппетах и коде платформы: при сомнении — временно `{% help account %}`, `{% help widget %}` (если поддерживается в контексте) на **тестовой** витрине, либо поиск по шаблонам темы/виджетов.

Фрагменты кода: [examples/README.md](examples/README.md), все фильтры: [examples/filters-liquidhub-all.md](examples/filters-liquidhub-all.md).

**Отладка:** в шаблоне можно временно вывести `{% help %}` или `{% help product %}` — список доступных свойств в контексте (не для продакшена).

---

## Объекты и где они доступны (кратко)

| Объект | Назначение | Подсказка |
|--------|------------|-----------|
| `product` | Товар | `product.liquid`, цикл `collection.products`, поиск |
| `collection` | Категория | `collection.liquid`, меню, виджеты с категорией |
| `collections` | Дерево категорий | `collections.all`, `collections.handle`, `collections.flatten` |
| `cart` | Корзина | Во всех шаблонах |
| `account` | Настройки магазина | Телефон, валюта, флаги, доставка/оплата |
| `article`, `blog`, `blogs` | Статьи и блоги | Шаблоны блога/статьи |
| `page` | Текстовая страница | `page.content`, лимит символов большой (см. Liquidhub → Page) |
| `search` | Поиск | `search.performed?`, `search.results` |
| `order` | Оформленный заказ | Страница успеха, `order.items` |
| `client`, `client_group` | Покупатель | Без вывода персональных данных клиента лишний раз |
| `linklists`, `linklists.handle.links` | Меню | Пункты: `link.url`, `link.title`, `link.current?` |
| `block_lists` | Панели блоков | `block_lists.footer.blocks`, `block.title`, `block.content` |
| `blocks.handle` | Один блок по пермалинку | См. `blocks.with_template` в Liquidhub (раздел block) |
| `widget_lists` | Виджеты темы | `widget_lists['handle'].widgets`, `{% widget widgetDrop %}` |
| `language`, `languages` | Языки | `language.locale`, `language.switch_url`; в формах поиска учитывать `language.not_default?` |
| `paginate` | Пагинация | Внутри `{% paginate %}…{% endpaginate %}` |
| `request` | Запрос | `request.path`, `request.base_url` |
| `filter` | SEO-фильтр категории | Когда открыт фильтр: `filter.title`, `filter.description` |

---

## Частые поля: `product`

Цены: `price`, `price_min` / `price_max`, `price_varies?`, `old_price`, `old_price_min` / `old_price_max`, `old_price_varies?` — форматирование через `| money`.

Остальное: `title`, `url`, `handle`, `id`, `available`, `description`, `short_description`, `variants`, `show_variants?`, `options`, `properties`, `property_by_handle`, `collections`, `related_products`, `similar_products`, `related_articles`, `reviews`, `reviews_count`, `rating`, `fields`, `meta_description`, `meta_keywords`, `is_bundle`, `bundle_components`, `bundle_discount`, `canonical_collection`, `base_price`, `sale_price` (в т.ч. в комплектах у компонентов), `video_links` (фильтры видео: см. [examples/video-filters.md](examples/video-filters.md)), `updated_at`, `unit`, `sku` (если доступен в контексте шаблона).

Вложенность параметров: `product.properties.handle.characteristics`, у характеристики `name`, `handle`, `url` (в коллекции), `products_count`, `current?`.

JSON: `{{ product | json }}` — в документации указано использование в шаблоне товара; не рассчитывать на то же везде.

---

## Частые поля: `collection`

`title`, `url`, `handle`, `id`, `description`, `seo_description`, `products`, `products_count`, `subcollections`, `parent`, `image`, **`menu_image`** (картинка категории с фолбеком на первый товар с изображением, иначе `no_image`), `properties`, `options`, `filters`, `current_collections`, `current?`, `level`, `fields`, `meta_description`, `meta_keywords`, `next_product` / `previous_product` (навигация в карточке в контексте категории).

Дерево: `collections.flatten` + флаги `first?`, `last?`, `show?`, `level_difference` — см. примеры на Liquidhub.

`collections.root_category`, `collection.show_subcollections?`, `collection.current_option_values`, `collection.current_characteristics`, `collection.current_numeric_properties`, `collection.menu_image`.

---

## `variant` (элемент `product.variants`)

`id`, `available`, `title`, `price`, `old_price`, `sku`, `barcode`, `quantity`, `weight`, `option_values` (у значения: `option_name.title`, `title`), `first_image` (те же URL, что у товара), `cost_price`, `fields` (кастомные поля по пермалинку), `variant_price_kinds`, `dimensions` (`width`, `depth`, `height`), `has_image?`, `image_ids`, `quantity_at_warehouses`.

---

## `account` (расширение)

Помимо таблицы выше: `email`, `url` (бэк-офис из письма), `icq`, `subdomain`, `currency_code`, `currency_iso_code` (если есть в шаблоне), `reviews_enabled?`, `reviews_moderated?`, `enable_clients?`, `enable_comparison?`, `hide_items_out_of_stock`, `forbid_order_over_existing`, `minimum_items_price`, `order_line_comments_enabled`, `delivery_variants` (`id`, `title`, `price`, `description`, `charge_up_to`), `payment_gateways` (`id`, `title`), `bonus_system` и вложенные поля, `social_net_profiles` (`link`, `network_name`, `account_name`), `warehouses` (`id`, `title`), `reviews` / `reviews_not_spam` / `reviews_spam`, `site_currencies`, `allow_change_site_currency`, `quick_checkout` (поля включения и текстов диалога).

**Кеш (часто не в Liquidhub):** `collections_basic_cache_key`, `products_basic_cache_key`, при необходимости `blogs_basic_cache_key`, `reviews_basic_cache_key` — строки-версии для ключей `{% cache %}`. См. таблицу в начале файла и [collections-cache-paginate.md](examples/collections-cache-paginate.md).

---

## `order` и позиция заказа

`order.items`, `order.number`, `order.id`, `order.key`, `order.total_price`, `order.items_price`, `order.currency`, `order.creation_date`, `order.comment`, `order.client` (имя, телефон, email и т.д.), `order.shipping_address`, `order.delivery_title`, `order.delivery_price`, `order.delivery_date`, `order.delivery_time`, `order.payment_title`, `order.margin`, `order.paid?`, `order.payment_needed?`, `order.pay_url`, `order.fulfillment_status`, `order.customer_status`, `order.custom_status_title`, `order.fields` / `all_fields` / `result_fields`, `order.manager_comment`, `order.first_time_loading_page?`, `order.delivery_info.outlet.*`, `order.manager`.

У позиции в `order.items`: `title`, `quantity`, `total_price`, `sku`, `product` при наличии.

---

## `article`, `blog`, теги

`article.title`, `url`, `id`, `content`, `preview`, `author`, `created_at`, `updated_at`, `image`, `tags`, `comments_enabled?`, `moderated?`, `comments`, `comments_count`, `related_products`.

`blog.title`, `handle`, `id`, `url`, `articles`, `tags`, `comments_enabled?`, `moderated?`.

---

## `review` (в `product.reviews`)

`author`, `email`, `content`, `rating`, `created_at`, `errors`, `action_url`, `captcha_enabled?`, `manager_reply`, `replied?`, `replied_at`, `image`.

---

## `link` (в `linklists.*.links`)

`title`, `url`, `current?`.

---

## `discount` (в `cart.discounts`)

`description`, `amount`, `type`, `percent`.

---

## `search` (дополнительно)

`search.performed?`, `search.query`, `search.results` — массив товаров; в части виджетов каталога встречается `search.results.products` — сверять с вашим шаблоном.

---

## Глобальные вспомогательные

`template` (имя шаблона), `settings` / настройки темы, `messages` / `widget_messages` в виджетах, `cart_url`, `search_url`, `description` (meta), `current_page` (номер страницы в контексте пагинации), `products` (массив на странице каталога), `image` как тип полей изображения.

---

## Частые поля: `cart` и позиция `item`

`cart.items`, `items_count`, `items_price`, `total_price`, `items_weight`, `discounts`, купоны: `enable_coupon?`, `coupon`, `invalid_coupon?`, `coupon_error`.

У позиции: `item.product`, `item.variant`, `item.quantity`, `item.sale_price`, `item.total_price`, `item.title`, `item.url` (удаление), `item.id` для полей формы, `item.comment` (если включено в аккаунте).

---

## Изображения (общее)

У товара/коллекции/статьи объект картинки даёт URL:

- `small_url` (48×48), `thumb_url` (100×100), `compact_url` (160×160), `medium_url` (240×240), `large_url` (480×480), `original_url`

Фильтры InSales для ресайза и webp — в таблице фильтров ниже (`image_url`, `webp_picture_tag`). К ассетам темы (`asset_url`) `image_url` **не** применяется.

---

## Фильтры: массивы и строки

Из [фильтров Liquidhub](https://liquidhub.ru/collection/filtry-liquid):

- Массивы: `size`, `first`, `last`, `split`, `join`, `reverse`, `sort`, `map`, `where`, `concat`, `uniq`
- Строки: `append`, `prepend`, `escape`, `strip_html`, `truncate`, `truncatewords`, `replace`, `remove`, `upcase`, `downcase`, `newline_to_br`, `url_encode`, `url_decode`
- Числа: `plus`, `minus`, `times`, `divided_by`, `round`, `modulo`, `to_integer`
- Прочее: `default`, `date`, `json`, `custom_json` (выбор полей для JSON)

---

## Фильтры и теги специфичные для InSales

| Имя | Назначение |
|-----|------------|
| `money` | Цена с символом валюты по настройкам магазина |
| `asset_url` | Файл из темы (даже отсутствующий даст URL → 404) |
| `asset_url_if_exists` | URL файла темы или пустая строка |
| `file_url` | Файл из «Сайт → Файлы» |
| `add_param` | Добавить GET-параметр к URL |
| `locale_url` | URL с учётом текущего языка |
| `image_url` | Ресайз изображения товара/коллекции/статьи (16–2048 px), опции `format`, `resizing_type: 'fit_width'` |
| `webp_picture_tag` | `<picture>` с webp + img |
| `select_option` | Генерация `<option>` для `<select>` |
| `link_to` | Ссылка `<a>` |
| `md5` | Хеш строки |
| `dark?`, `change_lightness` | Работа с hex-цветами |
| `file_type_by_url` | Тип файла по URL (image/video/…) |
| `{% cache key %}…{% endcache %}` | Фрагментный кеш; в виджетах ключ из **базовых** частей: `widget_basic_cache_key`, при необходимости `data.basic_cache_key`, `account.collections_basic_cache_key` / `products_basic_cache_key` и т.д. (см. [collections-cache-paginate.md](examples/collections-cache-paginate.md)) |
| `{% prefetch col limit N[, sort: '…'][, offset: N][, only_available: true] %}…{% endprefetch %}` | Ограничивает SQL-выборку товаров коллекции или отзывов (`account.reviews*`); без него `for … limit:` режет только Liquid-итерацию, но не запрос. Внутри блока у **переменной коллекции** (той же, что передана в тег) доступен метод `prefetch_count` — реальное число подгруженных элементов. Вызывать как `collection.products.prefetch_count`, `product.similar_products.prefetch_count`, `account.reviews_not_spam.prefetch_count` — **не** на родительском объекте (`product.prefetch_count` не существует). Подробнее и таблицы сортировок — [examples/prefetch.md](examples/prefetch.md) |
| `{% help %}` / `{% help object %}` | Отладка доступных полей (не для продакшена) |

Теги управления: `if` / `unless` / `case`, `for` с `limit` и `offset`, `break`, `continue`, `cycle`, `capture`, `paginate`.

---

## Типичные ошибки

1. **Путать `collection.image` и `collection.menu_image`** — для карточек категорий в меню и списках выгоднее `menu_image`, чтобы не грузить `collection.products` ради фолбека.
2. **`image_url` на ассетах темы** — не поддерживается; для media темы использовать `asset_url` / обычные пути.
3. **Язык в формах** — для неосновного языка передавать `lang` (см. пример `search_url` с `language.not_default?` на Liquidhub).
4. **Подчёркивание в handle виджет-листов** — в setup.json для handle виджет-листов запрещено `_` (см. раздел Виджеты в шпаргалке Liquidhub).

---

## Блоки с шаблоном

Доступ через `block_lists.with_template['template_handle'].panel_handle.blocks` и `blocks.with_template['template_handle'].block_handle` — точный синтаксис и примеры: раздел **block** на [шпаргалке](https://liquidhub.ru/collection/shpargalka-liquid).

---

## Виджеты в setup.json

Создание типов и списков: поля `widget_types`, `theme_widgets` / `widget_lists`; в Liquid — `widget_lists.handle.widgets`. Подробнее: тот же раздел **Виджеты** в шпаргалке Liquidhub.
