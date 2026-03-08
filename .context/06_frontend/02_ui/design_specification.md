# Frontend Design Specification: ELEMNT RENTALS Rebrand

## 1. Core Brand Identity (Technical Config)

### 1.1 Color Palette (Tailwind CSS)
The website must move away from pure `#FFFFFF` and `#000000`. Use the following hex codes:

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          sand: '#cfbb9b',       // Accents / Highlighting
          sage: '#527858',       // Secondary / Buttons
          forest: '#265140',     // Primary / Dark Backgrounds
          olive: '#4b3d1c',      // Main Typography / Contrast
          bone: '#e6e3d7',       // Page Background (Primary)
          cream: '#f4f2eb',      // Lighter variant for cards
        }
      }
    }
  }
}
```

### 1.2 Typography Strategy
*   **Primary Font: Berlin Sans.** Use for Headings (H1, H2), Navigation, and Brand Callouts.
*   **Secondary Font: MegantZ.** Use for luxury descriptions, specific labels (like "Rentals"), and sub-headers.
*   **System Fallback:** Sans-serif for body text if readability on small screens is an issue, but prioritize MegantZ for the "boutique" feel.

---

## 2. Global Component Refactoring

### 2.1 Navigation Bar (Header)
*   **Background:** Change from white to `brand-forest` (#265140).
*   **Logo:** Use the "Blanco sobre negro" (White on Dark) PNG provided in the assets.
*   **Nav Links:** Text color `brand-bone`. On hover, transition to `brand-sand`.
*   **Language Switcher/User Icon:** Stroke color should be `brand-sand`.

### 2.2 Global Page Styles
*   **Body Background:** Set all main page wrappers to `bg-brand-bone` (#e6e3d7). This is the most significant change to achieve the luxury "organic" look.
*   **Container Shadows:** Replace harsh black shadows with soft olive-tinted shadows: `shadow-[0_4px_20px_rgba(75,61,28,0.08)]`.

### 2.3 Buttons & CTAs
*   **Primary Button:** Background `brand-forest`, Text `brand-bone`, Font: **Berlin Sans** (Uppercase).
*   **Secondary/Book Button:** Background `brand-sand`, Text `brand-olive`.
*   **Hover States:** Slight scale-up (`scale-105`) and darken background by 10%.

---

## 3. Specific Page Overhauls

### 3.1 Partners Page (`/es/partners`)
*   **Hero Section:** The current white background needs to be replaced. Use a full-width section with `bg-brand-forest`. 
*   **Content Cards:** The cards explaining "Por qué unirse" should have `bg-brand-cream` and borders in `brand-sage`.
*   **Form Design:** 
    *   Inputs should have a background of `brand-bone` (slightly darker than the card).
    *   Focus border should be `brand-sand`.
    *   Submit button must use **Berlin Sans**.

### 3.2 Property Detail & Gallery (`/es/property/suite-sierra`)
*   **Gallery Grid:** Ensure the images have a `rounded-sm` (small radius) rather than being sharp or fully rounded. This fits the architectural logo style.
*   **Sticky Booking Widget (Right Side):**
    *   Change the container background to `brand-forest`.
    *   Price text should be in **Berlin Sans** color `brand-sand`.
    *   Booking button: Large, `brand-sand` background with `brand-olive` text.
*   **Description Text:** The property description ("Ubicada en el corazón...") should use **MegantZ** with a line height of `1.8` to evoke a "magazine" feel.
*   **Amenities Icons:** Replace default colors with `brand-sage` (#527858).

---

## 4. Visual Assets Implementation (Logos)

| Asset Context | Logo Version to Use | Filename |
| :--- | :--- | :--- |
| **Header (Sticky)** | White over Forest Green | `Logo_principal_blanco.png` |
| **Footer** | Main Logo (Colored) over Bone | `Logo_colores_principales.png` |
| **Mobile / Minimal** | Typographic White | `Logo_tipografico_blanco.png` |
| **Admin / High Contrast** | Main Logo (Black) | `Logo_principal_negro.png` |

### 4.1 Use of Black Logos
The "Negro" (Black) versions (`Logo_principal_negro.png` and `Logo_tipografico_negro.png`) are reserved for:
*   High-contrast printing needs.
*   Minimalist UI sections with pure white or light cream backgrounds where the brand colors are not desired.
*   Admin dashboard sections where a "neutral" look is preferred.

---

## 5. UX/UI Micro-Interactions for Next.js
1.  **Image Overlays:** When hovering over property images in the gallery, apply a subtle `brand-forest` tint (opacity 20%).
2.  **Transitions:** Use Framer Motion or standard Tailwind transitions for page entries.
    *   *Effect:* Fade-in with a 20px upward slide to match the "rising buildings" in the logo.
3.  **Scroll Behavior:** Implement a smooth scroll. The header should transition from `transparent` to `brand-forest` upon scrolling 50px.

---

## 6. CSS Overrides for Agent Implementation
If using a global CSS file, ensure these overrides are active:

```css
h1, h2, h3, .brand-heading {
  font-family: 'Berlin Sans', sans-serif;
  color: #4b3d1c; /* brand-olive */
  letter-spacing: -0.02em;
}

p, .luxury-text {
  font-family: 'MegantZ', serif;
  color: #4b3d1c;
}

.property-card {
  background-color: #f4f2eb;
  transition: transform 0.3s ease;
}

.property-card:hover {
  transform: translateY(-5px);
  border: 1px solid #cfbb9b;
}
```
