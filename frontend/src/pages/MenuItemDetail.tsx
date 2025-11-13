import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { MenuItem } from '../types';
import { fetchMenuItem } from '../api';

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

  return (
    <main>
      <section className="menu-item-detail">
        <h2>{item.title}</h2>
        {item.imageURLs && item.imageURLs.length > 0 && (
          <div className="photos">
            {item.imageURLs.map((url, index) => (
              <img key={index} src={url} alt={`${item.title} photo ${index + 1}`} />
            ))}
          </div>
        )}
        <p><strong>Цена:</strong> {item.price} руб.</p>
        {item.calories && <p><strong>Калории:</strong> {item.calories}</p>}
        {item.description && <p><strong>Описание:</strong> {item.description}</p>}
        <p><strong>Создано:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
        <p><strong>Обновлено:</strong> {new Date(item.updatedAt).toLocaleDateString()}</p>
      </section>
    </main>
  );
};

export default MenuItemDetail;
