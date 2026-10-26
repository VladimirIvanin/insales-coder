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
      observer.disconnect();
      delete root[cleanupKey];
    }

    const observer = new MutationObserver(function () {
      if (!root.isConnected || !root.contains(form) || !form.contains(preview)) destroy();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    root[cleanupKey] = destroy;
    EventBus.subscribe(event, onVariant);
  });
});
