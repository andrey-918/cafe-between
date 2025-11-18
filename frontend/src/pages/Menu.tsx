import { useEffect, useState } from 'react';
import type { MenuItem, MenuCategory } from '../types';
import { fetchMenu, fetchMenuCategories } from '../api';
import { MenuItemCard } from '../components/MenuItemCard';

import '../style/menu.css';

const Menu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    try {
      const cachedMenu = localStorage.getItem('menu');
      const cachedCategories = localStorage.getItem('menuCategories');
      if (cachedMenu && cachedCategories) {
        setMenu(JSON.parse(cachedMenu));
        setCategories(JSON.parse(cachedCategories));
        setLoading(false);
      }
    } catch (e) {
      // Ignore cache errors
    }

    const loadData = async () => {
      try {
        const [menuData, categoriesData] = await Promise.all([fetchMenu(), fetchMenuCategories()]);
        setMenu(menuData);
        setCategories(categoriesData);
        try {
          localStorage.setItem('menu', JSON.stringify(menuData));
          localStorage.setItem('menuCategories', JSON.stringify(categoriesData));
        } catch (e) {
          // Ignore storage errors
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Create category display names from fetched categories
  const categoryNames: Record<string, string> = categories ? categories.reduce((acc, cat) => {
    acc[cat.name_en] = cat.name_ru;
    return acc;
  }, {} as Record<string, string>) : {};

  // Group menu items by category
  const groupedMenu = menu ? menu.reduce((acc, item) => {
    const category = item.category || 'Без категории';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) : {};

  // Sort categories by sort_order from fetched categories
  const sortedCategories = categories
    ? categories
        .filter(cat => groupedMenu[cat.name_en] && groupedMenu[cat.name_en].length > 0)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(cat => cat.name_en)
    : [];

  return (
    <div className="menu">
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">Меню</h1>
          <p className="menu-description">
            Мы готовим напитки из свежеобжаренного кофе и предлагаем домашнюю выпечку
            и лёгкие блюда для завтрака и обеда.
          </p>
        </div>

        {sortedCategories.map((category) => {
          return (
            <section key={category} className="menu-section fade-in">
              <h2 className="menu-section-title">
                {categoryNames[category] || category}
              </h2>

              {loading && <p>Загрузка...</p>}
              {error && <p>{error}</p>}
              <div className="menu-grid">
                {groupedMenu[category] && groupedMenu[category].map((item) => (
                  <MenuItemCard
                    key={item.id}
                    id={item.id}
                    name={item.title}
                    description={item.description || ''}
                    price={item.price.toString()}
                    calories={item.calories}
                    image={item.imageURLs?.[0] as string | File}
                    category={categoryNames[category] || category}
                    popular={false} // You can add logic to determine if item is popular
                    className="fade-in"
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  )
};

export default Menu;
