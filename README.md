# cm6-scroller

A CodeMirror 6 plugin that replaces native browser scrollbars with custom, themed scrollbars that stay fixed to the viewport edges.

## Motivation

Scrollbar theming seems to be one of the last holdouts in developing consistent browser UIs. In particular, Firefox does not play well
with others, offering up only "thin" as a styling option. Seems devs have forgotten that *information* can be gleaned from useful scrollbars.
Like `exactly how many rows are in this table?` or `this code block is how long???`. By seeing a scrollbar that has a thumb that is 50% of the
height of the track it is in, we immediately know we're seeing only half of the story.

To help with this, there are other JavaScript libraries. Overlay Scrollbars is a favorite, but it inserts a wrapper to help it do its business
and that tends to interfere. I managed to get it working with Tabulator, but not so with CodeMirror and its aggressive layout system. By using
a plugin, the same look can be achieved, and thus the same scrollbars can be visible across the app, even in Firefox.

## Developers

This effort was very short - an evening at best. We can thank grok-code-fast-1 for the implementation here, along with all the documentation 
and coding. Largely a hands-off affair. Whether that bodes well for the future of softwware development generally is perhaps an interesting question.

## Features

- **Custom themed scrollbars** that match your design system
- **Fixed positioning** - scrollbars stay anchored to viewport edges during scrolling
- **Corner management** - properly handles the intersection when both scrollbars are visible
- **Content protection** - automatically adds padding to prevent text overlap
- **Click-to-scroll** - click anywhere in the track to jump to that position
- **Drag constraints** - thumbs respect visual track boundaries
- **Responsive** - updates automatically on resize and content changes
- **Highly configurable** - customize colors, sizes, and behavior
- **Browser ESM compatible** - works directly in browsers via CDN

## Installation

### From NPM (when published)

```bash
npm install cm6-scroller
```

### Manual Installation

1. Copy `cm6-scroller.js` and `cm6-scroller.css` to your project
2. Import the CSS file in your HTML or build process
3. Import the JavaScript module in your CodeMirror setup

## Basic Usage

### Node.js / Bundler Setup

```javascript
import { EditorView, basicSetup } from 'codemirror'
import { customScrollbars } from 'cm6-scroller'

// Include the plugin in your extensions
const extensions = [
  basicSetup,
  customScrollbars() // Add custom scrollbars
]

const view = new EditorView({
  doc: 'Your code here',
  extensions,
  parent: document.getElementById('editor')
})
```

### Browser ESM (Direct in HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include the CSS -->
  <link rel="stylesheet" href="https://esm.sh/cm6-scroller/cm6-scroller.css">
</head>
<body>
  <div id="editor"></div>

  <script type="module">
    import { EditorView, basicSetup } from 'https://esm.sh/@codemirror/basic-setup@6'
    import { customScrollbars } from 'https://esm.sh/cm6-scroller'

    const extensions = [
      basicSetup,
      customScrollbars()
    ]

    const view = new EditorView({
      doc: 'Your code here',
      extensions,
      parent: document.getElementById('editor')
    })
  </script>
</body>
</html>
```

### CDN Links

You can also load from other CDNs:

```javascript
// esm.sh (recommended)
import { customScrollbars } from 'https://esm.sh/cm6-scroller'

// skypack
import { customScrollbars } from 'https://cdn.skypack.dev/cm6-scroller'

// unpkg
import { customScrollbars } from 'https://unpkg.com/cm6-scroller@1.0.0/cm6-scroller-browser.js'
```

### Direct Browser Usage

For direct browser usage without a build process, use the browser-optimized version:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load the CSS -->
  <link rel="stylesheet" href="cm6-scroller.css">
</head>
<body>
  <div id="editor"></div>

  <script type="module">
    // Load CodeMirror from esm.sh
    import { EditorView, basicSetup } from 'https://esm.sh/@codemirror/basic-setup@6'

    // Load custom scrollbars from CDN
    import { customScrollbars } from 'https://esm.sh/cm6-scroller'

    const extensions = [
      basicSetup,
      customScrollbars({
        scrollbarSize: 14,
        thumbBackground: '#007bff'
      })
    ]

    const view = new EditorView({
      doc: 'Your code here',
      extensions,
      parent: document.getElementById('editor')
    })
  </script>
</body>
</html>
```

