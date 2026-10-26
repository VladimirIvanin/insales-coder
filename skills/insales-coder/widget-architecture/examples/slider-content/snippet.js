$(function () {
  $widget.each(function (_, root) {
    const cleanupKey = '__contentSliderCleanup'
    if (root[cleanupKey]) root[cleanupKey]()

    const sliderRoot = root.querySelector('.js-content-slider')
    if (!sliderRoot || !sliderRoot.querySelector('.tvist-v1__slide')) return

    const paginationRoot = root.querySelector('.js-content-pagination')
    const rawGap = Number(sliderRoot.dataset.slideGap)
    const slider = new TvistV1(sliderRoot, {
      perPage: 3,
      gap: Number.isFinite(rawGap) ? Math.max(0, rawGap) : 24,
      breakpoints: {
        767: { perPage: 1 }
      },
      arrows: {
        prev: root.querySelector('.js-content-prev'),
        next: root.querySelector('.js-content-next'),
        hideWhenSinglePage: true
      },
      pagination: {
        container: paginationRoot,
        type: 'bullets',
        renderBullet: function (index, className) {
          const button = document.createElement('button')
          button.type = 'button'
          button.className = className
          button.dataset.index = index
          button.setAttribute('aria-label', paginationRoot.dataset.pageLabel + ' ' + (index + 1))
          return button.outerHTML
        },
        clickable: true,
        hideWhenSinglePage: true
      }
    })

    const track = sliderRoot.querySelector('.tvist-v1__track')
    const slides = Array.from(sliderRoot.querySelectorAll('.tvist-v1__slide'))
    const originalInert = new Map(slides.map(function (slide) {
      return [slide, slide.hasAttribute('inert')]
    }))
    const visibilityEvents = ['scroll', 'slideChangeEnd', 'resized', 'refresh', 'breakpoint']

    function syncVisibleSlides() {
      const bounds = track.getBoundingClientRect()
      if (bounds.width <= 0) return
      slides.forEach(function (slide) {
        const rect = slide.getBoundingClientRect()
        const outside = rect.right <= bounds.left || rect.left >= bounds.right
        slide.toggleAttribute('inert', originalInert.get(slide) || outside)
      })
    }

    visibilityEvents.forEach(function (eventName) {
      slider.on(eventName, syncVisibleSlides)
    })
    syncVisibleSlides()

    let active = true

    function destroy() {
      if (!active) return
      active = false
      visibilityEvents.forEach(function (eventName) {
        slider.off(eventName, syncVisibleSlides)
      })
      slider.destroy()
      originalInert.forEach(function (wasInert, slide) {
        slide.toggleAttribute('inert', wasInert)
      })
      delete root[cleanupKey]
    }
    root[cleanupKey] = destroy
  })
})
