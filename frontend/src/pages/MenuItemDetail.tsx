import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MenuItem, MenuCategory } from '../types';
import { fetchMenuItem, fetchMenuCategories, getImageUrl } from '../api';
import '../style/menu-detail.css';

const MenuItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [menuItem, categoriesData] = await Promise.all([
          fetchMenuItem(parseInt(id)),
          fetchMenuCategories()
        ]);
        setItem(menuItem);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Элемент не найден</p>;

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.name_en === category);
    return cat ? cat.name_ru : category;
  };

  return (
    <div className="menu-detail-container">
      <div className="menu-detail-header">
        <Link to="/menu" className="back-link">
          <svg className="back-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Назад к меню
        </Link>
      </div>

      <article className="menu-detail-card">
        <header className="menu-detail-header-content">
          <div className="menu-detail-category">
            <span className="menu-detail-category-badge">
              {getCategoryName(item.category)}
            </span>
          </div>
          <h1 className="menu-detail-title">{item.title}</h1>
          <div className="menu-detail-price-section">
            <span className="menu-detail-price">{item.price} ₽</span>
            {item.calories && (
              <span className="menu-detail-calories">{item.calories} ккал</span>
            )}
          </div>
        </header>

        {item.imageURLs && item.imageURLs.length > 0 && (
          <div className="menu-detail-gallery">
            {item.imageURLs.map((url, index) => {
              const getImageSrc = (img: string | File) => {
                if (typeof img === 'string') {
                  return getImageUrl(img);
                }
                return URL.createObjectURL(img);
              };

              return (
                <div key={index} className="menu-detail-image-wrapper">
                  <img
                    src={getImageSrc(url)}
                    alt={`${item.title} фото ${index + 1}`}
                    className="menu-detail-image"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="menu-detail-content">
          {item.description && (
            <div className="menu-detail-description">
              <h3 className="menu-detail-description-title">Описание</h3>
              <p>{item.description}</p>
            </div>
          )}

          <div className="menu-detail-meta">
            <div className="menu-detail-meta-item">
              <span className="menu-detail-meta-label">Категория</span>
              <span className="menu-detail-meta-value">{getCategoryName(item.category)}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default MenuItemDetail;
