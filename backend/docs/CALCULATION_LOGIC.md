# Calculation Logic Notes

## Aggregation scopes
- IN channels are aggregated per room.
- OUT channels are aggregated per level.
- GENERAL channels are aggregated per project.

## Product allocation
- candidate products are sorted by largest capacity first
- allocation tries to minimize total cost, then excess, then product count
- unmet requirements are returned in the calculation response
- diagnostics include `requirementsSummary` and `allocationDiagnostics`

## Services
Services can be priced:
- fixed per project
- per room
- per level
- per product quantity
- per function quantity

## Discounts
The multiplication index is matched against active discount rules and applied to the gross total.
