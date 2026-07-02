# Примеры Liquid (InSales)

Все файлы примеров находятся в этом каталоге скилла. Фрагменты упрощены или обрезаны; смысл API сохранён. По смыслу близки к типичному Liquid **витрины** и **виджетов 4 поколения** InSales. Имена `widget_settings`, `messages`, CSS-классов — условные.

| Файл | Тема |
|------|------|
| [filters-liquidhub-all.md](filters-liquidhub-all.md) | Все фильтры InSales Liquid — примеры по [Liquidhub](https://liquidhub.ru/collection/filtry-liquid) |
| [collections-cache-paginate.md](collections-cache-paginate.md) | `{% cache %}` с `widget_basic_cache_key` / `account.collections_basic_cache_key` / `data.basic_cache_key`, `menu_image`, `image_url`, `paginate` |
| [prefetch.md](prefetch.md) | `{% prefetch %}` — лимит и сортировка товаров/отзывов, `prefetch_count`, комбинация с `{% cache %}` |
| [catalog-search-filter.md](catalog-search-filter.md) | Каталог, поиск, `filter`, `collection`, `where`, `strip_html`, `truncatewords` |
| [products-prices-variants.md](products-prices-variants.md) | Цены `money`, `price_varies?`, варианты, отзывы, форма + `cart_url` |
| [cart-forms-money.md](cart-forms-money.md) | `cart_url`, `add_param`, `times` / `plus`, цены позиций |
| [block-lists-and-strings.md](block-lists-and-strings.md) | `block_lists`, циклы по блокам, `capture`, `split`, `prepend`, `remove` |
| [json-and-html.md](json-and-html.md) | `json`, `escape` в data-атрибутах |
| [video-filters.md](video-filters.md) | Работа со ссылками на видео (`video_preview_by_url`, `video_iframe_by_url`), YouTube, VK, Vimeo |

Дополняют [fields.md](../fields.md) и [Liquidhub](https://liquidhub.ru/collection/shpargalka-liquid).
