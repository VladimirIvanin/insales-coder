$(function () {
  $widget.each(function (_, root) {
    if (root.__headerCleanup) root.__headerCleanup();
    const header = root.querySelector('.recipe-header');
    if (!header) return;
    const dialog = header.querySelector('.recipe-header__dialog');
    const panel = header.querySelector('.recipe-header__panel');
    const opener = header.querySelector('.recipe-header__open');
    const closer = header.querySelector('.recipe-header__close');
    const logo = header.querySelector('.recipe-header__logo');
    const desktop = window.matchMedia('(min-width: 769px)');
    const removers = [];
    let previousFocus;
    let locked = false;
    function listen(node, name, handler) {
      node.addEventListener(name, handler);
      removers.push(function () { node.removeEventListener(name, handler); });
    }
    function release() {
      if (locked) bodyScrollLock.enableBodyScroll(panel);
      locked = false;
      opener.setAttribute('aria-expanded', 'false');
    }
    function close(restoreFocus = true) {
      if (dialog.open) dialog.close();
      release();
      if (restoreFocus && previousFocus && previousFocus.isConnected) previousFocus.focus();
      previousFocus = null;
    }
    listen(opener, 'click', function () {
      if (desktop.matches || dialog.open) return;
      previousFocus = document.activeElement;
      dialog.showModal();
      opener.setAttribute('aria-expanded', 'true');
      bodyScrollLock.disableBodyScroll(panel);
      locked = true;
    });
    listen(closer, 'click', function () { close(); });
    listen(dialog, 'cancel', function (event) { event.preventDefault(); close(); });
    listen(dialog, 'close', function () { if (!dialog.open) release(); });
    listen(dialog, 'click', function (event) {
      if (event.target === dialog || event.target.closest('a')) close();
    });
    listen(desktop, 'change', function () {
      const wasOpen = dialog.open;
      close(false);
      if (wasOpen && logo.isConnected) logo.focus();
    });
    header.querySelectorAll('[data-navigation-link]').forEach(function (link) {
      if (new URL(link.href, location.href).pathname !== location.pathname) return;
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
      for (let item = link.parentElement; item && item !== header; item = item.parentElement) {
        if (item.matches('[data-navigation-item]')) item.classList.add('is-current');
      }
    });
    function cleanup() {
      close(false);
      removers.forEach(function (remove) { remove(); });
      if (root.__headerCleanup === cleanup) delete root.__headerCleanup;
    }
    root.__headerCleanup = cleanup;
  });
});
