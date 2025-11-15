import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNews } from '../api';
import '../style/news.css';

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchNews();
        const now = new Date();
        const visibleNews = newsData.filter(item => new Date(item.postedAt) <= now);
        setNews(visibleNews);
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <div className="news-container">
      <div className="news-header">
        <h1 className="news-title">Все новости и мероприятия</h1>
        <p className="news-description">
          Следите за нашими новостями и предстоящими событиями
        </p>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p>{error}</p>}
      <div className="news-grid">
        {news.map((item) => (
          <Link key={item.id} to={`/news/${item.id}`} className="news-item-link">
            <article className="news-item-card">
              {item.imageURLs && item.imageURLs.length > 0 && (
                <div className="news-item-image">
                  <img src={item.imageURLs[0]} alt={item.title} />
                </div>
              )}
              <div className="news-item-content">
                <div className="news-item-meta">
                  <span className="news-item-date">{new Date(item.postedAt).toLocaleDateString()}</span>
                  <span className="news-item-category">Событие</span>
                </div>
                <h3 className="news-item-title">{item.title}</h3>
                <p className="news-item-description">{item.preview || item.description}</p>
                <span className="news-item-link-text">Подробнее →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default News;
