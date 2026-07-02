
# Оптимизация фолбэка изображения категории в Liquid

## Задача

В виджетах часто используется фолбек: если у категории нет своего изображения, показывают картинку первого товара категории. Наивная реализация через `collection.products | first` приводит к загрузке до 100 товаров ради одного изображения.

**Решение:** использовать свойство `collection.menu_image`.

- `collection.menu_image` — изображение категории с фолбеком на изображение первого товара, у которого есть изображения; иначе заглушка `no_image`.
- Один доступ к свойству, без загрузки списка товаров.

## Когда применять

Искать в Liquid-файлах (snippet.liquid, шаблоны):

- `collection.products | first` или `*.products | first`
- Переменные вроде `collection_first_product`, `subcollection_first_product`, после которых используется `first_image` или проверка `images.size > 0` для подстановки картинки категории.

Если контекст — выбор изображения для отображения категории/коллекции (меню, каталог, слайдер категорий), заменить паттерн на `menu_image`.

## Паттерны замены

### 1. Фолбек при no_image (сначала проверка картинки категории)

**Было:**
```liquid
{% assign collection_photo = collection.image %}
{% if collection.image.original_url contains 'no_image'%}
  {% assign collection_first_product = collection.products | first %}
  {% if collection_first_product.images.size > 0 %}
    {% assign collection_photo = collection_first_product.first_image %}
  {% endif %}
{% endif %}
```

**Стало:**
```liquid
{% assign collection_photo = collection.menu_image %}
```

Имя переменной коллекции может быть другим (`block.collection`, `level_1_item`, `link`, `collection_item`, `subcollection`). Подставлять тот объект, по которому идёт цикл или из которого берётся изображение.

---

### 2. Сначала проверка products_count, потом первый товар

**Было:**
```liquid
{% if collection.products_count > 0 %}
  {% assign collection_first_product = collection.products | first %}
  {% if collection_first_product.images.size > 0 %}
    {% assign collection_photo = collection_first_product.first_image %}
  {% else %}
    {% assign collection_photo = collection.image %}
  {% endif %}
{% endif %}
```

**Стало:**
```liquid
{% assign collection_photo = collection.menu_image %}
```

Проверка `products_count` и вложенные условия не нужны: `menu_image` сам даёт либо картинку категории, либо первого товара с картинкой, либо no_image.

---

### 3. Переменная изображения уже есть, перезаписывается при no_image

**Было:**
```liquid
{% assign collection_img = link.image %}
{% if collection_img.original_url contains 'no_image'%}
  {% assign collection_first_product = link.products | first %}
  {% if collection_first_product.images.size > 0 %}
    {% assign collection_img = collection_first_product.first_image %}
  {% endif %}
{% endif %}
```

**Стало:**
```liquid
{% assign collection_img = link.menu_image %}
```

---

### 4. Разные имена переменных (subcollection, level_1_item и т.д.)

Правило одно: объект, у которого вызывался `.products | first` для получения картинки, заменяется на вызов `.menu_image` у того же объекта.

| Контекст в коде | Было | Стало |
|-----------------|------|--------|
| Цикл по подкатегориям | `subcollection.products \| first` → `subcollection_first_product.first_image` | `subcollection_photo = subcollection.menu_image` |
| Элемент меню (level_1) | `level_1_item.products \| first` → `collection_first_product.first_image` | `collection_photo = level_1_item.menu_image` |
| Ссылка/блок в меню | `link.products \| first` → `collection_first_product.first_image` | `collection_img = link.menu_image` |
| Элемент слайдера | `collection_item.products \| first` → … | `collection_photo = collection_item.menu_image` |
| Блок с коллекцией | `block.collection.products \| first` → … | использовать `block.collection.menu_image` |

Имена переменных для итогового изображения (`collection_photo`, `collection_img`, `subcollection_photo`) можно оставить как в исходном коде, чтобы меньше менять разметку ниже.

## Что удалить после замены

- Все строки с `assign ... = ... products | first`.
- Условия `if collection.image.original_url contains 'no_image'` и внутренние блоки, которые только подставляли первый товар.
- Условия `if ... products_count > 0` и связанные с ними ветки с `collection_first_product` и `first_image`.
- Опционально: обнуление переменных вроде `subcollection_first_product = null` в конце шаблона, если они больше нигде не используются.

## Обработка no_image при выводе

**`menu_image` есть только у коллекций** (и объектов вроде `collection`, `link` при ссылке на коллекцию, `block.collection`). У **статей** свойства `menu_image` **нет** — для картинки статьи используется своё поле (например `article.image`); этот скилл про фолбек категории к `menu_image` на статьи не распространяется.

У **`block.image` заглушки `no_image` не бывает** — проверку `contains 'no_image'` перед `image_url` для изображения блока не добавляем.

`menu_image` и `collection.image` при отсутствии изображения могут возвращать заглушку `no_image`. Такое изображение **нельзя ресайзить** через `image_url` — это приведёт к ошибке или битой картинке.

Паттерн вывода — проверять `large_url` перед ресайзом:

```liquid
{% unless collection_img.large_url contains 'no_image' %}
  <picture>
    <source media="(max-width:480px)" srcset="{{ collection_img | image_url: img_width_mobile, format: 'webp', resizing_type: 'fit_width', quality: 100 }}" type="image/webp">
    <img src="{{ collection_img | image_url: img_width, height: img_height, resizing_type: 'fill-down', quality: 100 }}" loading="lazy" alt="{{ img_title }}">
  </picture>
{% else %}
  <img src="{{ collection_img.large_url }}" loading="lazy" alt="{{ img_title }}">
{% endunless %}
```


---

## Что проверить после правки

1. В выводе используется одна переменная изображения (например, `collection_photo` или `collection_img`); она везде должна задаваться через `... = object.menu_image`.
2. Ниже по шаблону нет обращений к старой переменной первого товара (`collection_first_product`, `subcollection_first_product` и т.п.); если есть — удалить или заменить логику.
3. Размеры/форматы картинки (small_url, large_url, image_url с параметрами) оставить как были — `menu_image` возвращает тот же тип объекта (изображение) с теми же полями.
4. Вывод изображения обёрнут в проверку `unless ... contains 'no_image'` — ресайз через `image_url` не применяется к заглушке.

## Поиск мест для замены

Искать в проекте:

- `products | first` в Liquid-файлах.
- `collection_first_product`, `subcollection_first_product` и похожие имена.
- Рядом — использование `.first_image` или `.images.size` для подстановки изображения категории/пункта меню.

Во всех таких местах, где цель — показать изображение категории с фолбеком на первый товар, применить замену на `{объект_коллекции}.menu_image`.
