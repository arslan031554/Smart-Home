# Master Data Seed – Assumptions and Sources

This document describes the origin and status of seeded data used by `scripts/seed-master-data.js` and `data/master-data.js`.

## Client-aligned / business names

- **Building types**: House, Apartment, Villa, Office, Commercial – generic but business-friendly.
- **Room types**: Living Room, Bedroom, Kitchen, Bathroom, Hallway, Office, Dining Room, Garage, Basement, Terrace – standard residential/commercial.
- **Smart functions**: Lighting, Climate/HVAC, Security, Audio/Video, Shading & Blinds, Energy Monitoring, Access Control, Video Doorbell/Cameras – names and channel types (IN/OUT/GENERAL) aligned with typical smart-home product logic.
- **Product ranges**: Standard, Premium, Essential – placeholder range names until client provides final names.
- **Colors**: White, Black, Anthracite, Silver, Aluminium – common hardware finishes.
- **Offer conditions / disclaimers**: Generic commercial wording (validity, VAT, installation, specs). Replace with client legal text before production.

## Provisional / testing-only (replace with client data)

- **Discount rules**: `minMultiplier`/`maxMultiplier`/`discountPercent` tiers are sample values. Replace with client pricing rules.
- **Products**: Codes and `unitPriceEurExVat` are placeholders. Sync with real catalog and ProductFunctionMapping (capacity, priority, calculationScope, channelType) when available.
- **Services**: Installation and Configuration with sample pricing modes and prices. Replace with client service list and pricing.

## Re-run and idempotency

- The seed script uses `findOrCreate` (or equivalent) so re-running is safe and idempotent.
- Test users (e.g. admin@test.com, user@test.com) are updated if they already exist so passwords stay in sync with script defaults.

## Replacing with real client data

1. Update `backend/data/master-data.js` with client-provided arrays (building types, room types, smart functions, ranges, colors, conditions, disclaimers, discount rules, products, services).
2. Add or run separate scripts for ProductRangeProduct, ProductColorProduct, and ProductFunctionMapping if the client supplies range/color/function mappings.
3. Re-run: `node scripts/seed-master-data.js` from the backend directory.
