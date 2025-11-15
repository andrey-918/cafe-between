import { useEffect, useState } from 'react';
import type { MenuItem } from '../types';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../api';

const AdminMenu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    imageURLs: [] as (string | File)[],
    calories: 0,
    description: '',
    category: '',
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      setMenu(data);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await createMenuItem(formData);
      }
      loadMenu();
      resetForm();
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      price: item.price,
      imageURLs: item.imageURLs || [],
      calories: item.calories || 0,
      description: item.description || '',
      category: item.category || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        loadMenu();
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      price: 0,
      imageURLs: [],
      calories: 0,
      description: '',
      category: '',
    });
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
        <h2>Admin - Menu Management</h2>
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
            <label>Price:</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="form-group">
            <label>Images:</label>
            {formData.imageURLs.map((url, index) => (
              <div key={index} className="image-url-group">
                {typeof url === 'string' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateImageURL(index, file);
                      }}
                    />
                    <div className="image-preview">
                      <img src={URL.createObjectURL(url)} alt={`Preview ${index + 1}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    </div>
                  </>
                )}
                {formData.imageURLs.length > 1 && (
                  <button type="button" onClick={() => removeImageURL(index)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageURL}>Add Image URL</button>
            <button type="button" onClick={() => setFormData({ ...formData, imageURLs: [...formData.imageURLs, new File([], '')] })}>Add File</button>
          </div>
          <div className="form-group">
            <label>Calories:</label>
            <input
              type="text"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 250) })}
              maxLength={250}
              rows={3}
              style={{ resize: 'vertical', minHeight: '60px', maxHeight: '120px' }}
            />
            <small>{formData.description.length}/250 characters</small>
          </div>
          <div className="form-actions">
            <button type="submit">{editingItem ? 'Update' : 'Create'}</button>
            {editingItem && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <h3>Existing Items</h3>
        {loading ? <p>Loading...</p> : (
          <div className="admin-list">
            {menu.map((item) => (
              <div key={item.id} className="admin-item">
                <div className="item-info">
                  <h4>{item.title}</h4>
                  <p>Price: {item.price} руб.</p>
                  <p>Calories: {item.calories}</p>
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

export default AdminMenu;
