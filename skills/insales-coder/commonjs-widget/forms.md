# Формы с AJAX-отправкой и капчей

Три компонента с одинаковой структурой — меняется только префикс атрибутов:

| Компонент | Префикс | action формы | Событие успеха |
|---|---|---|---|
| Обратная связь | `data-feedback-form-*` | `/client_account/feedback` | `send-feedback:insales:ui_feedback` |
| Отзыв к товару | `data-reviews-form-*` | `{{ product.url }}/reviews` | `send-review:insales:ui_reviews` |
| Комментарий к статье | `data-comments-form-*` | `{{ article.url }}/comments` | `send-comment:insales:ui_comments` |

---

## Форма обратной связи

```liquid
<form
  method="post"
  action="/client_account/feedback"
  data-feedback-form-wrapper
>
  <!-- Сообщение об успехе (по умолчанию не скрыто — скрывай через CSS) -->
  <div data-feedback-form-success='{"showTime": 10000}'>
    Успешно отправлено
  </div>

  <!-- Каждое поле оборачивается в data-feedback-form-field-area -->
  <div data-feedback-form-field-area>
    <input
      name="phone"
      type="text"
      data-feedback-form-field='{
        "isRequired": true,
        "errorMessage": "Неправильно заполнено поле Телефон",
        "phoneNumberLength": 11,
        "secondPhoneNumberLength": 12
      }'>
    <div data-feedback-form-field-error></div>
  </div>

  <div data-feedback-form-field-area>
    <input name="name" type="text"
      data-feedback-form-field='{"isRequired": true, "errorMessage": "Заполните имя"}'>
    <div data-feedback-form-field-error></div>
  </div>

  <div data-feedback-form-field-area>
    <input name="from" type="text"
      data-feedback-form-field='{"errorMessage": "Неверный email"}'>
    <div data-feedback-form-field-error></div>
  </div>

  <div data-feedback-form-field-area>
    <textarea name="content"
      data-feedback-form-field='{"errorMessage": "Заполните сообщение"}'></textarea>
    <div data-feedback-form-field-error></div>
  </div>

  <!-- Согласие на обработку данных — нельзя сделать необязательным -->
  <div data-feedback-form-field-area>
    <label>
      <input type="checkbox" name="agree"
        data-feedback-form-agree='{"errorMessage": "Необходимо согласие"}'>
      Согласен на обработку данных
    </label>
    <div data-feedback-form-field-error></div>
  </div>

  <!-- Капча — ВСЕГДА через условие на тип -->
  {% if settings.feedback_captcha_enabled %}
    {% if account.captcha_type == 'google' %}
      <div data-feedback-form-field-area>
        <div
          data-recaptcha-type="invisible"
          data-feedback-form-recaptcha='{"isRequired": true, "errorMessage": "{{ messages.recaptcha_error | escape }}"}'
        ></div>
        <div data-feedback-form-field-error></div>
      </div>
    {% elsif account.captcha_type == 'yandex' %}
      <div data-feedback-form-field-area>
        <div
          data-yandex-captcha-type="invisible"
          data-feedback-form-yandex-captcha='{"isRequired": true, "errorMessage": "{{ widget_messages.yandex_captcha_error | escape }}"}'
        ></div>
        <div data-feedback-form-field-error></div>
      </div>
    {% endif %}
  {% endif %}

  <input type="hidden" name="subject" value="Форма обратной связи">
  <button type="submit">Отправить</button>
</form>
```

Поля формы обратной связи (определяются по `name`):

| name | Тип | Обязательное по умолчанию |
|---|---|---|
| `name` | Имя | Нет |
| `from` | Email | Нет (если пусто — подставляется email владельца) |
| `phone` | Телефон | Нет |
| `content` | Сообщение | Нет (если пусто — "Сообщение не заполнено") |
| `subject` | Тема письма | Нет |
| `agree` | Чекбокс согласия | Да, нельзя отключить |

---

## Форма отзыва к товару

```liquid
{% if account.reviews_enabled? %}
<form
  data-reviews-form-wrapper='{
    "reviews_moderated": {{ account.reviews_moderated? }},
    "url": "{{ product.url }}"
  }'
  method="post"
  action="{{ product.url }}/reviews#review_form"
  enctype="multipart/form-data"
>
  {% assign success_message = messages.review_is_added %}
  {% if account.reviews_moderated? %}
    {% assign success_message = messages.review_is_added_moderated %}
  {% endif %}

  <div data-reviews-form-success='{
    "showTime": 10000,
    "message": "{{ success_message }}",
    "reloadPage": false
  }'></div>

  <!-- Рейтинг -->
  <div data-reviews-form-field-area>
    {% assign r = 5 %}
    {% for i in (1..5) %}
      <input data-reviews-form-field name="review[rating]"
             type="radio" value="{{ r }}" id="star{{ r }}-{{ product.id }}">
      <label for="star{{ r }}-{{ product.id }}">★</label>
      {% assign r = r | minus: 1 %}
    {% endfor %}
    <div data-reviews-form-field-error></div>
  </div>

  <div data-reviews-form-field-area>
    <input name="review[author]" type="text"
      data-reviews-form-field='{"isRequired": true, "errorMessage": "{{ messages.name_error | escape }}"}'>
    <div data-reviews-form-field-error></div>
  </div>

  <div data-reviews-form-field-area>
    <input name="review[email]" type="text"
      data-reviews-form-field='{"isRequired": true, "errorMessage": "{{ messages.email_error | escape }}"}'>
    <div data-reviews-form-field-error></div>
  </div>

  <div data-reviews-form-field-area>
    <textarea name="review[content]"
      data-reviews-form-field='{"isRequired": true, "errorMessage": "{{ messages.please_enter_message | escape }}"}'></textarea>
    <div data-reviews-form-field-error></div>
  </div>

  {% if account.reviews_images_enabled? %}
    <div data-reviews-form-field-area>
      <input data-reviews-form-image type="file" name="review[image_attributes][image]">
      <div data-reviews-form-field-error></div>
    </div>
  {% endif %}

  <!-- Капча -->
  {% if review.captcha_enabled? %}
    {% if account.captcha_type == 'google' %}
      <div data-reviews-form-field-area>
        <div data-recaptcha-type="invisible"
             data-reviews-form-recaptcha='{"isRequired": true, "errorMessage": "{{ messages.recaptcha_error | escape }}"}'></div>
        <div data-reviews-form-field-error></div>
      </div>
    {% elsif account.captcha_type == 'yandex' %}
      <div data-reviews-form-field-area>
        <div data-yandex-captcha-type="invisible"
             data-reviews-form-yandex-captcha='{"isRequired": true, "errorMessage": "{{ widget_messages.yandex_captcha_error | escape }}"}'></div>
        <div data-reviews-form-field-error></div>
      </div>
    {% endif %}
  {% endif %}

  <button type="submit">Отправить отзыв</button>
</form>
{% endif %}
```

