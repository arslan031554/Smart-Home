# Frontend Handoff Notes

## Critical business flow
1. guest starts configurator
2. draft is saved locally and to guest draft API
3. user logs in or verifies OTP
4. guest draft attaches to account
5. configurator restores exact step and continues
6. offer generates and success screen clears active draft

## Recommended final QA
- refresh recovery at each step
- login attach recovery
- OTP verification attach recovery
- generate offer without losing range/color/services/comments
