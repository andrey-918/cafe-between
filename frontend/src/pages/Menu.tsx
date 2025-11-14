import { useEffect, useState } from 'react';
import type { MenuItem } from '../types';
import { fetchMenu } from '../api';
import { MenuItemCard } from '../components/MenuItemCard';

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

  // Group menu items by category (assuming we add category to MenuItem type or derive from data)
  // For now, we'll display all items in one section
  const categories = ['Все позиции']; // Placeholder, can be expanded later

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-16">
        <h1 className="text-gray-900 mb-4">Меню</h1>
        <p className="text-gray-500 max-w-2xl">
          Мы готовим напитки из свежеобжаренного кофе и предлагаем домашнюю выпечку
          и лёгкие блюда для завтрака и обеда.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category} className="mb-16">
          <h2 className="text-gray-900 mb-8 pb-4 border-b border-gray-200">
            {category}
          </h2>

          {loading && <p>Загрузка...</p>}
          {error && <p>{error}</p>}
          <div className="menu-grid">
            {menu.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.title}
                description={item.description || ''}
                price={item.price.toString()}
                calories={item.calories}
                image={item.imageURLs?.[0]}
                popular={false} // You can add logic to determine if item is popular
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Menu;