---

## Форма комментария к статье

```liquid
{% if blog.comments_enabled? %}
<form
  data-comments-form-wrapper='{
    "reviews_moderated": {{ account.reviews_moderated? }},
    "url": "{{ article.url }}"
  }'
  method="post"
  action="{{ article.url }}/comments#comment_form"
>
  <div data-comments-form-success='{
    "showTime": 10000,
    "message": "Комментарий добавлен",
    "reloadPage": false
  }'></div>

  <div data-comments-form-field-area>
    <input name="comment[author]" type="text"
      data-comments-form-field='{"isRequired": true, "errorMessage": "Заполните имя"}'>
    <div data-comments-form-field-error></div>
  </div>

  <div data-comments-form-field-area>
    <input name="comment[email]" type="text"
      data-comments-form-field='{"isRequired": true, "errorMessage": "Заполните email"}'>
    <div data-comments-form-field-error></div>
  </div>

  <div data-comments-form-field-area>
    <textarea name="comment[content]"
      data-comments-form-field='{"isRequired": true, "errorMessage": "Заполните сообщение"}'></textarea>
    <div data-comments-form-field-error></div>
  </div>

  <!-- Капча -->
  {% if comment.captcha_enabled? %}
    {% if account.captcha_type == 'google' %}
      <div data-comments-form-field-area>
        <div data-recaptcha-type="invisible"
             data-comments-form-recaptcha='{"isRequired": true, "errorMessage": "{{ messages.recaptcha_error | escape }}"}'></div>
        <div data-comments-form-field-error></div>
      </div>
    {% elsif account.captcha_type == 'yandex' %}
      <div data-comments-form-field-area>
        <div data-yandex-captcha-type="invisible"
             data-comments-form-yandex-captcha='{"isRequired": true, "errorMessage": "{{ messages.recaptcha_error | escape }}"}'></div>
        <div data-comments-form-field-error></div>
      </div>
    {% endif %}
  {% endif %}

  <button type="submit">Отправить</button>
</form>
{% endif %}
```

---

## Капча — подробно

### Условие включения

| Форма | Liquid-условие |
|---|---|
| Обратная связь | `{% if settings.feedback_captcha_enabled %}` |
| Отзыв | `{% if review.captcha_enabled? %}` |
| Комментарий | `{% if comment.captcha_enabled? %}` |

### Google reCAPTCHA

**v2 (чекбокс "Я не робот"):**
```liquid
<div data-feedback-form-recaptcha='{"isRequired": true, "errorMessage": "..."}'></div>
```

**v3 invisible (без взаимодействия):**
```liquid
<div
  data-recaptcha-type="invisible"
  data-badge="bottomleft"
  data-feedback-form-recaptcha='{"isRequired": true, "errorMessage": "..."}'
></div>
```

`data-badge` — позиция бейджа: `bottomleft` (по умолчанию), `bottomright`, `inline`

### Yandex SmartCaptcha

**Обычная (с кнопкой "Я не робот"):**
```liquid
<div data-feedback-form-yandex-captcha='{"isRequired": true, "errorMessage": "..."}'></div>
```

**Invisible:**
```liquid
<div
  data-yandex-captcha-type="invisible"
  data-yandex-captcha-shield-position="bottom-left"
  data-feedback-form-yandex-captcha='{"isRequired": true, "errorMessage": "..."}'
></div>
```

`data-yandex-captcha-shield-position` — позиция бейджа: `bottom-right` (по умолчанию), `bottom-left`, `top-left`, `top-right`, `center-left`, `center-right`

`data-yandex-captcha-hide-shield="true"` — скрыть бейдж (требует явного уведомления пользователя другим способом)

`data-yandex-captcha-test="true"` — тестовый режим (всегда показывает задание)

---

## Подписка на события форм

```js
EventBus.subscribe('send-feedback:insales:ui_feedback', function(data) {
  // data.form — jQuery-объект формы
})

EventBus.subscribe('error-feedback:insales:ui_feedback', function(data) {
  $.each(data.errors, function(i, val) {
    const errorText = typeof val == 'string' ? val : val[0]
    microAlert(errorText, 5000, { modificator: 'warning-notice' })
  })
})
```

## Кнопка открытия формы в модалке

```liquid
<button data-show-feedback-modal='{"modal_id": "my-modal"}'>Написать нам</button>
<!-- аналогично: data-show-reviews-modal, data-show-comments-modal -->
```

```js
EventBus.subscribe('show-modal-feedback:insales:ui_feedback', function(data) {
  // data.modal_id — ID переданный в атрибуте
  MicroModal.show(data.modal_id)
})
```
