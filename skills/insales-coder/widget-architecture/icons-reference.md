# Иконки шрифта insales-icons

Шрифт `insales-icons` — 82 иконки. Подключён на каждой странице магазина.

## Использование

```html
<i class="icon-cart"></i>
<i class="icon-search"></i>
<i class="icon-favorites-o"></i>
```

Иконки рендерятся через псевдоэлемент `:before`. Размер управляется через `font-size`.

## CSS-переменные символов

В стилях шрифта `insales-icons` в `:root` заданы переменные вида `--icon-code-{суффикс}` — в них лежит актуальный символ глифа (значение может меняться при обновлении шрифта). Суффикс совпадает с частью класса после `icon-`: класс `icon-cart` → `--icon-code-cart`.

Переменные объявляются вместе со стилями шрифта в бандле темы (пакет UI Kit / сгенерированный `style.css` иконочного шрифта).

## Полный список иконок

| Класс | CSS-переменная | Описание |
|---|---|---|
| `icon-angle-down` | `--icon-code-angle-down` | Угловая стрелка вниз |
| `icon-angle-left` | `--icon-code-angle-left` | Угловая стрелка влево |
| `icon-angle-right` | `--icon-code-angle-right` | Угловая стрелка вправо |
| `icon-angle-up` | `--icon-code-angle-up` | Угловая стрелка вверх |
| `icon-arrow-down` | `--icon-code-arrow-down` | Стрелка вниз |
| `icon-arrow-left` | `--icon-code-arrow-left` | Стрелка влево |
| `icon-arrow-right` | `--icon-code-arrow-right` | Стрелка вправо |
| `icon-arrow-up` | `--icon-code-arrow-up` | Стрелка вверх |
| `icon-bars` | `--icon-code-bars` | Бургер-меню (три полоски) |
| `icon-bell-slash` | `--icon-code-bell-slash` | Колокольчик перечёркнутый |
| `icon-bell` | `--icon-code-bell` | Колокольчик |
| `icon-calendar` | `--icon-code-calendar` | Календарь |
| `icon-camera` | `--icon-code-camera` | Камера |
| `icon-cart` | `--icon-code-cart` | Корзина (упрощённая) |
| `icon-check-square` | `--icon-code-check-square` | Галочка в квадрате |
| `icon-check` | `--icon-code-check` | Галочка |
| `icon-circle` | `--icon-code-circle` | Круг |
| `icon-clock` | `--icon-code-clock` | Часы |
| `icon-comments` | `--icon-code-comments` | Комментарии/чат |
| `icon-compare` | `--icon-code-compare` | Сравнение |
| `icon-content` | `--icon-code-content` | Контент |
| `icon-credit-card` | `--icon-code-credit-card` | Кредитная карта |
| `icon-desktop` | `--icon-code-desktop` | Монитор |
| `icon-dot-circle` | `--icon-code-dot-circle` | Круг с точкой (radio) |
| `icon-ellipsis-h` | `--icon-code-ellipsis-h` | Три точки горизонтально |
| `icon-ellipsis-v` | `--icon-code-ellipsis-v` | Три точки вертикально |
| `icon-envelope` | `--icon-code-envelope` | Конверт/письмо |
| `icon-exchange` | `--icon-code-exchange` | Обмен/стрелки в стороны |
| `icon-exclamation-triangle` | `--icon-code-exclamation-triangle` | Восклицательный знак в треугольнике |
| `icon-exclamation` | `--icon-code-exclamation` | Восклицательный знак |
| `icon-eye-slash` | `--icon-code-eye-slash` | Глаз перечёркнутый (скрыть) |
| `icon-eye` | `--icon-code-eye` | Глаз (показать) |
| `icon-favorites-f` | `--icon-code-favorites-f` | Избранное (заполненное сердце) |
| `icon-favorites-o` | `--icon-code-favorites-o` | Избранное (контур сердца) |
| `icon-favorites` | `--icon-code-favorites` | Избранное (альт.) |
| `icon-file-code-o` | `--icon-code-file-code-o` | Файл с кодом |
| `icon-filter` | `--icon-code-filter` | Фильтр |
| `icon-folder-open` | `--icon-code-folder-open` | Открытая папка |
| `icon-home` | `--icon-code-home` | Дом |
| `icon-info` | `--icon-code-info` | Информация (i) |
| `icon-laptop` | `--icon-code-laptop` | Ноутбук |
| `icon-life-bouy` | `--icon-code-life-bouy` | Спасательный круг |
| `icon-location-arrow` | `--icon-code-location-arrow` | Стрелка местоположения |
| `icon-long-arrow-down` | `--icon-code-long-arrow-down` | Длинная стрелка вниз |
| `icon-long-arrow-left` | `--icon-code-long-arrow-left` | Длинная стрелка влево |
| `icon-long-arrow-right` | `--icon-code-long-arrow-right` | Длинная стрелка вправо |
| `icon-long-arrow-up` | `--icon-code-long-arrow-up` | Длинная стрелка вверх |
| `icon-map-marker` | `--icon-code-map-marker` | Маркер на карте |
| `icon-minus-circle` | `--icon-code-minus-circle` | Минус в круге |
| `icon-minus` | `--icon-code-minus` | Минус |
| `icon-mobile` | `--icon-code-mobile` | Мобильный телефон |
| `icon-order` | `--icon-code-order` | Заказ |
| `icon-paper-plane` | `--icon-code-paper-plane` | Бумажный самолётик (отправить) |
| `icon-pencil` | `--icon-code-pencil` | Карандаш (редактировать) |
| `icon-phone` | `--icon-code-phone` | Телефон |
| `icon-photo` | `--icon-code-photo` | Фото/изображение |
| `icon-plus-circle` | `--icon-code-plus-circle` | Плюс в круге |
| `icon-plus` | `--icon-code-plus` | Плюс |
| `icon-preorder` | `--icon-code-preorder` | Предзаказ |
| `icon-question-circle` | `--icon-code-question-circle` | Вопрос в круге |
| `icon-question` | `--icon-code-question` | Вопросительный знак |
| `icon-search-minus` | `--icon-code-search-minus` | Поиск с минусом (уменьшить) |
| `icon-search-plus` | `--icon-code-search-plus` | Поиск с плюсом (увеличить) |
| `icon-search` | `--icon-code-search` | Поиск (лупа) |
| `icon-share-alt` | `--icon-code-share-alt` | Поделиться |
| `icon-shopping-cart` | `--icon-code-shopping-cart` | Корзина покупок |
| `icon-sliders` | `--icon-code-sliders` | Ползунки/настройки |
| `icon-sort-amount-asc` | `--icon-code-sort-amount-asc` | Сортировка по возрастанию |
| `icon-sort-amount-desc` | `--icon-code-sort-amount-desc` | Сортировка по убыванию |
| `icon-sort-asc` | `--icon-code-sort-asc` | Сортировка вверх |
| `icon-sort-desc` | `--icon-code-sort-desc` | Сортировка вниз |
| `icon-sort` | `--icon-code-sort` | Сортировка |
| `icon-square-o` | `--icon-code-square-o` | Пустой квадрат (checkbox off) |
| `icon-square` | `--icon-code-square` | Заполненный квадрат (checkbox on) |
| `icon-star-o` | `--icon-code-star-o` | Звезда контур |
| `icon-star` | `--icon-code-star` | Звезда заполненная |
| `icon-tasks` | `--icon-code-tasks` | Задачи/список |
| `icon-times` | `--icon-code-times` | Крестик (закрыть) |
| `icon-toggle-off` | `--icon-code-toggle-off` | Переключатель выключен |
| `icon-toggle-on` | `--icon-code-toggle-on` | Переключатель включён |
| `icon-trash` | `--icon-code-trash` | Корзина (удалить) |
| `icon-user` | `--icon-code-user` | Пользователь |

## Использование в SCSS

Предпочтительно брать символ из переменной, а не хардкодить код глифа:

```scss
.my-element::before {
  font-family: 'insales-icons';
  content: var(--icon-code-search);
}
```

В обычном CSS (без препроцессора) то же самое: `content: var(--icon-code-search);`

## Иконки редактора (icon_group)

В `settings_form.json` для типа `icon_group` в поле `icon` указывается **имя с префиксом `mdi-`** (как класс без `icon `): это другой набор, не шрифт `insales-icons` на витрине.

Полный алфавитный список из 240 имён и пример JSON → [icons-editor-reference.md](icons-editor-reference.md)
