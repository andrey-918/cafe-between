# TODO: Переход на локальное хранение фотографий

## Backend Changes
- [ ] Создать папку backend/uploads для хранения файлов
- [ ] Обновить backend/main.go: добавить middleware для статических файлов (/uploads)
- [ ] Обновить backend/internal/handlers/newsHandlers.go: поддержка multipart/form-data, сохранение файлов, генерация путей
- [ ] Обновить backend/internal/handlers/menuHandlers.go: аналогично newsHandlers
- [ ] Добавить валидацию файлов (тип: jpg/png, размер <5MB) в хендлерах

## Frontend Changes
- [ ] Обновить frontend/src/api.ts: изменить функции create/update на FormData
- [ ] Обновить frontend/src/pages/AdminNews.tsx: заменить URL поля на input type="file" multiple
- [ ] Обновить frontend/src/pages/AdminMenu.tsx: аналогично AdminNews

## Testing
- [ ] Тестировать загрузку файлов через админ-панель
- [ ] Проверить отображение изображений на сайте
- [ ] Проверить удаление старых файлов при обновлении/удалении записей (опционально)
