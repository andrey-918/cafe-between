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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchNews();
        const newsArray = Array.isArray(newsData) ? newsData : [];
        const now = new Date();
        const visibleNews = newsArray.filter(item => new Date(item.postedAt) <= now);
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
        {news.map((item) => {
          const getImageSrc = (img: string | File) => {
            if (typeof img === 'string') {
              if (img.startsWith('/uploads/')) {
                return `${window.location.protocol}//${window.location.host}${img}`;
              }
              return img;
            }
            return URL.createObjectURL(img);
          };

          return (
            <Link key={item.id} to={`/news/${item.id}`} className="news-item-link">
              <article className="news-item-card fade-in">
                {item.imageURLs && item.imageURLs.length > 0 && (
                  <div className="news-item-image">
                    <img src={getImageSrc(item.imageURLs[0])} alt={item.title} />
                  </div>
                )}
                <div className="news-item-content">
                  <h3 className="news-item-title">{item.title}</h3>
                  <p className="news-item-description">{item.preview || item.description}</p>
                  <div className="news-item-read-more">
                    <span className="news-item-link-text">Читать далее</span>
                    <svg className="news-item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default News;
