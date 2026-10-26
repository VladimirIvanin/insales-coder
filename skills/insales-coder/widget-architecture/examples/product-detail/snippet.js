$widget.each(function (_, root) {
  if (root.__productDetailCleanup) root.__productDetailCleanup()

  const $root = $(root)
  const form = root.matches('[data-product-detail]') ? root : root.querySelector('[data-product-detail]')
  if (!form) return

  const summary = form.querySelector('.product-detail__summary')
  const controls = form.querySelector('[data-purchase-controls]')
  const status = form.querySelector('[data-purchase-status]')
  const allowUnavailable = form.dataset.allowUnavailable === 'true'
  let disposed = false
  let pending = true
  let available = false
  let initialized = false

  function paintPurchase() {
    if (controls) controls.disabled = pending || (!available && !allowUnavailable)
    if (status) status.textContent = pending ? form.dataset.updatingLabel : ''
    form.setAttribute('aria-busy', pending ? 'true' : 'false')
  }

  function acceptVariant(data) {
    if (disposed || !form.isConnected || !data || !data.action || !data.action.product || data.action.product[0] !== form) return

    initialized = true
    available = Boolean(data.available)
    pending = false
    paintPurchase()

    form.querySelectorAll('[data-option-selector] select[data-option-bind]').forEach(function (select) {
      const label = select.closest('.option').querySelector('.option-label')
      if (label) select.setAttribute('aria-label', label.textContent.trim())
    })
  }

  function onVariantIntent(event) {
    const target = event.target.closest('[data-product-variants], [data-option-bind]')
    if (!target || !form.contains(target)) return
    if (event.type === 'click' && target.matches('select')) return
    if (event.type === 'click' && target.matches('input[type="radio"], input[type="checkbox"]')) return

    pending = true
    paintPurchase()
  }

  function guardPurchase(event) {
    if (event.type === 'submit') {
      event.preventDefault()
      return
    }

    const action = event.target.closest('[data-item-add], [data-quantity-change], [name="quantity"]')
    if (action && (!controls || controls.disabled)) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  $root.off('click.productDetailGallery', '[data-gallery-thumbnail]')
  $root.on('click.productDetailGallery', '[data-gallery-thumbnail]', function () {
    const image = form.querySelector('[data-gallery-main]')
    if (!image || !form.contains(this)) return

    image.src = this.dataset.photoSrc
    image.alt = this.dataset.photoAlt
    form.querySelectorAll('[data-gallery-thumbnail]').forEach(function (thumbnail) {
      thumbnail.setAttribute('aria-pressed', thumbnail === this ? 'true' : 'false')
    }, this)
  })

  form.addEventListener('change', onVariantIntent, true)
  form.addEventListener('click', onVariantIntent, true)
  form.addEventListener('click', guardPurchase, true)
  form.addEventListener('submit', guardPurchase, true)

  function cleanup() {
    if (disposed) return
    disposed = true
    $root.off('click.productDetailGallery', '[data-gallery-thumbnail]')
    form.removeEventListener('change', onVariantIntent, true)
    form.removeEventListener('click', onVariantIntent, true)
    form.removeEventListener('click', guardPurchase, true)
    form.removeEventListener('submit', guardPurchase, true)
    EventBus.unsubscribe('update_variant:insales:product', acceptVariant)
    if (root.__productDetailCleanup === cleanup) delete root.__productDetailCleanup
  }

  root.__productDetailCleanup = cleanup
  paintPurchase()
  EventBus.subscribe('update_variant:insales:product', acceptVariant)

  Products.getInstance($(form)).done(function (instance) {
    if (disposed || !form.isConnected || initialized) return
    // Уже созданный экземпляр мог не публиковать новое событие при getInstance.
    const variantField = form.querySelector('[name="variant_id"]')
    const product = instance.product
    const variant = product && variantField && product.variants.find(function (item) {
      return String(item.id) === variantField.value
    })
    if (variant) acceptVariant({ available: variant.available, action: { product: [form] } })
  }).fail(function () {
    if (disposed || !status) return
    status.textContent = form.dataset.loadErrorLabel
    form.setAttribute('aria-busy', 'false')
  })
})
