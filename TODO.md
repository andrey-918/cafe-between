# TODO: Add Caching to Cafe-Between Backend

- [x] Add go-cache dependency to backend
- [x] Modify main.go to import and initialize cache with 7-day default expiration
- [x] Update GetMenuHandler in menuHandlers.go to check cache first, fetch from DB if miss, and cache result
- [x] Update CreateMenuItemHandler, UpdateMenuHandler, DelMenuItemHandler in menuHandlers.go to invalidate "menu" and "menu_categories" cache keys
- [x] Update GetMenuCategoriesHandler in menuCategoryHandlers.go to check cache first, fetch from DB if miss, and cache result
- [x] Update UpdateMenuCategorySortOrderHandler in menuCategoryHandlers.go to invalidate "menu_categories" cache key
- [x] Update GetNewsHandler in newsHandlers.go to check cache first, fetch from DB if miss, and cache result
- [x] Update CreateNewsHandler, UpdateNewsHandler, DelNewsHandler in newsHandlers.go to invalidate "news" cache key
- [x] Run go mod tidy to clean up dependencies
- [ ] Test the caching implementation by running the server and checking API responses
