$(function () {
  $widget.each(function (_, root) {
    if (root.__cartPageCleanup) root.__cartPageCleanup();
    const cart = root.querySelector('.recipe-cart');
    if (!cart) return;
    const form = cart.querySelector('[data-cart-form]');
    const empty = cart.querySelector('.recipe-cart__empty');
    const refresh = cart.querySelector('.recipe-cart__refresh');
    const error = cart.querySelector('.js-cart-error');
    const nativeError = cart.querySelector('[data-cart-discounts-error]');
    let active = true;

    function lineKey(line) {
      const options = line.accessory_value_ids
        ? Object.keys(line.accessory_value_ids)
        : (line.accessory_lines || []).map(function (option) {
          return String(option.accessory_value_id);
        });
      return String(line.id == null ? line.variant_id : line.id) + ':' + options.sort().join(',');
    }

    function renderedKey(row) {
      const parts = row.dataset.lineKey.split(':');
      const options = (parts[1] || '').split(',').filter(Boolean).sort();
      return parts[0] + ':' + options.join(',');
    }

    function onCart(data) {
      if (!active || !data || !Array.isArray(data.order_lines)) return;
      const lines = new Map(data.order_lines.map(function (line) {
        return [lineKey(line), line];
      }));
      const rendered = new Set();
      form.querySelectorAll('[data-line-key]').forEach(function (row) {
        const key = renderedKey(row);
        if (!lines.has(key)) {
          row.remove();
          return;
        }
        rendered.add(key);
        const input = row.querySelector('input[name^="cart[quantity]"]');
        if (input && input !== document.activeElement) input.value = lines.get(key).quantity;
      });
      const missing = Array.from(lines.keys()).some(function (key) {
        return !rendered.has(key);
      });
      form.hidden = missing || lines.size === 0;
      empty.hidden = lines.size !== 0;
      refresh.hidden = !missing;
      if (Array.isArray(data.errors)) error.hidden = data.errors.length === 0 || Boolean(nativeError);
    }

    function removeCoupon(event) {
      const button = event.target.closest('[data-remove-cart-coupon]');
      if (!button || !form.contains(button)) return;
      event.preventDefault();
      form.querySelector('[name="cart[coupon]"]').value = '';
      Cart.setCoupon({ coupon: ' ', form: $(form), button: $(button) });
    }
    form.addEventListener('click', removeCoupon);

    const observer = new MutationObserver(function () {
      if (!root.isConnected || !root.contains(cart) || !cart.contains(form)) cleanup();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    function cleanup() {
      if (!active) return;
      active = false;
      observer.disconnect();
      form.removeEventListener('click', removeCoupon);
      EventBus.unsubscribe('update_items:insales:cart', onCart);
      if (root.__cartPageCleanup === cleanup) delete root.__cartPageCleanup;
    }
    root.__cartPageCleanup = cleanup;
    EventBus.subscribe('update_items:insales:cart', onCart);
  });
});
