# Валидация info.json

Перед синхронизацией с бэкендом (`WidgetTypesFolderSyncService` / git sync) проверяй `info.json` локальным валидатором скилла:

```bash
node skills/insales-coder/scripts/validate-info-json.mjs path/to/widget-folder
# или
node skills/insales-coder/scripts/validate-info-json.mjs path/to/info.json
```

Self-test:

```bash
node skills/insales-coder/scripts/validate-info-json.mjs --self-test
```

Агент **обязан** запускать валидатор после создания или правки `info.json`.

---

## sku — только системные виджеты

| Виджет | Признак | sku в info.json |
|--------|---------|-----------------|
| Системный | `handle` начинается с `system_` | **Нужен** для `generation: 4` (формат `^[A-Z0-9]+$`, например `MW1`, `BB1`) |
| Кастомный | `handle` **не** начинается с `system_` | **Не указывать** — sku генерирует бэкенд (`WidgetTypesSkuService`) |

Если у кастомного виджета указать `sku`, бэкенд упадёт на валидации формата (`CU0.N` для custom, не `MW1`).

Экспорт кастомного виджета из темы (`ThemeWidgetType::ExportToHash`) **не включает** `sku` — это ожидаемое поведение.

---

## Обязательные поля

| Поле | Правило |
|------|---------|
| `type` | `SimpleWidgetType` / `block_list_widget_type` (snake_case тоже ок) |
| `handle` | Системный: `system_*`. Кастомный: `[a-zA-Z0-9_-]+`, без префикса `system_` |
| `name` | Строка или объект `{ ru, en, ua, es }` |
| `widget_category_handle` | Handle существующей категории |
| `page_kinds` | Непустой массив из: `all`, `index`, `collection`, `product`, `cart`, `page`, `search`, `blog`, `compare`, `favorite`, `article`, `shared_cart` |
| `widget_list_kinds` | Непустой массив из: `header`, `before_content`, `content`, `sidebar`, `after_content`, `footer`, `outside`, `top_panel`, `bottom_panel` |
| `generation` | `2`, `3` или `4` (для новых виджетов — `4`) |

### BlockListWidgetType

Дополнительно обязателен `block_template_handle` (handle системного или аккаунтного шаблона блока).

Для `SimpleWidgetType` поле `block_template_handle` **не должно** присутствовать.

---

## Опциональные поля

| Поле | Формат |
|------|--------|
| `description` | Строка или объект переводов |
| `libraries` | Массив handle библиотек: `commonjs_v2`, `jquery`, `my-layout`, `vanilla-lazyload`, `splide`, `splide3`, `fslightbox`, `micromodal`, `body-scroll-lock`, `js-cookie`, `cut-list`, `nouislider`, `microalert`, `tvist-v1` |
| `visibility` | Массив: `lite`, `service`, `pro` |

---

## Типичные ошибки бэкенда

| Ошибка | Причина |
|--------|---------|
| `type: Не указан тип виджета` | Пустое или отсутствующее `type` |
| `type: Поле type имеет неверное значение` | Неизвестный класс (не Simple/BlockList) |
| `handle: Должен начинаться с system_` | Системный виджет без префикса |
| `sku: ...` | Неверный формат sku или sku у кастомного виджета |
| `block_template: can't be blank` | BlockList без `block_template_handle` |
| `page_kinds / widget_list_kinds is not valid` | Значение вне допустимого enum |

Источник правил: `WidgetType`, `WidgetTypesFolderSyncService`, `WidgetTypeContract`.
