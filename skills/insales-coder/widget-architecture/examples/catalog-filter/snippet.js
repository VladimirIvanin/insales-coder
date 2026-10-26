$widget.each(function (_, root) {
  if (root.__catalogFilterCleanup) root.__catalogFilterCleanup()

  const form = root.querySelector('[data-ajax-filter]')
  const panel = root.querySelector('[data-catalog-filter-panel]')
  const opener = root.querySelector('[data-catalog-filter-open]')
  const closer = root.querySelector('[data-catalog-filter-close]')
  const scroller = root.querySelector('.catalog-filter__body')
  if (!form || !panel || !opener || !closer || !scroller) return

  const media = window.matchMedia('(max-width: 767px)')
  const ranges = new Map()
  const removers = []
  let disposed = false
  let locked = false
  let previousFocus = null
  const documentRoot = document.documentElement
  documentRoot.__catalogFilterSequence = (documentRoot.__catalogFilterSequence || 0) + 1
  const prefix = `catalog-filter-${documentRoot.__catalogFilterSequence}`
  let idSequence = 0
  panel.id = `${prefix}-panel`
  opener.setAttribute('aria-controls', panel.id)

  function listen(node, event, callback, options) {
    node.addEventListener(event, callback, options)
    removers.push(() => node.removeEventListener(event, callback, options))
  }

  function owns(node) {
    return node === form || (node && form.contains(node))
  }

  function normalizeIds() {
    const changed = [...form.querySelectorAll('[id]')]
      .filter(node => !node.id.startsWith(`${prefix}-`))
      .map(node => ({ node, old: node.id, next: `${prefix}-${++idSequence}` }))
    form.querySelectorAll('[for], [aria-controls], [aria-labelledby], [aria-describedby]').forEach(node => {
      const area = node.closest('[data-ajax-filter-item-content-list-item]') || form
      ;['for', 'aria-controls', 'aria-labelledby', 'aria-describedby'].forEach(attribute => {
        if (!node.hasAttribute(attribute)) return
        const value = node.getAttribute(attribute).split(/\s+/).map(id => {
          const matches = changed.filter(item => item.old === id && area.contains(item.node))
          return matches.length === 1 ? matches[0].next : id
        }).join(' ')
        node.setAttribute(attribute, value)
      })
    })
    changed.forEach(item => { item.node.id = item.next })
  }

  function number(value, fallback) {
    if (value == null || String(value).trim() === '') return fallback
    const parsed = Number(String(value).replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : fallback
  }

  function removeRange(node) {
    const state = ranges.get(node)
    if (!state) return
    state.remove()
    ranges.delete(node)
  }

  function prepareRanges() {
    if (disposed) return
    ranges.forEach((state, node) => {
      if (!owns(node) || !node.contains(state.slider)) removeRange(node)
    })
    form.querySelectorAll('[data-ajax-filter-range]').forEach(node => {
      const current = ranges.get(node)
      if (current && (current.api === null || current.slider.noUiSlider === current.api)) return
      if (current) removeRange(node)
      const slider = node.querySelector('[data-catalog-filter-slider]')
      const low = node.querySelector('[data-ajax-filter-range-field-min]')
      const high = node.querySelector('[data-ajax-filter-range-field-max]')
      if (!slider || !low || !high) return
      const min = number(node.dataset.rangeMin, NaN)
      const max = number(node.dataset.rangeMax, NaN)
      if (!Number.isFinite(min) || !Number.isFinite(max)) return
      const oldDisabled = [low.disabled, high.disabled]
      const cleanups = []
      const state = { slider, api: null, min, max, sync: () => {}, remove: () => {
        cleanups.forEach(remove => remove())
        if (state.api && slider.noUiSlider === state.api) state.api.destroy()
        low.disabled = oldDisabled[0]
        high.disabled = oldDisabled[1]
      } }
      ranges.set(node, state)
      if (!(max > min)) {
        low.value = String(min)
        high.value = String(max)
        low.disabled = high.disabled = true
        return
      }
      const clamp = value => Math.max(min, Math.min(max, value))
      const first = clamp(number(low.value, number(node.dataset.rangeStart, min)))
      const last = clamp(number(high.value, number(node.dataset.rangeEnd, max)))
      const step = number(node.dataset.rangeStep, 1)
      noUiSlider.create(slider, {
        start: [Math.min(first, last), Math.max(first, last)],
        range: { min, max },
        step: step > 0 ? step : 1,
        connect: true
      })
      state.api = slider.noUiSlider
      state.sync = values => {
        low.value = String(Number(values[0]))
        high.value = String(Number(values[1]))
        low.disabled = Number(values[0]) <= min
        high.disabled = Number(values[1]) >= max
      }
      state.api.on('update', state.sync)
      function bindInput(input, handle) {
        const blur = () => {
          const values = state.api.get().map(Number)
          const value = clamp(number(input.value, handle === 0 ? min : max))
          values[handle] = handle === 0 ? Math.min(value, values[1]) : Math.max(value, values[0])
          state.api.set(values)
        }
        input.addEventListener('blur', blur)
        cleanups.push(() => input.removeEventListener('blur', blur))
      }
      bindInput(low, 0)
      bindInput(high, 1)
    })
    form.querySelectorAll('[data-ajax-filter-option-image]').forEach(image => {
      const option = image.closest('[data-ajax-filter-item-content-list-item]')
      const input = option && option.querySelector('input')
      if (input && image.title) input.setAttribute('aria-label', image.title)
      const picture = image.querySelector('img')
      if (picture) picture.alt = ''
    })
    normalizeIds()
  }

  function releaseLock() {
    if (locked) bodyScrollLock.enableBodyScroll(scroller)
    locked = false
  }

  function close(restoreFocus) {
    releaseLock()
    if (panel.open) panel.close()
    opener.setAttribute('aria-expanded', 'false')
    if (restoreFocus && previousFocus && previousFocus.isConnected) previousFocus.focus()
    previousFocus = null
  }

  function setLayout() {
    close(false)
    if (!media.matches) panel.show()
  }

  function open() {
    if (!media.matches || panel.open) return
    previousFocus = document.activeElement
    panel.showModal()
    opener.setAttribute('aria-expanded', 'true')
    bodyScrollLock.disableBodyScroll(scroller)
    locked = true
    closer.focus()
  }

  function onInit(data) {
    if (data && owns(data.filterNode)) prepareRanges()
  }

  function onItemLoaded(data) {
    if (!data || !owns(data.filterItem)) return
    const item = data.filterItem
    const checked = new Set((data.checked || []).map(String))
    item.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = checked.has(input.value)
      const row = input.closest('[data-ajax-filter-item-content-list-item]')
      if (row) row.classList.toggle('ajax-filter-item-checked', input.checked)
    })
    if (Array.isArray(data.classList) && data.classList.length) item.classList.add(...data.classList)
    prepareRanges()
  }

  listen(opener, 'click', open)
  listen(closer, 'click', () => close(true))
  listen(panel, 'cancel', event => { event.preventDefault(); close(true) })
  listen(panel, 'close', () => { releaseLock(); opener.setAttribute('aria-expanded', 'false') })
  listen(media, 'change', setLayout)
  listen(form, 'click', event => {
    const label = event.target.closest('label')
    const input = label && label.querySelector('[data-ajax-filter-range-field-min], [data-ajax-filter-range-field-max]')
    if (input && input.disabled) {
      const range = ranges.get(input.closest('[data-ajax-filter-range]'))
      if (range && range.max > range.min) {
        input.disabled = false
        input.focus()
      }
    }
    const groupToggle = event.target.closest('[data-catalog-filter-group-toggle]')
    if (groupToggle) {
      const content = groupToggle.closest('[data-ajax-filter-item]').querySelector('[data-ajax-filter-item-content]')
      content.hidden = !content.hidden
      groupToggle.setAttribute('aria-expanded', String(!content.hidden))
    }
    const group = event.target.closest('[data-ajax-filter-item]')
    if (group && event.target.closest('[data-ajax-filter-view-all-btn]')) group.classList.add('expanded')
    if (group && event.target.closest('[data-ajax-filter-hide-all-btn]')) group.classList.remove('expanded')
    if (!event.target.closest('[data-catalog-filter-reset]')) return
    event.preventDefault()
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false
      checkbox.closest('[data-ajax-filter-item-content-list-item]')?.classList.remove('ajax-filter-item-checked')
    })
    prepareRanges()
    ranges.forEach(state => {
      if (!state.api) return
      state.api.set([state.min, state.max])
      state.sync(state.api.get())
    })
    form.requestSubmit()
  })
  listen(form, 'change', event => {
    if (event.target.type !== 'checkbox') return
    event.target.closest('[data-ajax-filter-item-content-list-item]')
      ?.classList.toggle('ajax-filter-item-checked', event.target.checked)
  })
  listen(form, 'submit', () => {
    ranges.forEach(state => { if (state.api) state.sync(state.api.get()) })
  })

  function cleanup() {
    if (disposed) return
    disposed = true
    close(false)
    removers.forEach(remove => remove())
    ranges.forEach((state, node) => removeRange(node))
    EventBus.unsubscribe('init-filter:ui-ajax-filter', onInit)
    EventBus.unsubscribe('filter-item-loaded:ui-ajax-filter', onItemLoaded)
    if (root.__catalogFilterCleanup === cleanup) delete root.__catalogFilterCleanup
  }

  root.__catalogFilterCleanup = cleanup
  setLayout()
  prepareRanges()
  EventBus.subscribe('init-filter:ui-ajax-filter', onInit)
  EventBus.subscribe('filter-item-loaded:ui-ajax-filter', onItemLoaded)
})
