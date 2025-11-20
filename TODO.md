# TODO: Fix Scroll Position Restoration on Back Button

## Steps to Complete

- [ ] Add useLocation import to Menu.tsx and News.tsx.
- [ ] Update the useEffect for scroll restoration to depend on [loading, location.pathname] instead of just [loading].
- [ ] Test the changes to ensure scroll position is correctly restored after navigating back from detail pages.

## Notes
- This will ensure the effect runs on every navigation change, including back button presses.
- Remove this TODO.md file after all steps are completed.
