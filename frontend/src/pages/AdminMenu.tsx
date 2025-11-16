import { useEffect, useState } from 'react';
import type { MenuItem } from '../types';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../api';

const AdminMenu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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

  useEffect(() => {
    filterMenu();
  }, [menu, searchTerm, selectedCategory]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenu();
      setMenu(data);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filterMenu = () => {
    let filtered = menu;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredMenu(filtered);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.category.trim()) errors.category = 'Category is required';
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
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        setSuccess('Item updated successfully');
      } else {
        await createMenuItem(formData);
        setSuccess('Item created successfully');
      }
      loadMenu();
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
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteMenuItem(id);
        setSuccess('Item deleted successfully');
        loadMenu();
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
        await Promise.all(selectedItems.map(id => deleteMenuItem(id)));
        setSuccess(`${selectedItems.length} items deleted successfully`);
        setSelectedItems([]);
        loadMenu();
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
    setSelectedItems(filteredMenu.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
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
    setFormErrors({});
  };

  const categories = [...new Set(menu.map(item => item.category).filter(Boolean))];

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
          <h2>Admin - Menu Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Hide Form' : '+ Add New Item'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-header">
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
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
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Price (руб.): <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={formErrors.price ? 'error' : ''}
                />
                {formErrors.price && <span className="field-error">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label>Category: <span className="required">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={formErrors.category ? 'error' : ''}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="new">+ Add new category</option>
                </select>
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label>Calories:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

                <div className="form-group full-width">
                  <label>Description:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 250) })}
                    maxLength={250}
                    rows={3}
                    placeholder="Enter item description..."
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

                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
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
            <h3>Menu Items ({filteredMenu.length})</h3>
            <div className="items-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
              <p>Loading menu items...</p>
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="empty-state">
              <p>No items found. {searchTerm || selectedCategory ? 'Try adjusting your search or filter.' : 'Add your first menu item above.'}</p>
            </div>
          ) : (
            <div className="admin-list">
              <div className="list-header">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredMenu.length && filteredMenu.length > 0}
                  onChange={selectedItems.length === filteredMenu.length ? clearSelection : selectAllItems}
                />
                <span>Item</span>
                <span>Category</span>
                <span>Price</span>
                <span>Actions</span>
              </div>
              {filteredMenu.map((item) => (
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
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          {item.calories && item.calories > 0 && <span>{item.calories} cal</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item-category">
                    <span className="category-badge">{item.category}</span>
                  </div>
                  <div className="item-price">
                    {item.price} руб.
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

export default AdminMenu;