See `demo-browser.html` for a complete working example that demonstrates:
- Direct browser ESM imports
- Multiple editors with different configurations
- Dynamic theming with CSS variables
- Theme switching and size toggling

## Configuration

The plugin accepts a configuration object to customize appearance and behavior:

```javascript
const extensions = [
  basicSetup,
  customScrollbars({
    // Scrollbar dimensions
    scrollbarSize: 12,     // Width of vertical scrollbar, height of horizontal
    thumbSize: 8,          // Width of vertical thumb, height of horizontal thumb
    minThumbSize: 24,      // Minimum thumb size in pixels

    // Spacing
    thumbPadding: 2,       // Padding between thumb and track edges
    contentPadding: 2,     // Extra padding added to content

    // Colors (CSS custom properties or direct values)
    trackBackground: 'var(--my-track-bg, #f0f0f0)',
    thumbBackground: 'var(--my-thumb-bg, #c0c0c0)',
    thumbHoverBackground: 'var(--my-thumb-hover-bg, #a0a0a0)',
    thumbBorderRadius: 'var(--my-border-radius, 4px)',
    cornerBackground: 'var(--my-corner-bg, #f0f0f0)',

    // Border styling
    trackBorderColor: 'var(--my-border-color, #e0e0e0)',
    trackBorderWidth: 'var(--my-border-width, 1px)',

    // Animation
    transitionDuration: '0.15s',

    // Z-index
    zIndex: 1000
  })
]
```

## Styling with CSS Variables

The easiest way to customize the scrollbars is by defining CSS variables:

```css
/* Light theme */
:root {
  --cm-scrollbar-track-bg: #f0f0f0;
  --cm-scrollbar-thumb-bg: #c0c0c0;
  --cm-scrollbar-thumb-hover-bg: #a0a0a0;
  --cm-scrollbar-border-radius: 4px;
  --cm-scrollbar-corner-bg: #f0f0f0;
  --cm-scrollbar-border-color: #e0e0e0;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --cm-scrollbar-track-bg: #2a2a2a;
    --cm-scrollbar-thumb-bg: #555555;
    --cm-scrollbar-thumb-hover-bg: #777777;
    --cm-scrollbar-corner-bg: #2a2a2a;
    --cm-scrollbar-border-color: #404040;
  }
}
```

## Advanced Usage

### Custom Theme Class

Apply different scrollbar styles to different editors:

```css
/* Red theme for error panels */
.error-editor {
  --cm-scrollbar-thumb-bg: #ff6b6b;
  --cm-scrollbar-thumb-hover-bg: #ff5252;
}

/* Blue theme for info panels */
.info-editor {
  --cm-scrollbar-thumb-bg: #4ecdc4;
  --cm-scrollbar-thumb-hover-bg: #45b7aa;
}
```

```javascript
// Apply theme class to the editor container
const errorView = new EditorView({
  extensions: [basicSetup, customScrollbars()],
  parent: errorContainer
})
errorContainer.classList.add('error-editor')
```

### Multiple Editors

Each CodeMirror instance gets its own independent scrollbars:

```javascript
const editor1 = new EditorView({
  extensions: [basicSetup, customScrollbars()],
  parent: document.getElementById('editor1')
})

const editor2 = new EditorView({
  extensions: [basicSetup, customScrollbars()],
  parent: document.getElementById('editor2')
})
```

## Browser Support

- **Chrome/Edge**: Uses `-webkit-scrollbar: none` for native scrollbar suppression
- **Firefox**: Uses `scrollbar-width: none`
- **Safari**: Uses `-webkit-scrollbar: none`
- **IE11+**: Uses `-ms-overflow-style: none`

The plugin works on all modern browsers and provides fallback behavior on older browsers.

## How It Works

The plugin creates custom DOM elements that overlay the native scrollbars:

1. **Hides native scrollbars** using comprehensive CSS rules
2. **Creates fixed-position tracks** that stay at viewport edges
3. **Adds draggable thumbs** that control scrolling
4. **Manages content padding** to prevent overlap
5. **Handles corner intersection** when both scrollbars are visible

## API Reference

### `customScrollbars(config?)`

Creates the CodeMirror extension for custom scrollbars.

**Parameters:**
- `config` (Object, optional): Configuration options

