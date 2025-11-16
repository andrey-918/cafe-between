# TODO List for Fixing Menu and News Editing/Creation Issues

## Issues Identified
- Backend: `uploads` directory not created, causing file save failures (400 Bad Request)
- Frontend: Controlled input warning when switching between URL and file inputs in admin forms
- Image 404 errors due to missing uploads directory

## Tasks
- [x] Fix uploads directory creation in backend/utils.go
- [x] Fix controlled input issue in AdminMenu.tsx by using different keys for URL and file inputs
- [x] Fix controlled input issue in AdminNews.tsx by using different keys for URL and file inputs
- [ ] Test menu item creation and editing
- [ ] Test news item creation and editing
- [ ] Verify image uploads and serving work correctly
