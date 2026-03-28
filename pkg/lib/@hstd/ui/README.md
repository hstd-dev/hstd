# @hstd/ui

Accessible UI primitives for HyperStandard — the foundation for component libraries.

## Overview

`@hstd/ui` provides a comprehensive set of unstyled, accessible UI primitives built natively for hstd. Inspired by Radix UI and Base UI, these components handle complex interaction patterns, accessibility, and state management while giving you full control over styling.

## Installation

```bash
npm install @hstd/ui @hstd/std
```

## Features

- **Accessible by default** — Full WAI-ARIA compliance
- **Unstyled** — Bring your own styles with `css` bindings
- **Composable** — Build complex UIs from simple primitives
- **Reactive** — Native hstd Pointer integration
- **Keyboard navigation** — Complete keyboard support

## Components

### Dialog & Overlays
- `Dialog` — Modal dialog
- `AlertDialog` — Confirmation dialog
- `Popover` — Floating content panel
- `Tooltip` — Informational popup
- `HoverCard` — Rich preview on hover
- `Toast` — Transient notifications

### Menus
- `DropdownMenu` — Button-triggered menu
- `ContextMenu` — Right-click menu
- `Menubar` — Horizontal menu bar
- `NavigationMenu` — Site navigation

### Form Controls
- `Checkbox` — Checkable input
- `RadioGroup` — Single-select options
- `Switch` — Toggle switch
- `Slider` — Range input
- `Select` — Custom dropdown select
- `Toggle` — Two-state button
- `ToggleGroup` — Grouped toggles
- `Label` — Form label

### Layout
- `Accordion` — Collapsible sections
- `Tabs` — Tabbed interface
- `Collapsible` — Expandable content
- `ScrollArea` — Custom scrollbars
- `Separator` — Visual divider
- `Toolbar` — Grouped controls

### Display
- `Avatar` — User image with fallback
- `Progress` — Progress indicator

### Core Utilities
- `Portal` — Render outside DOM hierarchy
- `Presence` — Animated mount/unmount
- `FocusScope` — Focus trapping
- `DismissableLayer` — Click outside handling
- `Popper` — Floating positioning
- `VisuallyHidden` — Screen reader only
- `Slot` — Component composition

## Usage

```javascript
import { h as html, $, css, on } from "@hstd/std";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@hstd/ui";

function MyDialog() {
  return Dialog({
    children: html`
      ${DialogTrigger({ children: "Open Dialog" })}
      ${DialogPortal({
        children: html`
          ${DialogOverlay({
            [css]: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          })}
          ${DialogContent({
            [css]: {
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "450px",
            },
            children: html`
              ${DialogTitle({ children: "Dialog Title" })}
              ${DialogDescription({
                children: "This is the dialog description.",
              })}
              ${DialogClose({ children: "Close" })}
            `,
          })}
        `,
      })}
    `,
  });
}
```

## Styling

All components accept hstd's `css` binding for styling:

```javascript
import { css } from "@hstd/std";
import { Button } from "@hstd/ui";

Button({
  [css]: {
    backgroundColor: "blue",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
  },
  children: "Click me",
});
```

## Data Attributes

Components expose `data-state` and other attributes for styling different states:

```css
[data-state="open"] { /* styles for open state */ }
[data-state="closed"] { /* styles for closed state */ }
[data-disabled] { /* styles for disabled state */ }
[data-highlighted] { /* styles for highlighted/focused item */ }
```

## Accessibility

All components follow WAI-ARIA patterns:
- Proper ARIA roles and attributes
- Keyboard navigation
- Focus management
- Screen reader announcements

## License

MIT