**Returns:** CodeMirror extension array

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scrollbarSize` | number | 12 | Width of vertical scrollbar, height of horizontal scrollbar |
| `thumbSize` | number | 8 | Width of vertical thumb, height of horizontal thumb |
| `minThumbSize` | number | 24 | Minimum thumb size in pixels |
| `thumbPadding` | number | 2 | Padding between thumb and track edges |
| `contentPadding` | number | 2 | Additional padding added to content |
| `trackBackground` | string | `'var(--cm-scrollbar-track-bg, #f0f0f0)'` | Track background color |
| `thumbBackground` | string | `'var(--cm-scrollbar-thumb-bg, #c0c0c0)'` | Thumb background color |
| `thumbHoverBackground` | string | `'var(--cm-scrollbar-thumb-hover-bg, #a0a0a0)'` | Thumb hover background color |
| `thumbBorderRadius` | string | `'var(--cm-scrollbar-border-radius, 4px)'` | Border radius for rounded corners |
| `cornerBackground` | string | `'var(--cm-scrollbar-corner-bg, #f0f0f0)'` | Corner background color |
| `trackBorderColor` | string | `'var(--cm-scrollbar-border-color, #e0e0e0)'` | Track border color |
| `trackBorderWidth` | string | `'var(--cm-scrollbar-border-width, 1px)'` | Track border width |
| `transitionDuration` | string | `'0.15s'` | Transition duration for hover effects |
| `zIndex` | number | 1000 | Z-index for scrollbar elements |

## Troubleshooting

### Scrollbars Not Appearing

**Check:** Is your content actually overflowing?
```javascript
const { scrollHeight, clientHeight } = editor.scrollDOM
console.log('Overflow:', scrollHeight > clientHeight)
```

**Check:** Are native scrollbars properly suppressed?
```css
.cm-scroller {
  scrollbar-width: none !important; /* Firefox */
}
.cm-scroller::-webkit-scrollbar {
  display: none !important; /* Chrome/Safari */
}
```

### Content Overlapping Scrollbars

**Check:** Is content padding being applied?
```css
.cm-scroller[data-scrollbars] {
  /* Should have padding-right and/or padding-bottom */
}
```

### Thumbs Dragging Into Corner

**Check:** Are drag constraints accounting for corner space?
The plugin automatically handles this - thumbs cannot be dragged into the corner area when both scrollbars are visible.

## Files Included

- `cm6-scroller.js` - Main plugin file (for bundlers/Node.js)
- `cm6-scroller-browser.js` - Browser-optimized version (for direct ESM imports)
- `cm6-scroller.css` - CSS styles
- `demo.html` - Basic demo with local imports
- `demo-browser.html` - Advanced browser demo with CDN imports and theming
- `demo-cdn.html` - Simple CDN usage example
- `README.md` - This documentation
- `package.json` - NPM package info
- `LICENSE.md` - MIT license

## License

MIT License - feel free to use in your projects!

## Contributing

Contributions welcome! Please:

1. Test your changes across different browsers
2. Update documentation for any new features
3. Follow the existing code style

## Changelog

### v1.0.0
- Initial release
- Custom themed scrollbars
- Fixed positioning
- Click-to-scroll functionality
- Corner management
- Highly configurable API
- Browser ESM compatibility
- CDN-ready for direct browser imports

## Repository Information 
[![Count Lines of Code](https://github.com/500Foods/cm6-scroller/actions/workflows/main.yml/badge.svg)](https://github.com/500Foods/cm6-scroller/actions/workflows/main.yml)
<!--CLOC-START -->
```cloc
Last updated at 2026-05-03 20:26:08 UTC
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                       2            108            120            663
HTML                             3            108              7            638
Markdown                         2             94              4            335
JSON                             1              0              0             49
CSS                              1             12             49             45
YAML                             2              8             13             37
-------------------------------------------------------------------------------
SUM:                            11            330            193           1767
-------------------------------------------------------------------------------
2 Files were skipped (duplicate, binary, or without source code):
  gitattributes: 1
  gitignore: 1
```
<!--CLOC-END-->

## Sponsor / Donate / Support
If you find this work interesting, helpful, or valuable, or that it has saved you time, money, or both, please consider directly supporting these efforts financially via [GitHub Sponsors](https://github.com/sponsors/500Foods) or donating via [Buy Me a Pizza](https://www.buymeacoffee.com/andrewsimard500). Also, check out these other [GitHub Repositories](https://github.com/500Foods?tab=repositories&q=&sort=stargazers) that may interest you.
