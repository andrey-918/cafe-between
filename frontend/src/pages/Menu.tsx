import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MenuItem } from '../types';
import { fetchMenu } from '../api';

const Menu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuData = await fetchMenu();
        setMenu(menuData);
      } catch (err) {
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  return (
    <main>
      <section className="menu">
        <h2>Меню</h2>
        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}
        <div className="menu-items">
          {menu.map((item) => (
            <div key={item.id} className="menu-item">
              {item.imageURLs && item.imageURLs.length > 0 && (
                <img src={item.imageURLs[0]} alt={item.title} className="menu-item-image" />
              )}
              <h3>{item.title}</h3>
              <p>Цена: {item.price} руб.</p>
              <Link to={`/menu/${item.id}`} className="details-link">Подробнее</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Menu;
