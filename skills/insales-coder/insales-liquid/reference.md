
# InSales Liquid: переменные и фильтры

## Когда читать этот скилл

- Liquid в темах и виджетах: `*.liquid`, блоки, `{% widget %}`, `block_lists`, `widget_lists`
- Вопросы «какое поле у product/collection/cart», «какой фильтр для URL/картинки/валюты»
- Отличия от «чистого» Shopify Liquid (у InSales свои объекты и фильтры)
- Ограничение выборки товаров/отзывов через `{% prefetch %}`

## Официальная документация (Liquidhub)

Полные списки и примеры — на сайте:

| Раздел | URL |
|--------|-----|
| Переменные (шпаргалка) | https://liquidhub.ru/collection/shpargalka-liquid |
| Фильтры | https://liquidhub.ru/collection/filtry-liquid |
| Операторы и теги (`if`, `for`, `capture`, `cache`) | на liquidhub.ru, раздел «Операторы» в навигации |

Если локального указателя в [fields.md](fields.md) недостаточно — открыть соответствующую страницу Liquidhub по объекту (Product, Collection, Cart и т.д.) или по имени фильтра.

## Локальная шпаргалка

Указатель объектов и полей (сжато; не дублирует всю шпаргалку): **[fields.md](fields.md)**. Полный список имён — на [liquidhub.ru](https://liquidhub.ru/collection/shpargalka-liquid).

Там же в fields: размеры картинок, `collection.menu_image`, кеш виджетов, `product \| json`, частые ошибки.

## Примеры кода

Готовые фрагменты по темам (кеш, каталог, цены, корзина, `block_lists`, JSON, `{% prefetch %}`): **[examples/README.md](examples/README.md)**. Полный набор фильтров с примерами: **[examples/filters-liquidhub-all.md](examples/filters-liquidhub-all.md)** (по [Liquidhub](https://liquidhub.ru/collection/filtry-liquid)).

## Рабочий порядок для агента

1. Определить контекст шаблона: страница товара, категории, корзина, заказ, виджет, глобальный layout.
2. Найти объект в [fields.md](fields.md) → при сомнении уточнить на Liquidhub по ссылкам выше.
3. Для фильтров: сначала таблица в fields → типовые сочетания — [examples/](examples/README.md) → при редких случаях — раздел фильтров на Liquidhub.
4. Не придумывать поля: сверяться с [fields.md](fields.md) и с [шпаргалкой Liquidhub](https://liquidhub.ru/collection/shpargalka-liquid). Исключение — **платформенные** переменные, которых может не быть в Liquidhub, но они описаны в reference (например `widget_basic_cache_key`, `account.collections_basic_cache_key`) или встречаются в официальных сниппетах; произвольные имена без такой опоры не вводить.

## Виджеты и контекст Liquid

В сниппетах виджетов 4 поколения обычно есть `settings` и данные блоков по шаблону блока. Глобальные объекты магазина (`product`, `collection`, `cart`, `account` и т.д.) совпадают с темой там, где это даёт страница. Если чего-то нет в Liquid — смотреть JSON/настройки виджета в редакторе и документацию темы, а не подставлять несуществующие переменные.
