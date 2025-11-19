import { useEffect, useState } from 'react';
import type { MenuItem, MenuCategory } from '../types';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem, fetchMenuCategories, updateMenuCategorySortOrder, deleteMenuCategory, getImageUrl } from '../api';
import { useNotifications } from '../contexts/NotificationContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCategoryItem = ({ category, onDelete }: { category: MenuCategory, onDelete: (id: number) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 8px 25px rgba(0, 0, 0, 0.15)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style} className="category-item">
      <span>{category.name_ru}</span>
      <div className="category-actions">
        <div className="category-drag-handle" {...attributes} {...listeners}>⋮⋮</div>
        <button onClick={() => onDelete(category.id)} className="btn-delete-category">×</button>
      </div>
    </div>
  );
};

const AdminMenu = () => {
  const { addNotification } = useNotifications();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    imageURLs: [] as (string | File)[],
    calories: 0,
    description: '',
    category: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await loadMenu();
      await loadCategories();
    };
    loadData();
  }, []);

  useEffect(() => {
    filterMenu();
  }, [menu, searchTerm, selectedCategory]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenu();
      const menuArray = Array.isArray(data) ? data : [];
      setMenu(menuArray);
    } catch (err) {
      addNotification('error', 'Не удалось загрузить меню');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchMenuCategories();
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      } catch (err: unknown) {
      addNotification('error', 'Не удалось загрузить категории');
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
      const categoryEn = categories.find(cat => cat.name_ru === selectedCategory)?.name_en;
      filtered = filtered.filter(item => item.category === categoryEn);
    }

    setFilteredMenu(filtered);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) errors.title = 'Введите название';
    if (formData.price <= 0) errors.price = 'Цена должна быть больше 0';
    if (!formData.category.trim()) errors.category = 'Укажите категорию';
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
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        addNotification('success', 'Элемент обновлен успешно');
      } else {
        await createMenuItem(formData);
        addNotification('success', 'Item created successfully');
      }
      loadMenu();
      loadCategories();
      resetForm();
      setShowForm(false);
    } catch (err) {
      addNotification('error', 'Не удалось сохранить элемент');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      price: item.price,
      imageURLs: (item.imageURLs || []).map(url => typeof url === 'string' ? getImageUrl(url) : url),
      calories: item.calories || 0,
      description: item.description || '',
      category: categories.find(cat => cat.name_en === item.category)?.name_ru || item.category || '',
    });
    setShowForm(true);
    setFormErrors({});
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteMenuItem(id);
        addNotification('success', 'Item deleted successfully');
        loadMenu();
      } catch (err) {
        addNotification('error', 'Failed to delete item');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элементов? Это действие нельзя отменить.`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteMenuItem(id)));
        addNotification('success', `${selectedItems.length} items deleted successfully`);
        setSelectedItems([]);
        loadMenu();
      } catch (err) {
        addNotification('error', 'Failed to delete some items');
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

  const categoryOptions: { value: string; label: string }[] = categories.map(cat => ({ value: cat.name_ru, label: cat.name_ru }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);

      // Update sort_orders based on new positions
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        sort_order: index,
      }));

      // Optimistically update UI
      setCategories(updatedCategories);

      try {
        // Update all categories' sort_order in the database
        await Promise.all(
          updatedCategories.map((cat) => updateMenuCategorySortOrder(cat.id, cat.sort_order))
        );
        addNotification('success', 'Category order updated successfully');
      } catch (err) {
        addNotification('error', 'Failed to update category order');
        // Revert on error
        loadCategories();
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMenuCategory(id);
        addNotification('success', 'Category deleted successfully');
        loadCategories();
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'error' in err && err.error === 'Category is in use') {
          const itemsList = (err as any).items.map((item: any) => item.title).join(', ');
          addNotification('error', `Cannot delete category because it contains items: ${itemsList}. Please reassign these items to another category first.`);
        } else {
          addNotification('error', 'Failed to delete category');
        }
      }
    }
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
          <h2>Администрирование меню</h2>
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
              <h3>{editingItem ? 'Изменить элемент' : 'Добавить новый элемент'}</h3>
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
                <label>Название: <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Цена (руб.): <span className="required">*</span></label>
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
                <label>Категория <span className="required">*</span></label>
                <div className="category-input-group">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">Выберите категорию</option>
                    {categoryOptions.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Или введите новую категорию"
                    value={formData.category && !categoryOptions.some(cat => cat.value === formData.category) ? formData.category : ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={formErrors.category ? 'error' : ''}
                  />
                </div>
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label>Калории</label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Описание</label>
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
              <label>Фото:</label>
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

            <div className="form-actions">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Сохранение...' : (editingItem ? 'Редактировать элемент' : 'Создать новый элемент')}
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
            <h3>Элементы меню({filteredMenu.length})</h3>
            <div className="items-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.name_en} value={cat.name_ru}>{cat.name_ru}</option>
                  ))}
                </select>
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
              <p>Загрузка элементов меню...</p>
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="empty-state">
              <p>Элементы не найдены. {searchTerm || selectedCategory ? 'Попробуйте изменить фильтр поиска' : 'Добавьте первый элемент'}</p>
            </div>
          ) : (
            <div className="admin-list">
              <div className="list-header">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredMenu.length && filteredMenu.length > 0}
                  onChange={selectedItems.length === filteredMenu.length ? clearSelection : selectAllItems}
                />
                <span>Элемент</span>
                <span>Категория</span>
                <span>Цена</span>
                <span>Действия</span>
              </div>
              {filteredMenu.map((item) => (
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
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          {item.calories && item.calories > 0 && <span>{item.calories} ккал</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item-category">
                    <span className="category-badge">
                      {categories.find(cat => cat.name_en === item.category)?.name_ru || item.category}
                    </span>
                  </div>
                  <div className="item-price">
                    {item.price} руб.
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

        <div className="categories-section">
          <h3>Порядок категорий</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
              <div className="categories-list">
                {categories.map((cat) => (
                  <SortableCategoryItem key={cat.id} category={cat} onDelete={handleDeleteCategory} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>
    </main>
  );
};

export default AdminMenu;
