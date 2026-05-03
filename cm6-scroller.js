import { EditorView, ViewPlugin } from "@codemirror/view"

/**
 * Default configuration for cm6-scroller
 */
const DEFAULT_CONFIG = {
  // Scrollbar dimensions
  scrollbarSize: 12,         // Width of vertical scrollbar, height of horizontal scrollbar
  thumbSize: 8,              // Width of vertical thumb, height of horizontal thumb
  minThumbSize: 24,          // Minimum thumb size in pixels

  // Spacing and padding
  thumbPadding: 2,           // Padding between thumb and track edges
  contentPadding: 2,         // Additional padding added to content to prevent overlap

  // Colors (CSS custom properties or direct values)
  trackBackground: "var(--cm-scrollbar-track-bg, #f0f0f0)",
  thumbBackground: "var(--cm-scrollbar-thumb-bg, #c0c0c0)",
  thumbHoverBackground: "var(--cm-scrollbar-thumb-hover-bg, #a0a0a0)",
  thumbBorderRadius: "var(--cm-scrollbar-border-radius, 4px)",
  cornerBackground: "var(--cm-scrollbar-corner-bg, #f0f0f0)",

  // Border styling
  trackBorderColor: "var(--cm-scrollbar-border-color, #e0e0e0)",
  trackBorderWidth: "var(--cm-scrollbar-border-width, 1px)",

  // Transition
  transitionDuration: "0.15s",

  // Z-index
  zIndex: 1000
}

/**
 * Create the scrollbar theme with configurable styling
 */
function createScrollbarTheme(config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  return EditorView.theme({
    // === Native scrollbar suppression ===
    "& .cm-editor": {
      scrollbarWidth: "none",                    // Firefox
      msOverflowStyle: "none",                   // IE/Edge
    },
    "& .cm-editor::-webkit-scrollbar": {
      display: "none",                           // Chrome/Safari/Edge
    },
    "& .cm-scroller": {
      scrollbarWidth: "none",                    // Firefox
      msOverflowStyle: "none",                   // IE/Edge
      overflow: "auto !important",               // Allow scrolling but hide native bars
    },
    "& .cm-scroller::-webkit-scrollbar": {
      display: "none",                           // Chrome/Safari/Edge
    },
    "& .cm-content": {
      scrollbarWidth: "none",                    // Firefox
      msOverflowStyle: "none",                   // IE/Edge
    },
    "& .cm-content::-webkit-scrollbar": {
      display: "none",                           // Chrome/Safari/Edge
    },
    "& .cm-gutters": {
      scrollbarWidth: "none",                    // Firefox
      msOverflowStyle: "none",                   // IE/Edge
    },
    "& .cm-gutters::-webkit-scrollbar": {
      display: "none",                           // Chrome/Safari/Edge
    },

    // === Custom scrollbars ===
    // Content padding to prevent overlap with scrollbars
    "& .cm-scroller[data-scrollbars='vertical'] .cm-content": {
      paddingRight: `${cfg.scrollbarSize + cfg.contentPadding}px`,
    },
    "& .cm-scroller[data-scrollbars='horizontal'] .cm-content": {
      paddingBottom: `${cfg.scrollbarSize + cfg.contentPadding}px`,
    },
    "& .cm-scroller[data-scrollbars='both'] .cm-content": {
      paddingRight: `${cfg.scrollbarSize + cfg.contentPadding}px`,
      paddingBottom: `${cfg.scrollbarSize + cfg.contentPadding}px`,
    },

    // Corner element (fills gap when both scrollbars visible)
    "& .cm-scroller-corner": {
      background: cfg.cornerBackground,
      zIndex: cfg.zIndex,
      pointerEvents: "none",
      borderBottomRightRadius: cfg.thumbBorderRadius,
    },

    // Track styling
    "& .cm-scroller-track": {
      background: cfg.trackBackground,
      borderRadius: "0px",
      zIndex: cfg.zIndex,
    },
    "& .cm-scroller-track-v": {
      top: "0",
      right: "0",
      width: `${cfg.scrollbarSize}px`,
      height: "100%",
      pointerEvents: "auto",
      borderLeft: `${cfg.trackBorderWidth} solid ${cfg.trackBorderColor}`,
      borderTopRightRadius: cfg.thumbBorderRadius,
      borderBottomRightRadius: cfg.thumbBorderRadius,
      cursor: "ns-resize",
    },
    "& .cm-scroller-track-h": {
      bottom: "0",
      height: `${cfg.scrollbarSize}px`,
      pointerEvents: "auto",
      borderTop: `${cfg.trackBorderWidth} solid ${cfg.trackBorderColor}`,
      borderBottomRightRadius: cfg.thumbBorderRadius,
      cursor: "ew-resize",
    },

    // Thumb styling
    "& .cm-scroller-thumb": {
      position: "absolute",
      background: cfg.thumbBackground,
      borderRadius: cfg.thumbBorderRadius,
      cursor: "pointer",
      transition: `background-color ${cfg.transitionDuration} ease`,
      boxShadow: "0 1px 3px rgb(0 0 0 / 30%)",
      zIndex: cfg.zIndex + 1,
    },
    "& .cm-scroller-thumb-v": {
      width: `${cfg.thumbSize}px`,
      left: `${cfg.thumbPadding}px`,
      top: `${cfg.thumbPadding}px`,
      bottom: `${cfg.thumbPadding}px`,
    },
    "& .cm-scroller-thumb-h": {
      height: `${cfg.thumbSize}px`,
      left: `${cfg.thumbPadding}px`,
      right: `${cfg.thumbPadding}px`,
      top: `${cfg.thumbPadding}px`,
    },

    // Hover states
    "& .cm-scroller-thumb:hover": {
      background: cfg.thumbHoverBackground,
      boxShadow: "0 2px 6px rgb(0 0 0 / 40%)",
    },
    "& .cm-scroller-track-v .cm-scroller-thumb:hover": {
      width: `${cfg.thumbSize + 2}px`,
    },
    "& .cm-scroller-track-h .cm-scroller-thumb:hover": {
      height: `${cfg.thumbSize + 2}px`,
    },

    // Ensure scrollbars don't interfere with text selection
    "& .cm-scroller-track, & .cm-scroller-thumb, & .cm-scroller-corner": {
      userSelect: "none",
    },
  })
}

