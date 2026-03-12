# Frontend Design Specification: ELEMNT RENTALS Rebrand

## 1. Core Brand Identity (Technical Config)

### 1.1 Color Palette (Tailwind CSS v4)
The website utilizes a curated, harmonious palette inspired by nature and architectural materials. We avoid pure white (#FFFFFF) and pure black (#000000) to maintain a premium feel.

```css
/* brand-tokens.css */
@theme inline {
  --color-brand-sand: #cfbb9b;   /* Gold/Tan - Accents, Secondary Buttons, Badges */
  --color-brand-sage: #527858;   /* Soft Green - Icons, Success States, Filters */
  --color-brand-forest: #265140; /* Deep Green - Primary Backgrounds, Headers, Loading states */
  --color-brand-olive: #4b3d1c;  /* Warm Dark Brown - Main Typography, Brand Borders */
  --color-brand-bone: #e6e3d7;   /* Off-White - Main Page Backgrounds */
  --color-brand-cream: #f4f2eb;  /* Light Beige - Card Backgrounds, Form Containers */
}
```

### 1.2 Typography Strategy
- **Headings & Labels: Berlin Sans.** 
  - Used for Titles (H1-H3), Navigation links, Table headers, and Form labels.
  - Characterized by clean, geometric lines. Often used with `uppercase` and `tracking-widest` for a modern look.
- **Body & Luxury text: MegantZ.**
  - Used for property descriptions, subtitles, and detailed content.
  - Evokes an elegant "editorial" or boutique hotel vibe.
- **Micro-Copy:** System Sans-serif (Inter/Roboto) is acceptable for small utility text (timestamps, counts) for maximum readability.

---

## 2. Public Interface Design

### 2.1 Hero Section (Homepage)
- **Background:** Subtle `brand-forest` tint (3%) with ambient glows.
- **Headline:** Full color in `brand-olive` (#4b3d1c). No high-contrast spans for a cleaner look.
- **Subtitle:** Increased font size (**1.45rem**) and generous line-height (**2.0**) for an "airy" luxury feel.
- **Search Widget:** Architectural cards with `shadow-brand` and `rounded-sm`.

### 2.2 Property Listing & Cards
- **Card Background:** `brand-cream` (#f4f2eb).
- **Shadows:** Olive-tinted soft shadows `0 4px 20px rgba(75,61,28,0.08)`.
- **Interactions:** 5px vertical translation + `brand-sand` border on hover.
- **Images:** Applied 20% `brand-forest` overlay on hover to unify visual photography.

### 2.3 Partners Page (Owners)
- **Visual Steps:** 3-step grid for owner onboarding ("Evaluate", "Prepare/Promote", "Manage") using Berlin Sans sub-headers.
- **Tone:** Professional yet welcoming. Strategic management and profitability are the core messages.

---

## 3. Administrator Interface Design (NEW)

The Admin Portal transitions away from generic "Dark Mode" or "White Mode" to a **"Luxury Light"** theme.

### 3.1 Layout & Navigation
- **Page Background:** Solid `brand-bone` (#e6e3d7).
- **Sidebar:** Transitions from dark to a refined Forest Green or transparent Olive palette (WIP).
- **Header:** Simplified with Breadcrumbs in Berlin Sans and the `Logo_principal_negro.png`.

### 3.2 Tables & Data Visualization
- **Header Style:** Berlin Sans, `text-xs`, `font-bold`, `uppercase`, `tracking-widest`. Color: `brand-forest`.
- **Row Style:** `brand-cream` or transparent with 1px `brand-olive` border (opacity 10%).
- **Interactive Elements:**
  - **Edit/Actions:** Simple olive borders or sage icons.
  - **Status Badges:** Rounded-sm, using translucent brand colors (e.g., Forest background with 10% opacity for "Confirmed").

### 3.3 Forms & Modals
- **Construction:** Architectural cards with `rounded-sm`.
- **Inputs:** 
  - Background: `#e6e3d7` (Bone) or slightly transparent Cream. 
  - Labels: Berlin Sans, `text-xs`, `uppercase`.
  - Focus: `brand-sand` border with 3px soft glow.
- **Buttons (Action Hierarchy):**
  - **Primary (Add/Save):** Forest Green background, Bone text.
  - **Secondary/Neutral:** Outline style with Forest Green border.
  - **Dangerous (Delete):** Subtle red-tinted background, but refined to avoid "cheap" alerts.

### 3.4 Summary Cards (Finances/Stats)
- Use subtle gradients of Forest Green -> Sage for a professional "growth" aesthetic.
- Progress bars should use `brand-sage` as the fill color.

---

## 4. Visual Assets & Implementation

### 4.1 UI Style Constraints
1.  **Border Radius:** Strictly `rounded-sm` (2px - 4px) to mimic modern architectural lines. Avoid fully rounded (pills) except for small status badges.
2.  **Line Height:** Global paragraphs `p` use `line-height: 1.8`. Hero and Partners detail texts use `2.1`.
3.  **Loading States:** Custom spinners using `brand-forest` (#265140) instead of generic gray.

### 4.2 Logo Mapping
- **Public Header:** White typographic over Forest.
- **Public Footer:** Full color over Bone/Cream.
- **Admin Portal:** Black typographic or color version for professional clarity.

---

## 5. CSS Utility Standards
Agents should use these tokens in `globals.css` or inline styles:

| Token | Class / Value | Use Case |
| :--- | :--- | :--- |
| **Headline** | `font-family: 'Berlin Sans'; color: #4b3d1c;` | All Titles |
| **Luxury Text** | `font-family: 'MegantZ'; line-height: 1.8;` | Descriptions |
| **Premium Shadow** | `rgba(75, 61, 28, 0.08)` | Main Cards |
| **Brand Border** | `1px solid rgba(82,120,88,0.12)` | Subtle Separation |
| **Action Highlight** | `#cfbb9b` (Sand) | Buttons & Badges |
