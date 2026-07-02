# Фильтры для видео (YouTube, Rutube, Vimeo, Kinescope)

В InSales Liquid есть специальные фильтры для работы со ссылками на видео, которые обычно хранятся в `product.video_links` (или могут быть произвольными строками).

## `video_preview_by_url`

**Назначение:** вернуть **URL картинки-превью** (строка), а не HTML.

### Поддерживаемые хостинги

Платформа определяет сервис по **подстроке в URL** (регистр не важен):

| Сервис | Условие распознавания | Примеры ссылок |
|--------|----------------------|----------------|
| **YouTube** | в URL есть `youtu` | `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…` |
| **Rutube** | в URL есть `rutube` | `rutube.ru/video/…` |
| **Vimeo** | в URL есть `vimeo` | `vimeo.com/123456789` |
| **Kinescope** | в URL есть `kinescope` | `kinescope.io/…` |

Другие площадки (VK, Dzen, собственный CDN и т.п.) **не считаются поддерживаемыми** для получения превью.

### Когда результат пустой

Фильтр отдаёт **пустую строку** (или `nil` в контексте Liquid), если:
- URL **не относится** ни к одному из четырёх поддерживаемых сервисов;
- для **Kinescope** не удалось получить постер через API;
- передан не строковый аргумент (приводит к ошибке `ArgumentError`).

Для неподдерживаемого хостинга превью **не подставляется** и не угадывается.

---

## `video_iframe_by_url`

**Назначение:** вернуть готовую разметку **`<iframe>…</iframe>`** для вставки в HTML (в Liquid выводится как HTML, не экранируется как текст).

### Размеры и атрибуты по умолчанию

По умолчанию: ширина `600`, высота `400`, `id` — `video_{тип}_{video_id}`.

Можно передать опции:
```liquid
{{ product.video_url | video_iframe_by_url: width: 960, height: 540, id: 'hero-video' }}
```

### Неподдерживаемые URL — «универсальный» iframe

Если хостинг **не распознан**, фильтр **всё равно возвращает iframe**, но:
- в `src` подставляется **исходный URL** как есть;
- без дополнительных `allow` / `loading` и пр.;
- `id` по умолчанию: `video_custom_{6 символов хеша URL}` (стабильно для одной и той же ссылки).

То есть для VK и прочих ссылок **пустоты не будет** — будет простой iframe с вашей ссылкой (работоспособность зависит от того, отдаёт ли этот URL встраиваемый контент).

---

## Примеры в шаблоне

### 1. Вывод превью или запасного варианта

Если видео не поддерживается (например, VK), `video_preview_by_url` вернёт пустоту. В таком случае можно подставить запасную заглушку-картинку:

```liquid
{% assign video_preview_url = link.url | video_preview_by_url %}
{% assign video_unsupported = false %}

{% unless video_preview_url %}
  {% assign video_unsupported = true %}
  {% assign video_preview_url = 'https://static.insales-cdn.com/files/1/4301/24817869/original/play-button.png' %}
{% endunless %}

<img src="{{ video_preview_url }}" alt="Превью видео">
```

### 2. Вывод iframe

`video_iframe_by_url` сгенерирует iframe в любом случае, даже для неподдерживаемого видео (как простой iframe). 

Но если в старом коде (как в `system_widget_v4_product_1`) применялся ручной вывод iframe для неподдерживаемых:
```liquid
{% if video_unsupported %}
  <iframe src='{{ link.url }}' width='600' height='400' id='{{ video_id }}'></iframe>
{% else %}
  {{ link.url | video_iframe_by_url: width: 600, height: 400, id: video_id }}
{% endif %}
```
То теперь можно полагаться на то, что `video_iframe_by_url` сам умеет оборачивать неподдерживаемые ссылки в iframe. Однако старый подход с ручным iframe или собственной логикой (например, для локальных `.mp4` на статике) всё ещё работает и применяется.

### 3. Локальные видео (.mp4)

Если ссылка ведёт напрямую на mp4 файл (например, на `static.insales-cdn.com`), эти фильтры **не** вернут плеер или превью. 
Для прямых ссылок на видео необходимо проверять строку и вручную использовать тег `<video>`:

```liquid
{% if link.url contains "https://static.insales-cdn.com" %}
  <video autoplay muted loop playsinline width="100%">
    <source src="{{ link.url }}" type="video/mp4">
  </video>
{% else %}
  {{ link.url | video_iframe_by_url: width: 600, height: 400 }}
{% endif %}
```

## Сравнение фильтров

| | `video_preview_by_url` | `video_iframe_by_url` |
|--|------------------------|------------------------|
| Результат | URL картинки | HTML `<iframe>` |
| Неподдерживаемый хостинг | пусто | iframe с исходным URL |
| Опции | нет | `width`, `height`, `id` |

**Осторожно:** связанный фильтр `video_src_by_url` возвращает только embed-URL (без тега) и **бросает ошибку** на неподдерживаемых хостингах, в отличие от `video_iframe_by_url`.
