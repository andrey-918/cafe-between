import { useEffect, useState } from 'react';
import type { NewsItem } from '../types';
import { fetchNews, createNewsItem, updateNewsItem, deleteNewsItem } from '../api';

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
      setError('Failed to load news');
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

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.preview.length > 50) errors.preview = 'Preview too long';
    if (formData.description.length > 250) errors.description = 'Description too long';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the form errors');
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
        setSuccess('News item updated successfully');
      } else {
        await createNewsItem(dataToSend);
        setSuccess('News item created successfully');
      }
      loadNews();
      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Failed to save item');
      setTimeout(() => setError(null), 5000);
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
      imageURLs: item.imageURLs || [],
      postedAt: postedAtString,
    });
    setShowForm(true);
    setFormErrors({});
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteNewsItem(id);
        setSuccess('News item deleted successfully');
        loadNews();
        setTimeout(() => setSuccess(null), 5000);
      } catch (err) {
        setError('Failed to delete item');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteNewsItem(id)));
        setSuccess(`${selectedItems.length} items deleted successfully`);
        setSelectedItems([]);
        loadNews();
        setTimeout(() => setSuccess(null), 5000);
      } catch (err) {
        setError('Failed to delete some items');
        setTimeout(() => setError(null), 5000);
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
          <h2>Admin - News Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Hide Form' : '+ Add New Article'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-header">
              <h3>{editingItem ? 'Edit Article' : 'Add New Article'}</h3>
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
                <label>Title: <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={formErrors.title ? 'error' : ''}
                  placeholder="Enter article title"
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Posted At (Moscow time):</label>
                <input
                  type="datetime-local"
                  value={formData.postedAt}
                  onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Preview:</label>
                <textarea
                  value={formData.preview}
                  onChange={(e) => setFormData({ ...formData, preview: e.target.value.slice(0, 50) })}
                  maxLength={50}
                  rows={2}
                  placeholder="Short preview text (optional)"
                  className={formErrors.preview ? 'error' : ''}
                />
                <div className="char-count">
                  <span>{formData.preview.length}/50 characters</span>
                </div>
                {formErrors.preview && <span className="field-error">{formErrors.preview}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description: <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 250) })}
                  maxLength={250}
                  rows={4}
                  placeholder="Full article content"
                  className={formErrors.description ? 'error' : ''}
                />
                <div className="char-count">
                  <span>{formData.description.length}/250 characters</span>
                </div>
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </div>

              <div className="form-group full-width">
                <label>Images:</label>
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
                      + Add Image URL
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, imageURLs: [...formData.imageURLs, new File([], '')] })} className="btn-secondary">
                      + Upload File
                    </button>
                  </div>
                </div>
              </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : (editingItem ? 'Update Article' : 'Create Article')}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="items-section">
          <div className="items-header">
            <h3>News Articles ({filteredNews.length})</h3>
            <div className="items-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {selectedItems.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedItems.length} selected</span>
                  <button onClick={handleBulkDelete} className="btn-danger">
                    Delete Selected
                  </button>
                  <button onClick={clearSelection} className="btn-secondary">
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading news articles...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state">
              <p>No articles found. {searchTerm ? 'Try adjusting your search.' : 'Add your first news article above.'}</p>
            </div>
          ) : (
            <div className="admin-list">
              <div className="list-header">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredNews.length && filteredNews.length > 0}
                  onChange={selectedItems.length === filteredNews.length ? clearSelection : selectAllItems}
                />
                <span>Article</span>
                <span>Posted</span>
                <span>Actions</span>
              </div>
              {filteredNews.map((item) => (
                <div key={item.id} className={`admin-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
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
                            src={typeof item.imageURLs[0] === 'string' ? item.imageURLs[0] : URL.createObjectURL(item.imageURLs[0])}
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
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">
                      Delete
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
