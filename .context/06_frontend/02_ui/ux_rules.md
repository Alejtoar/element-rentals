# UX Rules — Elemnt Rentals (MVP Phase 1)

This document defines how the website must behave from a user-experience perspective.
All frontend implementations must follow these rules.

---

## Core UX Principles

- The website exists to generate leads, not to complete bookings.
- WhatsApp is the primary conversion channel.
- The site must feel premium, simple, and trustworthy.

---

## WhatsApp as Primary CTA

- Every public page must include a visible WhatsApp contact button.
- Every property page must include at least two WhatsApp CTAs:
  - "Book via WhatsApp"
  - "Ask about this property"

These buttons must:
- Use backend-generated links
- Include property ID and language
- Pre-fill a message

---

## Mobile First

- All pages must be designed for mobile before desktop.
- WhatsApp buttons must be thumb-accessible.
- No important action may be hidden on mobile.

---

## Conversion Rules

- The user should never be more than:
  2 clicks away from contacting Elemnt Rentals.

- Property cards must always display:
  - Image
  - Price
  - Location
  - CTA

---

## Trust Signals

Every property detail page must show:
- High-quality images
- Clear price per night
- Location
- Professional tone

---

## Owner Partner UX

- Owner pages must be focused on:
  - Returns
  - Simplicity
  - Trust

- The "List my property" CTA must always be visible.

---

## Language Rules

- Language switch must be accessible from the header.
- Switching language must not reload data.
- URLs must reflect selected language (/en or /es).

---

## Error Handling

- API errors must show user-friendly messages.
- Errors must never expose technical details.

---

## Admin UX

- Admin pages must be simple and fast.
- Destructive actions must require confirmation.
- Forms must validate before submission.

---

## Forbidden Patterns

- No popups
- No forced registration
- No hidden prices
- No confusing flows

---

## Success Criteria

A visitor must be able to:
- See properties
- Understand value
- Contact Elemnt Rentals
in less than 60 seconds.