/**
 * Custom Scrollbars Plugin Class
 *
 * Provides themed, custom scrollbars that replace native browser scrollbars
 * in CodeMirror editors with enhanced functionality.
 */
class CustomScrollbars {
  constructor(view, config = {}) {
    this.view = view
    this.scroller = view.scrollDOM
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Make sure scroller can contain absolute children
    const style = getComputedStyle(this.scroller)
    if (style.position === "static") {
      this.scroller.style.position = "relative"
    }

    // Create vertical scrollbar
    this.vTrack = this.createTrack("v")
    this.vThumb = this.createThumb("v")
    this.vTrack.appendChild(this.vThumb)
    this.scroller.appendChild(this.vTrack)

    // Create horizontal scrollbar
    this.hTrack = this.createTrack("h")
    this.hThumb = this.createThumb("h")
    this.hTrack.appendChild(this.hThumb)
    this.scroller.appendChild(this.hTrack)

    // Create corner element (shown when both scrollbars are visible)
    this.corner = this.createCorner()
    this.scroller.appendChild(this.corner)

    // Event listeners
    this.scroller.addEventListener("scroll", this.onScroll.bind(this), { passive: true })
    this.setupDrag(this.vThumb, "vertical")
    this.setupDrag(this.hThumb, "horizontal")
    this.setupTrackClick(this.vTrack, "vertical")
    this.setupTrackClick(this.hTrack, "horizontal")

    // Observe size changes
    this.resizeObserver = new ResizeObserver(() => this.updateBars())
    this.resizeObserver.observe(this.scroller)

    // Observe window resize for fixed positioning updates
    this.windowResizeHandler = () => this.updateBars()
    window.addEventListener('resize', this.windowResizeHandler)

    this.updateBars()
  }

  createTrack(axis) {
    const track = document.createElement("div")
    track.className = `cm-scroller-track cm-scroller-track-${axis}`
    return track
  }

  createThumb(axis) {
    const thumb = document.createElement("div")
    thumb.className = `cm-scroller-thumb cm-scroller-thumb-${axis}`
    return thumb
  }

  createCorner() {
    const corner = document.createElement("div")
    corner.className = "cm-scroller-corner"
    return corner
  }

