# TODO: Add Scheduling for News/Events Posting

## Backend Changes
- [x] Update `backend/models/news_repository.go`: Modify `GetNews()` to filter where `postedAt <= NOW()` and order by `postedAt DESC`.

## Frontend Admin Changes
- [x] Update `frontend/src/pages/AdminNews.tsx`: Add `postedAt` datetime input to the form. If not provided, set to current time for immediate posting.
- [x] Update `frontend/src/api.ts`: Include `postedAt` in `createNewsItem` and `updateNewsItem` types and calls.

## Frontend Display Changes
- [x] Update `frontend/src/pages/News.tsx`: Remove frontend sorting since backend will handle it.
- [x] Verify `frontend/src/pages/Home.tsx`: Already fetches and sorts news, takes first 3 (should work with backend changes).

## Testing
- [ ] Test creating news with future postedAt (should not appear until time).
- [ ] Test immediate posting.
- [ ] Verify sorting in News page.
- [ ] Verify last 3 events in Home page.
