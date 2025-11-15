import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem, MenuItem } from '../types';
import { fetchNews, fetchMenu } from '../api';
import { MenuItemCard } from '../components/MenuItemCard';

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, menuData] = await Promise.all([fetchNews(), fetchMenu()]);
        const sortedNews = newsData.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        setNews(sortedNews.slice(0, 3));
        // Assume all menu items are popular for now, or filter by price > some value
        setMenu(menuData.slice(0, 6)); // Take first 6 as popular
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Пространство между кофе и культурой</h1>
        <p>BETWEEN — это место, где встречаются вкус и искусство. Мы создаём атмосферу для творческих людей, любителей хорошего кофе и культурных событий.</p>

        <div className="features">
          <div className="feature">
            <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3>Качественный кофе</h3>
            <p>Авторские напитки от наших бариста</p>
          </div>

          <div className="feature">
            <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h3>Выставки художников</h3>
            <p>Регулярная смена экспозиций</p>
          </div>

          <div className="feature">
            <svg className="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>Культурные события</h3>
            <p>Лекции, концерты, встречи</p>
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="recent-news">
        <div className="section-header">
          <h2>Новости</h2>
          <Link to="/news" className="view-all-link">Все новости →</Link>
        </div>

        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}
        <div className="home-news-grid">
          {news.map((item) => (
            <Link key={item.id} to={`/news/${item.id}`} className="news-item-link">
              <article className="news-item-card">
                <div className="news-item-image">
                  <img src={item.imageURLs?.[0] || '/placeholder.jpg'} alt={item.title} />
                </div>
                <div className="news-item-content">
                  <div className="news-item-meta">
                    <span className="news-item-date">{new Date(item.postedAt).toLocaleDateString()}</span>
                    <span className="news-item-category">Событие</span>
                  </div>
                  <h3 className="news-item-title">{item.title}</h3>
                  <p className="news-item-description">{item.description}</p>
                  <span className="news-item-link-text">Подробнее →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Menu Items */}
      <section className="popular-menu">
        <div className="section-header">
          <h2>Популярные позиции</h2>
          <Link to="/menu" className="view-all-link">Всё меню →</Link>
        </div>

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
              popular={true} // Assuming these are popular
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
