# Design System Specification: The Architectural Perspective

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Architect"**
This design system moves beyond the standard "property management dashboard" into a high-end, editorial experience. It treats digital space like physical architecture—emphasizing structural integrity, light-filled environments, and intentional flow. 

To break the "template" look, we utilize **Asymmetric Anchoring**. While the grid remains technically sound, we use large, offset `display` typography and overlapping surface layers to create a sense of bespoke craftsmanship. The goal is to make the user feel like they are managing an elite portfolio, not just filling out rows in a database.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the "Modern Blue" heritage but elevated through Material Design 3 tonal logic.

### Core Palette
- **Primary (`#004ac6` / `primary`):** The foundation of trust. Used for high-level branding and active states.
- **Accent (`#855300` / `secondary`):** Derived from Amber Orange. Reserved strictly for financial data (prices), urgency (pending status), and high-contrast callouts.
- **Neutrals:** A sophisticated range of grays from `surface-container-lowest` (#ffffff) to `on-surface` (#191c1d).

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. We define space through **Tonal Transition**. 
- A card should not have a border; it should be a `surface-container-lowest` (#ffffff) element sitting on a `surface-container-low` (#f3f4f5) background. 
- Separation is achieved through the contrast between these two hex values, creating a "cleaner," more premium aesthetic.

### Glass & Gradient Soul
- **Signature Gradient:** Use a linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) at a 135-degree angle for Hero sections and Primary CTAs. This adds a "lithographic" depth that flat colors lacks.
- **The Glass Layer:** For floating navigation or modal headers, use `surface` at 80% opacity with a `24px` backdrop-blur. This ensures the management platform feels airy and "breathable."

---

## 3. Typography: The Editorial Voice
We use a dual-typeface system to balance authority with utility.

- **Display & Headlines (Manrope):** A geometric sans-serif with a modern, architectural feel. 
    - Use `display-lg` (3.5rem) with `-0.02em` letter spacing for room category headers.
    - Headlines should feel "oversized" to anchor the page layout.
- **Body & UI (Inter):** The industry standard for readability.
    - `body-md` (0.875rem) is our workhorse for tenant details and room descriptions.
    - `label-sm` (0.6875rem) in `all-caps` with `0.05em` tracking is used for technical metadata (e.g., SKU, Room IDs).

---

## 4. Elevation & Depth: Tonal Layering
We reject the heavy drop-shadows of the early web. Depth in this system is organic.

- **The Layering Principle:** 
    - Level 0: `surface` (The base floor).
    - Level 1: `surface-container-low` (Secondary content areas/sidebars).
    - Level 2: `surface-container-lowest` (Interactive cards/main content).
- **Ambient Shadows:** When an element must "float" (like a dropdown or an active hover card), use a shadow with a 32px blur, 0px spread, and 6% opacity using the `on-surface` color. This mimics natural light falling across a room.
- **The Ghost Border:** If accessibility requires a stroke, use `outline-variant` (#c3c6d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Structural Elements

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`) with `lg` (0.5rem) roundedness. No border. On hover, the gradient shifts brightness by 10%.
- **Secondary:** Transparent background with a `Ghost Border`. Text color is `primary`.
- **Tertiary:** No background or border. `title-sm` typography. Used for "Cancel" or "Back" actions.

### Cards & Property Lists
- **The Divider Ban:** Never use horizontal rules (`<hr>`) to separate list items. Use the `spacing-4` (1.4rem) scale to create vertical white space or shift the background of alternating rows to `surface-container-low`.
- **Pricing Chips:** Utilizing `secondary_container` (#fea619) with `on-secondary_container` (#684000) text. These must always use `full` (9999px) roundedness to contrast against the more rectangular layout.

### Input Fields
- **State Architecture:** Default state uses `surface-container-high` (#e7e8e9) as a background—not a white box. This makes the input feel "carved" into the page.
- **Focus:** The background shifts to `surface-container-lowest` (#ffffff) with a 2px `primary` "Ghost Border."

### Specialized Platform Components
- **Occupancy Meter:** A slim, horizontal bar using `primary` for filled and `surface-variant` for empty, with a subtle inner shadow to imply a "recessed" track.
- **Status Pills:** Soft-tinted backgrounds (e.g., `error_container` for overdue rent) with high-contrast text. No heavy saturation.

---

## 6. Do's and Don'ts

### Do:
- **Use "White Space" as a Component:** Treat empty space as a structural element that guides the eye.
- **Nest Surfaces:** Place a white card inside a light gray section to create natural hierarchy.
- **Align to the Typographic Baseline:** Ensure all text-heavy dorm details align to a consistent vertical rhythm.

### Don't:
- **Don't use 100% Black:** Always use `on-surface` (#191c1d) for text to maintain a high-end, "Charcoal" feel.
- **Don't use Box Shadows on everything:** Reserve shadows only for elements that physically move or overlap others.
- **Don't use sharp corners:** Even the "sharper" elements should use the `sm` (0.125rem) radius to feel approachable and professional.