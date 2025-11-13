import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNews } from '../api';

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchNews();
        // Sort by postedAt descending and take first 5
        const sortedNews = newsData.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        setNews(sortedNews.slice(0, 5));
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <main>
      <section className="hero">
        <h1>Добро пожаловать в Cafe Between</h1>
        <p>Место, где встречаются искусство, кофе и уют. Погрузитесь в атмосферу творчества и вдохновения.</p>
      </section>

      <section className="news">
        <h2>Новости и мероприятия</h2>
        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}
        {news.map((item) => (
          <div key={item.id} className="event">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.imageURLs && item.imageURLs.length > 0 && (
              <div className="photos">
                {item.imageURLs.slice(0, 3).map((url, index) => (
                  <img key={index} src={url} alt={`News ${item.id} photo ${index + 1}`} />
                ))}
              </div>
            )}
          </div>
        ))}
        <Link to="/news" className="view-all-link">Посмотреть все новости</Link>
      </section>

      <section className="location-contacts">
        <h2>Местоположение и контакты</h2>
        <p><strong>Адрес:</strong> ул. Примерная, 123, Город</p>
        <p><strong>Телефон:</strong> +7 (123) 456-78-90</p>
        <p><strong>Email:</strong> info@cafebetween.ru</p>
        <p><strong>Часы работы:</strong> Пн-Пт 8:00-20:00, Сб-Вс 9:00-21:00</p>
      </section>
    </main>
  );
};

export default Home;
