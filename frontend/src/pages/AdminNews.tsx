import { useEffect, useState } from 'react';
import type { NewsItem } from '../types';
import { fetchNews, createNewsItem, updateNewsItem, deleteNewsItem, getImageUrl } from '../api';
import { useNotifications } from '../contexts/NotificationContext';
import '../style/admin.css';

const AdminNews = () => {
  const { addNotification } = useNotifications();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const getMoscowTimeString = () => {
    const now = new Date();
    const moscowOffset = 3 * 60 * 60 * 1000; // 3 hours in ms
    const moscowTime = new Date(now.getTime() + moscowOffset);
    return moscowTime.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    preview: '',
    description: '',
    imageURLs: [] as (string | File)[],
    postedAt: getMoscowTimeString(),
  });

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNews();
      const newsArray = Array.isArray(data) ? data : [];
      setNews(newsArray);
    } catch (err) {
      addNotification('error', 'Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.preview?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) errors.title = 'Введите заголовок';
    if (!formData.description.trim()) errors.description = 'Введите описание';
    if (formData.preview.length > 50) errors.preview = 'Превью слишком длинное (макс. 50 символов)';
    if (formData.description.length > 250) errors.description = 'Описание слишком длинное (макс. 250 символов)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification('error', 'Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setSubmitting(true);
    let postedAt: string;
    if (formData.postedAt) {
      // Convert the input (which is in local time, but we treat as Moscow) to UTC
      const selectedTime = new Date(formData.postedAt + ':00'); // Add seconds
      postedAt = selectedTime.toISOString();
    } else {
      postedAt = new Date().toISOString();
    }
    const dataToSend = {
      ...formData,
      postedAt,
    };
    try {
      if (editingItem) {
        await updateNewsItem(editingItem.id, dataToSend);
        addNotification('success', 'Событие успешно обновлено');
      } else {
        await createNewsItem(dataToSend);
        addNotification('success', 'Событие успешно создано');
      }
      loadNews();
      resetForm();
      setShowForm(false);
    } catch (err) {
      addNotification('error', 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    // Convert postedAt from UTC to Moscow time for display
    const postedAtMoscow = new Date(item.postedAt);
    postedAtMoscow.setHours(postedAtMoscow.getHours() + 3); // Add 3 hours for Moscow
    const postedAtString = postedAtMoscow.toISOString().slice(0, 16);
    setFormData({
      title: item.title,
      preview: item.preview || '',
      description: item.description || '',
      imageURLs: (item.imageURLs || []).map(url => typeof url === 'string' ? getImageUrl(url) : url),
      postedAt: postedAtString,
    });
    setShowForm(true);
    setFormErrors({});
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Уверены, что хотите удалить этот элемент? Это действие нельзя будет отменить')) {
      try {
        await deleteNewsItem(id);
        addNotification('success', 'Событие успешно удалено');
        loadNews();
      } catch (err) {
        addNotification('error', 'Ошибка при удалении');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элементов? Это действие нельзя будет отменить`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteNewsItem(id)));
        addNotification('success', `${selectedItems.length} элементов успешно удалено`);
        setSelectedItems([]);
        loadNews();
      } catch (err) {
        addNotification('error', 'Ошибка при удалении элементов');
      }
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredNews.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      preview: '',
      description: '',
      imageURLs: [],
      postedAt: getMoscowTimeString(),
    });
    setFormErrors({});
  };

  const addImageURL = () => {
    setFormData({ ...formData, imageURLs: [...formData.imageURLs, ''] });
  };

  const updateImageURL = (index: number, value: string | File) => {
    const newURLs = [...formData.imageURLs];
    newURLs[index] = value;
    setFormData({ ...formData, imageURLs: newURLs });
  };

  const removeImageURL = (index: number) => {
    if (formData.imageURLs.length > 1) {
      const newURLs = formData.imageURLs.filter((_, i) => i !== index);
      setFormData({ ...formData, imageURLs: newURLs });
    }
  };

  return (
    <main>
      <section className="admin">
        <div className="admin-header">
          <h2>Администрирование событий</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Скрыть форму' : '+ Добавить новый элемент'}
          </button>
        </div>



        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-header">
              <h3>{editingItem ? 'Изменить событие' : 'Добавить новое событие'}</h3>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <div className="form-content">
              <div className="form-grid">
              <div className="form-group">
                <label>Заголовок: <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={formErrors.title ? 'error' : ''}
                  placeholder="Введите заголовок"
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Опубликовать (по Москвоскому времени):</label>
                <input
                  type="datetime-local"
                  value={formData.postedAt}
                  onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Превью:</label>
                <textarea
                  value={formData.preview}
                  onChange={(e) => setFormData({ ...formData, preview: e.target.value.slice(0, 50) })}
                  maxLength={50}
                  rows={2}
                  placeholder="Введите превью"
                  className={formErrors.preview ? 'error' : ''}
                />
                <div className="char-count">
                  <span>{formData.preview.length}/50 символов</span>
                </div>
                {formErrors.preview && <span className="field-error">{formErrors.preview}</span>}
              </div>

              <div className="form-group full-width">
                <label>Описание: <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 250) })}
                  maxLength={250}
                  rows={4}
                  placeholder="Напишите описание"
                  className={formErrors.description ? 'error' : ''}
                />
                <div className="char-count">
                  <span>{formData.description.length}/250 символов</span>
                </div>
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </div>

              <div className="form-group full-width">
                <label>Изображения:</label>
                <div className="image-manager">
                  {formData.imageURLs.map((url, index) => (
                    <div key={index} className="image-input-group">
                      {typeof url === 'string' ? (
                        <div className="image-url-input">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateImageURL(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                          {url && (
                            <div className="image-preview">
                              <img src={url} alt={`Preview ${index + 1}`} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="image-file-input">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) updateImageURL(index, file);
                            }}
                          />
                          <div className="image-preview">
                            <img src={URL.createObjectURL(url)} alt={`Preview ${index + 1}`} />
                          </div>
                        </div>
                      )}
                      {formData.imageURLs.length > 1 && (
                        <button type="button" onClick={() => removeImageURL(index)} className="btn-remove">
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="image-actions">
                    <button type="button" onClick={addImageURL} className="btn-secondary">
                      + Добавить фото по ссылке
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, imageURLs: [...formData.imageURLs, new File([], '')] })} className="btn-secondary">
                      + Добавить фото с помощью файла
                    </button>
                  </div>
                </div>
              </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Сохранение...' : (editingItem ? 'Обновить событие' : 'Создать новое событие')}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary">
                  Отменить
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="items-section">
          <div className="items-header">
            <h3>События ({filteredNews.length})</h3>
            <div className="items-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {selectedItems.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedItems.length} выбрано</span>
                  <button onClick={handleBulkDelete} className="btn-danger">
                    Удалить выбранное
                  </button>
                  <button onClick={clearSelection} className="btn-secondary">
                    Очистить выбор
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Загрузка событий...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state">
              <p>События не найдены. {searchTerm ? 'Попробуйте изменить фильтр поиска' : 'Добавьте первый элемент'}</p>
            </div>
          ) : (
            <div className="admin-list">
              <div className="list-header">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredNews.length && filteredNews.length > 0}
                  onChange={selectedItems.length === filteredNews.length ? clearSelection : selectAllItems}
                />
                <span>Событие</span>
                <span>Опубликовано</span>
                <span>Действия</span>
              </div>
              {filteredNews.map((item) => (
                <div key={item.id} className={`admin-item ${selectedItems.includes(item.id) ? 'выбрано' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  <div className="item-info">
                    <div className="item-main">
                      {item.imageURLs && item.imageURLs.length > 0 && (
                        <div className="item-thumbnail">
                          <img
                            src={typeof item.imageURLs[0] === 'string' ? getImageUrl(item.imageURLs[0]) : URL.createObjectURL(item.imageURLs[0])}
                            alt={item.title}
                          />
                        </div>
                      )}
                      <div className="item-details">
                        <h4>{item.title}</h4>
                        <p className="item-description">{item.preview || item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="item-date">
                    {new Date(item.postedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)} className="btn-edit">
                      Редактировать
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminNews;
