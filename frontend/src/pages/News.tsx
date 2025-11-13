import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNews } from '../api';

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchNews();
        // Sort by postedAt descending
        const sortedNews = newsData.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        setNews(sortedNews);
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
      <section className="news">
        <h2>Все новости и мероприятия</h2>
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
            <Link to={`/news/${item.id}`} className="details-link">Подробнее</Link>
          </div>
        ))}
      </section>
    </main>
  );
};

export default News;
