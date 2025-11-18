import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNewsItem, getImageUrl } from '../api';
import '../style/news-detail.css';

const NewsItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cachedItem = localStorage.getItem(`news_item_${id}`);
      if (cachedItem) {
        setItem(JSON.parse(cachedItem));
        setLoading(false);
      }
    } catch (e) {
      // Ignore cache errors
    }

    const loadData = async () => {
      if (!id) return;
      try {
        const newsItem = await fetchNewsItem(parseInt(id));
        setItem(newsItem);
        try {
          localStorage.setItem(`news_item_${id}`, JSON.stringify(newsItem));
        } catch (e) {
          // Ignore storage errors
        }
      } catch (err) {
        setError('Failed to load news item');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Новость не найдена</p>;

  const getImageSrc = (img: string | File) => {
    if (typeof img === 'string') {
      return getImageUrl(img);
    }
    return URL.createObjectURL(img);
  };

  return (
    <div className="news-detail-container">
      <div className="news-detail-header">
        <Link to="/news" className="back-link">
          <svg className="back-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Назад к новостям
        </Link>
      </div>

      <article className="news-detail-card">
        <header className="news-detail-header-content">
          <h1 className="news-detail-title">{item.title}</h1>
          <time className="news-detail-date">
            {new Date(item.postedAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </header>

        {item.imageURLs && item.imageURLs.length > 0 && (
          <div className="news-detail-gallery">
            {item.imageURLs.map((url, index) => (
              <div key={index} className="news-detail-image-wrapper">
                <img
                  src={getImageSrc(url)}
                  alt={`${item.title} фото ${index + 1}`}
                  className="news-detail-image"
                />
              </div>
            ))}
          </div>
        )}

        <div className="news-detail-content">
          {item.preview && (
            <div className="news-detail-preview">
              <p>{item.preview}</p>
            </div>
          )}

          {item.description && (
            <div className="news-detail-description">
              <p>{item.description}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default NewsItemDetail;
