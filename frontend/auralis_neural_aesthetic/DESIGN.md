---
name: Auralis Neural Aesthetic
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
  canvas-bg: '#F7F7F5'
  panel-bg: '#F3F2EF'
  card-bg: '#FCFCFB'
  border-subtle: '#E7E7E4'
  success-emerald: '#10B981'
  neural-pink: '#F43F5E'
  neural-purple: '#8B5CF6'
  neural-blue: '#3B82F6'
typography:
  h1:
    fontFamily: Geist
    fontSize: 84px
    fontWeight: '600'
    lineHeight: '1.05'
    letterSpacing: -0.04em
  h1-mobile:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  h2:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  h2-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h3:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-metrics:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit_base: 8px
  gutter: 32px
  section_gap_desktop: 180px
  section_gap_mobile: 80px
  container_max: 1280px
  edge_margin: 32px
---

## Brand & Style

Auralis embodies a "Neural Minimalist" aesthetic, blending the precision of developer-centric tools with the ethereal nature of high-fidelity audio. The brand personality is professional, sophisticated, and technologically advanced yet deeply human.

The design style is a sophisticated mix of **Minimalism** and **Glassmorphism**. It utilizes a "light-mode-first" approach with a warm, paper-like background base to prevent clinical coldness. Visual interest is driven by vibrant, blurred gradients ("orbs") that symbolize sound waves and artificial intelligence, contained within highly structured, crisp container systems. The emotional response should be one of "effortless power"—a complex engine hidden behind a pristine, calm interface.

## Colors

The palette is rooted in a "Warm Monochromatic" foundation, punctuated by "Neural Accents."

- **Foundation:** The primary surface (`#F7F7F5`) is a warm off-white, paired with pure black (`#000000`) for high-contrast typography.
- **Tonal Neutrals:** Secondary and tertiary surfaces use subtle shifts in warmth (`#F3F2EF` and `#FCFCFB`) to define hierarchy without relying on heavy borders or shadows.
- **Neural Accents:** Use vibrant, multi-color gradients (Rose, Orange, Indigo, Purple, Emerald) exclusively for data visualizations, AI "state" indicators, and decorative background blurs. These represent the "intelligence" layer.
- **Functional Colors:** Use Emerald for "Live" or "Active" states, providing a clear, high-contrast signal against the neutral background.

## Typography

The system uses **Geist** exclusively to maintain a technical, clean, and modern feel. 

- **Display:** Large headlines utilize aggressive negative letter-spacing and tight line heights to create a "blocky" impact, characteristic of premium tech brands.
- **Hierarchy:** Use `label-caps` for eyebrows and section headers to provide structural clarity.
- **Metrics:** For data displays (latency, timestamps), use the semi-mono properties of Geist to ensure numerical alignment.
- **Readability:** Body text should maintain a generous line height (1.6) to balance the high density of the technical information panels.

## Layout & Spacing

The layout follows a **Fixed Grid** model with a maximum width of 1280px.

- **Grid:** Use a 12-column system for desktop. Sections typically span 12 columns for hero areas, or 6/6 and 7/5 splits for feature modules.
- **Rhythm:** A vertical spacing scale of 140px-180px between major sections creates a high-end, editorial feel with significant whitespace.
- **Responsive:** On mobile, margins reduce to 24px, and vertical section gaps compress to 80px. Multi-column grids reflow to a single stack, with the exception of 4-column "small card" grids which reflow to 2x2.
- **Nav:** A fixed 72px top navigation bar with a backdrop-blur effect ensures persistent accessibility without visual weight.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional shadows.

- **Tiers:** 
  - Level 0: Canvas (`#F7F7F5`)
  - Level 1: Large Panels/Cards (`#F3F2EF` or `#FCFCFB`) with `1px` borders.
  - Level 2: Glass Widgets (25% opacity white with `40px` backdrop blur) used for overlaying technical data over gradients.
- **Outlines:** Use subtle, low-contrast borders (`#E7E7E4`) to define container boundaries.
- **Shadows:** Reserved strictly for high-interaction elements like play buttons or floating widgets. Use a `shadow-lg` (diffused, low-opacity gray) to imply "hover" or "active" states.

## Shapes

The shape language is primarily **Pill-shaped** for interactive elements and **Super-elliptical** for containers.

- **Buttons/Chips:** Always use `rounded-full` (pill shape). This softens the technical nature of the Geist typeface.
- **Primary Containers:** Use a large `rounded-3xl` (1.75rem) for main product panels and feature cards.
- **Nested Elements:** Follow the "inner radius = outer radius - padding" logic, but maintain a minimum of `rounded-xl` for card-like components.
- **AI Visuals:** Use perfectly circular orbs with high blur values (`80px+`) to create organic, non-geometric depth.

## Components

- **Buttons:** 
  - *Primary:* Solid black background, white text, pill-shaped. On hover: 90% opacity.
  - *Secondary:* Transparent background, 1px border (`#747878`), black text, pill-shaped.
- **Segmented Controls:** Housed in a pill-shaped container (`surface-container-low`). Active state is a white pill with a subtle shadow; inactive is text-only.
- **Glass Widgets:** The signature "Neural" component. Use `white/25` background, `white/40` border, and `backdrop-blur-3xl`. Inside, use high-contrast black text and vibrant emerald/blue accents for data.
- **Status Indicators:** Small 8px circles. Use `animate-pulse` for "Live" or "Active" states.
- **Cards:** 
  - *Feature Cards:* `300px` to `450px` height, `rounded-3xl`, subtle 1px border. 
  - *Small Icon Cards:* Square-ish, `rounded-xl`, light gray background, icons in primary black.
- **Spectral Visualizer:** Vertical bars with rounded caps. Use gradients (Blue to Purple) to indicate frequency intensity.