  updateBars() {
    const rect = this.scroller.getBoundingClientRect()
    const { scrollHeight, clientHeight, scrollTop, scrollWidth, clientWidth, scrollLeft } = this.scroller

    // Get gutter width to position horizontal scrollbar correctly
    const gutters = this.scroller.querySelector('.cm-gutters')
    const gutterWidth = gutters ? gutters.offsetWidth : 0

    // Check if both scrollbars will be visible for corner padding
    const needsVertical = scrollHeight > clientHeight + 1
    const needsHorizontal = scrollWidth > clientWidth + 1

    // Update data attribute for CSS content padding
    if (needsVertical && needsHorizontal) {
      this.scroller.setAttribute('data-scrollbars', 'both')
    } else if (needsVertical) {
      this.scroller.setAttribute('data-scrollbars', 'vertical')
    } else if (needsHorizontal) {
      this.scroller.setAttribute('data-scrollbars', 'horizontal')
    } else {
      this.scroller.removeAttribute('data-scrollbars')
    }

    // Vertical scrollbar (fixed to right edge of scroller)
    this.vTrack.style.display = needsVertical ? "block" : "none"
    this.vTrack.style.position = "fixed"
    this.vTrack.style.top = `${rect.top}px`
    this.vTrack.style.right = `${window.innerWidth - rect.right}px`
    this.vTrack.style.height = `${rect.height}px`
    this.vTrack.style.width = `${this.config.scrollbarSize}px`
    // Add bottom padding if horizontal scrollbar is visible
    if (needsHorizontal) {
      this.vTrack.style.height = `${rect.height - this.config.scrollbarSize}px`
    }

    if (needsVertical) {
      const thumbHeight = Math.max(this.config.minThumbSize, (clientHeight / scrollHeight) * clientHeight)
      // Available track height minus padding and corner adjustment
      const totalPadding = this.config.thumbPadding * 2
      const availableTrackHeight = clientHeight - totalPadding - (needsHorizontal ? this.config.scrollbarSize : 0)
      const maxThumbTop = availableTrackHeight - thumbHeight
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop

      this.vThumb.style.height = `${thumbHeight}px`
      this.vThumb.style.top = `${Math.max(this.config.thumbPadding, Math.min(thumbTop + this.config.thumbPadding, maxThumbTop + this.config.thumbPadding))}px`
      this.vThumb.style.width = `${this.config.thumbSize}px`
      this.vThumb.style.left = `${this.config.thumbPadding}px`
    }

    // Horizontal scrollbar (fixed to bottom, starts after gutters)
    this.hTrack.style.display = needsHorizontal ? "block" : "none"
    this.hTrack.style.position = "fixed"
    this.hTrack.style.bottom = `${window.innerHeight - rect.bottom}px`
    this.hTrack.style.left = `${rect.left + gutterWidth}px`
    this.hTrack.style.height = `${this.config.scrollbarSize}px`
    const contentWidth = clientWidth - gutterWidth
    this.hTrack.style.width = `${contentWidth}px`
    // Add right padding if vertical scrollbar is visible
    if (needsVertical) {
      this.hTrack.style.width = `${contentWidth - this.config.scrollbarSize}px`
    }

    if (needsHorizontal) {
      const thumbWidth = Math.max(this.config.minThumbSize, (contentWidth / scrollWidth) * contentWidth)
      // Available track width minus padding and corner adjustment
      const totalPadding = this.config.thumbPadding * 2
      const availableTrackWidth = contentWidth - totalPadding - (needsVertical ? this.config.scrollbarSize : 0)
      const maxThumbLeft = availableTrackWidth - thumbWidth
      const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * maxThumbLeft

      this.hThumb.style.width = `${thumbWidth}px`
      this.hThumb.style.left = `${Math.max(this.config.thumbPadding, Math.min(thumbLeft + this.config.thumbPadding, maxThumbLeft + this.config.thumbPadding))}px`
      this.hThumb.style.height = `${this.config.thumbSize}px`
      this.hThumb.style.top = `${this.config.thumbPadding}px`
    }

    // Corner element (fills the gap when both scrollbars are visible)
    this.corner.style.display = (needsVertical && needsHorizontal) ? "block" : "none"
    if (needsVertical && needsHorizontal) {
      this.corner.style.position = "fixed"
      this.corner.style.bottom = `${window.innerHeight - rect.bottom}px`
      this.corner.style.right = `${window.innerWidth - rect.right}px`
      this.corner.style.width = `${this.config.scrollbarSize}px`
      this.corner.style.height = `${this.config.scrollbarSize}px`
    }
  }

