import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MenuItem } from '../types';
import { fetchMenuItem } from '../api';
import '../style/menu-detail.css';

const MenuItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      try {
        const menuItem = await fetchMenuItem(parseInt(id));
        setItem(menuItem);
      } catch (err) {
        setError('Failed to load menu item');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Элемент не найден</p>;

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'main_meal': return 'Основное меню';
      case 'snacks': return 'Закуски';
      case 'desserts': return 'Десерты';
      case 'drinks': return 'Напитки';
      case 'breakfast': return 'Завтрак';
      default: return category;
    }
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
                  if (img.startsWith('/uploads/')) {
                    return `http://localhost:8080${img}`;
                  }
                  return img;
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
