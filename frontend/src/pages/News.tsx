import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNews } from '../api';

import '../style/news.css';

const News = () => {
  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const cached = localStorage.getItem('news');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('news');
      return !cached;
    } catch {
      return true;
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem('newsScrollPosition');
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem('newsScrollPosition');
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [loading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('newsScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('news');
      if (cached) {
        setNews(JSON.parse(cached));
        setLoading(false);
      } else {
        setLoading(true);
      }
    } catch (e) {
      setLoading(true);
    }

    const loadNews = async () => {
      const controller = new AbortController();
      const fetchPromise = fetchNews(controller.signal);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });

      try {
        const newsData = await Promise.race([fetchPromise, timeoutPromise]);
        const newsArray = Array.isArray(newsData) ? newsData : [];
        const now = new Date();
        const visibleNews = newsArray.filter(item => new Date(item.postedAt) <= now);
        setNews(visibleNews);
        try {
          localStorage.setItem('news', JSON.stringify(visibleNews));
        } catch (e) {
          // Ignore storage errors
        }
      } catch (err: any) {
        if (err.message === 'Timeout' || err.name === 'AbortError') {
          setError('Request timed out');
        } else {
          setError('Failed to load news');
        }
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
      <div className="section-grid">
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
                  <div className="news-item-meta">
                    <span className="news-item-date">{new Date(item.postedAt).toLocaleDateString()}</span>
                    <span className="news-item-category">Событие</span>
                  </div>
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
