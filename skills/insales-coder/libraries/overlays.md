# Модальные окна и уведомления

## `micromodal` + `body-scroll-lock`

`micromodal` предоставляет глобальный `MicroModal.init/show/close` и **не** добавляет CSS оформления. На дату исследования имя записи каталога указывало 0.4.10, а подключаемый файл — **0.4.6**: проверяй используемые опции по текущему файлу из каталога. `body-scroll-lock` предоставляет глобальный `bodyScrollLock.disableBodyScroll(element)` и `enableBodyScroll(element)`; передавай DOM-элемент прокручиваемого содержимого, не jQuery-коллекцию. Если выбрал `bodyScrollLock`, не включай одновременно `disableScroll` у MicroModal для того же окна.

Адаптированный паттерн модального системного виджета, с отдельным id для каждого экземпляра:

```json
{ "libraries": ["jquery", "micromodal", "body-scroll-lock"] }
```

```liquid
<button type="button" class="js-open-modal">Подробнее</button>
<div class="modal js-modal" aria-hidden="true">
  <div class="modal__overlay" tabindex="-1" data-micromodal-close>
    <div class="modal__container" role="dialog" aria-modal="true"
         aria-label="Подробнее о предложении">
      <button type="button" data-micromodal-close aria-label="Закрыть">×</button>
      <p>Описание предложения</p>
    </div>
  </div>
</div>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const modal = root.querySelector('.js-modal')
    const panel = modal && modal.querySelector('.modal__container')
    if (!panel) return
    modal.id = `offer-${root.dataset.widgetDropItemId}`

    root.querySelector('.js-open-modal').addEventListener('click', function () {
      MicroModal.show(modal.id, {
        onShow: function () { bodyScrollLock.disableBodyScroll(panel) },
        onClose: function () { bodyScrollLock.enableBodyScroll(panel) }
      })
    })
  })
})
```

Для этого примера `snippet.scss` должен скрывать `.modal[aria-hidden="true"]` и показывать `.modal.is-open`; MicroModal не оформляет окно сам. При принудительном удалении открытого окна освобождай блокировку прокрутки. Источники API: [MicroModal](https://micromodal.vercel.app/) и [body-scroll-lock](https://github.com/willmcpo/body-scroll-lock); версии подключаемых файлов смотри в каталоге магазина.

## `microalert` + `js-cookie`

`microalert` подключает JS и CSS, даёт глобальную функцию `microAlert(html, durationMs, { modificator, css })`. Она добавляет HTML через jQuery; не передавай туда непроверенный пользовательский ввод. `js-cookie` даёт глобальный `Cookies` с `get/set/remove`; `expires` в `set` измеряется днями. Для удаления cookie с нестандартными атрибутами повтори те же `path`, `domain`, `secure` и `sameSite`.

Пример показывает одно уведомление на каждый экземпляр и сохранение закрытия:

```json
{ "libraries": ["jquery", "microalert", "js-cookie"] }
```

```liquid
<div class="js-announcement">
  <span>{{ widget_settings.message | escape }}</span>
  <button type="button" class="js-dismiss">Закрыть</button>
</div>
```

```js
$(function () {
  $widget.each(function (_, root) {
    const notice = root.querySelector('.js-announcement')
    const cookieKey = `announcement-${root.dataset.widgetDropItemId}`
    if (Cookies.get(cookieKey) === '1') notice.hidden = true

    notice.querySelector('.js-dismiss').addEventListener('click', function () {
      Cookies.set(cookieKey, '1', { expires: 7, path: '/' })
      notice.hidden = true
      microAlert('Уведомление закрыто', 3000, { modificator: 'success-notice' })
    })
  })
})
```

Источники: API `microAlert` проверен по подключаемому файлу на дату исследования; для cookies используй [документацию js-cookie](https://github.com/js-cookie/js-cookie). Текущие файлы и версии смотри в каталоге магазина.
