# TODO: Fix Caching Issues

## Tasks
- [x] Add cache invalidation in DelMenuItemHandler for "menu" and "menu_categories"
- [x] Implement caching for GetMenuItemHandler using "menu_item_<id>"
- [x] Add cache invalidation for individual menu items in UpdateMenuHandler and DelMenuItemHandler
- [x] Implement caching for GetNewsByIdHandler using "news_item_<id>"
- [x] Add cache invalidation for individual news items in UpdateNewsHandler and DelNewsHandler

## Followup
- [x] Test by running the server and reloading pages to verify faster loading with cache hits
- [ ] If issues persist, consider persistent caching (e.g., Redis)