  onScroll() {
    this.updateBars()
  }

  setupTrackClick(track, axis) {
    track.addEventListener("pointerdown", (e) => {
      // Don't handle clicks on the thumb itself
      if (e.target !== track) return

      e.preventDefault()
      const rect = track.getBoundingClientRect()
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = this.scroller

      if (axis === "vertical") {
        const scrollable = scrollHeight - clientHeight
        const clickY = e.clientY - rect.top
        const trackHeight = rect.height
        const scrollRatio = clickY / trackHeight
        this.scroller.scrollTop = scrollRatio * scrollable
      } else {
        const scrollable = scrollWidth - clientWidth
        const clickX = e.clientX - rect.left
        const trackWidth = rect.width
        const scrollRatio = clickX / trackWidth
        this.scroller.scrollLeft = scrollRatio * scrollable
      }
    })
  }

  setupDrag(thumb, axis) {
    let startPos = 0
    let startScroll = 0

    const onPointerMove = (e) => {
      e.preventDefault()
      const delta = axis === "vertical" ? e.clientY - startPos : e.clientX - startPos
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = this.scroller

      // Check if both scrollbars are visible for proper constraints
      const needsVertical = scrollHeight > clientHeight + 1
      const needsHorizontal = scrollWidth > clientWidth + 1

      if (axis === "vertical") {
        const scrollable = scrollHeight - clientHeight
        // Thumb scrollable area accounts for padding and corner constraints
        const totalPadding = this.config.thumbPadding * 2
        let thumbScrollable = clientHeight - thumb.offsetHeight - totalPadding
        if (needsHorizontal) {
          thumbScrollable -= this.config.scrollbarSize // Additional constraint when horizontal scrollbar is visible
        }
        const newScroll = startScroll + (delta / thumbScrollable) * scrollable
        this.scroller.scrollTop = Math.max(0, Math.min(newScroll, scrollable))
      } else {
        const scrollable = scrollWidth - clientWidth
        // Thumb scrollable area accounts for padding and corner constraints
        const totalPadding = this.config.thumbPadding * 2
        let thumbScrollable = clientWidth - thumb.offsetWidth - totalPadding
        if (needsVertical) {
          thumbScrollable -= this.config.scrollbarSize // Additional constraint when vertical scrollbar is visible
        }
        const newScroll = startScroll + (delta / thumbScrollable) * scrollable
        this.scroller.scrollLeft = Math.max(0, Math.min(newScroll, scrollable))
      }
    }

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", onPointerUp)
      thumb.style.pointerEvents = "auto"
    }

    thumb.addEventListener("pointerdown", (e) => {
      e.preventDefault()
      e.stopPropagation()

      startPos = axis === "vertical" ? e.clientY : e.clientX
      startScroll = axis === "vertical" ? this.scroller.scrollTop : this.scroller.scrollLeft

      // Adjust for thumb padding offset
      if (axis === "vertical") {
        const thumbTop = parseFloat(thumb.style.top) || 0
        startPos -= thumbTop - this.config.thumbPadding
      } else {
        const thumbLeft = parseFloat(thumb.style.left) || 0
        startPos -= thumbLeft - this.config.thumbPadding
      }

      thumb.style.pointerEvents = "none" // prevent text selection issues
      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", onPointerUp, { once: true })
    })
  }

  update(update) {
    if (update.docChanged || update.viewportChanged || update.geometryChanged) {
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => this.updateBars())
    }
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.scroller.removeEventListener("scroll", this.onScroll)
    window.removeEventListener('resize', this.windowResizeHandler)
    this.vTrack.remove()
    this.hTrack.remove()
    this.corner.remove()
  }
}

/**
 * Create CodeMirror custom scrollbars extension
 *
 * @param {Object} config - Configuration options for the scrollbars
 * @returns {Array} CodeMirror extension array
 */
export function customScrollbars(config = {}) {
  return [
    createScrollbarTheme(config),
    ViewPlugin.fromClass(CustomScrollbars, { config })
  ]
}

// Export default configuration for reference
export { DEFAULT_CONFIG }