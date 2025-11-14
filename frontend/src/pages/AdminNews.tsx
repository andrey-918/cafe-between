import { useEffect, useState } from 'react';
import type { NewsItem } from '../types';
import { fetchNews, createNewsItem, updateNewsItem, deleteNewsItem } from '../api';

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageURLs: [''],
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await fetchNews();
      setNews(data);
    } catch (err) {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateNewsItem(editingItem.id, formData);
      } else {
        await createNewsItem(formData);
      }
      loadNews();
      resetForm();
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      imageURLs: item.imageURLs || [''],
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteNewsItem(id);
        loadNews();
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      imageURLs: [''],
    });
  };

  const addImageURL = () => {
    setFormData({ ...formData, imageURLs: [...formData.imageURLs, ''] });
  };

  const updateImageURL = (index: number, value: string) => {
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
        <h2>Admin - News Management</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Image URLs:</label>
            {formData.imageURLs.map((url, index) => (
              <div key={index} className="image-url-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageURL(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {url && (
                  <div className="image-preview">
                    <img src={url} alt={`Preview ${index + 1}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  </div>
                )}
                {formData.imageURLs.length > 1 && (
                  <button type="button" onClick={() => removeImageURL(index)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageURL}>Add Image URL</button>
          </div>
          <div className="form-actions">
            <button type="submit">{editingItem ? 'Update' : 'Create'}</button>
            {editingItem && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <h3>Existing Items</h3>
        {loading ? <p>Loading...</p> : (
          <div className="admin-list">
            {news.map((item) => (
              <div key={item.id} className="admin-item">
                <div className="item-info">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminNews;
