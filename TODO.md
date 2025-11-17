# TODO: Display Category Names in Russian on Frontend

## Current Status
- AdminMenu.tsx: Already displays categories in Russian (name_ru)
- Menu.tsx: Correctly maps name_en to name_ru for section headers and now passes Russian category to MenuItemCard
- MenuItemDetail.tsx: Now fetches categories dynamically and uses name_ru for display
- MenuItemCard.tsx: Now accepts and displays category prop below the title
- Backend API: Returns both name_ru and name_en

## Changes Made
1. ✅ Updated MenuItemCard.tsx to accept category prop and display it
2. ✅ Updated Menu.tsx to pass Russian category name to MenuItemCard
3. ✅ Updated MenuItemDetail.tsx to fetch categories and use dynamic mapping instead of hardcoded switch
4. ✅ Built and started the application for testing

## Testing
- Frontend dev server running on http://localhost:5174/
- Backend server running
- Need to verify that categories now display in Russian in menu cards and detail pages

## Next Steps
- Check the menu page to ensure categories are displayed in Russian in the cards
- Check individual menu item detail pages to ensure categories are in Russian
- Ensure no English category names are visible to users
