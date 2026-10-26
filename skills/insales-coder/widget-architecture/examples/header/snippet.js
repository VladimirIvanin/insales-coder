$(function () {
  $widget.each(function (_, root) {
    if (root.__headerCleanup) root.__headerCleanup();
    const header = root.querySelector('.recipe-header');
    if (!header) return;

    const dialog = header.querySelector('.recipe-header__dialog');
    const panel = header.querySelector('.recipe-header__panel');
    const opener = header.querySelector('.recipe-header__open');
    const closer = header.querySelector('.recipe-header__close');
    const menu = header.querySelector('.js-header-menu');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const removers = [];
    let previousFocus = null;
    let locked = false;
    const more = menu ? menu.querySelector(".recipe-header__more") : null;
    const moreItems = more ? more.querySelector(".recipe-header__more-items") : null;
    let active = true;

    dialog.id = 'recipe-catalog-' + Math.random().toString(36).slice(2);
    opener.setAttribute('aria-controls', dialog.id);

    function listen(node, name, handler) {
      node.addEventListener(name, handler);
      removers.push(function () {
        node.removeEventListener(name, handler);
      });
    }

    function release() {
      if (locked) bodyScrollLock.enableBodyScroll(panel);
      locked = false;
      opener.setAttribute('aria-expanded', 'false');
    }

    function close(restoreFocus = true) {
      if (dialog.open) dialog.close();
      release();
      if (restoreFocus && previousFocus && previousFocus.isConnected) {
        previousFocus.focus();
      }
      previousFocus = null;
    }

    function updateMenu() {
      if (!menu || !more || !moreItems) return;
      Array.from(moreItems.children).forEach(function (link) {
        menu.insertBefore(link, more);
      });
      more.open = false;
      more.hidden = true;
      if (!desktop.matches || menu.clientWidth === 0) return;
      if (menu.scrollWidth <= menu.clientWidth) return;

      more.hidden = false;
      while (menu.scrollWidth > menu.clientWidth) {
        const links = menu.querySelectorAll(':scope > a');
        const lastLink = links[links.length - 1];
        if (!lastLink) break;
        moreItems.prepend(lastLink);
      }
    }

    function updateBranches() {
      header.querySelectorAll('.recipe-header__branch').forEach(function (branch) {
        branch.open = desktop.matches;
      });
    }

    listen(opener, 'click', function () {
      if (dialog.open) {
        close();
        return;
      }
      previousFocus = document.activeElement;
      if (desktop.matches) {
        dialog.show();
      } else {
        dialog.showModal();
        bodyScrollLock.disableBodyScroll(panel);
        locked = true;
      }
      opener.setAttribute('aria-expanded', 'true');
    });
    listen(closer, 'click', function () {
      close();
    });
    listen(dialog, 'cancel', function (event) {
      event.preventDefault();
      close();
    });
    listen(dialog, 'close', function () {
      if (!dialog.open) release();
    });
    listen(dialog, 'click', function (event) {
      if (event.target === dialog || event.target.closest('a')) close();
    });
    listen(document, 'pointerdown', function (event) {
      if (more && !menu.contains(event.target)) more.open = false;
      if (desktop.matches && dialog.open && !dialog.contains(event.target) &&
          !opener.contains(event.target)) close();
    });
    listen(header, 'keydown', function (event) {
      if (event.key === 'Escape' && more && more.open) {
        more.open = false;
        more.querySelector('summary').focus();
      }
      if (event.key === 'Escape' && dialog.open) {
        event.preventDefault();
        close();
      }
    });
    listen(desktop, 'change', function () {
      close();
      updateBranches();
      updateMenu();
    });

    header.querySelectorAll('[data-navigation-link]').forEach(function (link) {
      if (new URL(link.href, location.href).pathname !== location.pathname) return;
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    });
    const menuObserver = menu ? new ResizeObserver(updateMenu) : null;
    if (menuObserver) menuObserver.observe(menu);
    updateBranches();
    updateMenu();

    const observer = new MutationObserver(function () {
      if (!root.isConnected || !root.contains(header) || !header.contains(dialog) ||
          !dialog.contains(panel) || !header.contains(opener) || !panel.contains(closer) ||
          (menu && !header.contains(menu))) cleanup();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    function cleanup() {
      if (!active) return;
      active = false;
      observer.disconnect();
      close(false);
      if (menuObserver) menuObserver.disconnect();
      removers.forEach(function (remove) {
        remove();
      });
      if (root.__headerCleanup === cleanup) delete root.__headerCleanup;
    }
    root.__headerCleanup = cleanup;
  });
});
