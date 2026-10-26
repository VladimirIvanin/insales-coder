$widget.each(function (_, root) {
  if (root.__comparePageCleanup) root.__comparePageCleanup()

  const table = root.querySelector('[data-compare-table]')
  const content = root.querySelector('[data-compare-content]')
  const actions = root.querySelector('.compare-actions')
  const empty = root.querySelector('[data-compare-empty]')
  const toggle = root.querySelector('[data-compare-differences]')
  if (!table || !content || !actions || !empty || !toggle) return

  const eventName = 'update_items:insales:compares'
  let disposed = false

  function normalizeCell(cell) {
    const values = JSON.parse(cell.getAttribute('data-compare-values') || '[]')
    return JSON.stringify([...new Set(values.map(String).map(value => value.trim()).filter(Boolean))].sort())
  }

  function remainingIds() {
    return [...table.querySelectorAll('.compare-products-row [data-compare-product-id]')]
      .map(cell => cell.getAttribute('data-compare-product-id'))
  }

  function paint() {
    const count = remainingIds().length
    content.hidden = count === 0
    actions.hidden = count === 0
    empty.hidden = count !== 0
    table.style.setProperty('--compare-product-count', String(count))
    toggle.closest('.compare-toggle').hidden = count < 2
    if (count < 2) toggle.checked = false

    table.querySelectorAll('[data-compare-property-row]').forEach(row => {
      const values = [...row.querySelectorAll('[data-compare-values]')].map(normalizeCell)
      const differs = values.some(value => value !== values[0])
      row.hidden = toggle.checked && !differs
    })
  }

  function onUpdate(data) {
    if (disposed || !data || !Array.isArray(data.products)) return
    if (!root.isConnected || !root.contains(table)) {
      cleanup()
      return
    }

    const ids = new Set(data.products.map(product => String(product.id)))
    table.querySelectorAll('[data-compare-product-id]').forEach(cell => {
      if (!ids.has(cell.getAttribute('data-compare-product-id'))) cell.remove()
    })
    paint()
  }

  function onChange(event) {
    if (event.target === toggle) paint()
  }

  function cleanup() {
    if (disposed) return
    disposed = true
    EventBus.unsubscribe(eventName, onUpdate)
    root.removeEventListener('change', onChange)
    if (root.__comparePageCleanup === cleanup) delete root.__comparePageCleanup
  }

  root.__comparePageCleanup = cleanup
  root.addEventListener('change', onChange)
  paint()
  EventBus.subscribe(eventName, onUpdate)
})
