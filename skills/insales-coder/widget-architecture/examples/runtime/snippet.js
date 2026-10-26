$(function () {
  $widget.each(function (_, root) {
    const cleanupKey = '__variantPreviewCleanup';
    if (root[cleanupKey]) root[cleanupKey]();

    const form = root.querySelector('form[data-product-id]');
    const preview = form && form.querySelector('[data-variant-preview]');
    if (!preview) return;

    const event = 'update_variant:insales:product';
    let active = true;

    function onVariant(data) {
      if (!active || !root.isConnected) return;
      if (!data || !data.action || !data.action.product || data.action.product[0] !== form) return;
      preview.textContent = data.title || '';
    }

    function destroy() {
      if (!active) return;
      active = false;
      EventBus.unsubscribe(event, onVariant);
      delete root[cleanupKey];
    }
    root[cleanupKey] = destroy;
    EventBus.subscribe(event, onVariant);
  });
});
