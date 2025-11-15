import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNewsItem } from '../api';
import '../style/news-detail.css';

const NewsItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      try {
        const newsItem = await fetchNewsItem(parseInt(id));
        setItem(newsItem);
      } catch (err) {
        setError('Failed to load news item');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Элемент не найден</p>;

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
          <div className="news-detail-meta">
            <span className="news-detail-date">
              Опубликовано {new Date(item.postedAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {item.imageURLs && item.imageURLs.length > 0 && (
          <div className="news-detail-gallery">
            {item.imageURLs.map((url, index) => {
              const getImageSrc = (img: string | File) => {
                if (typeof img === 'string') {
                  if (img.startsWith('/uploads/')) {
                    return `http://localhost:8080${img}`;
                  }
                  return img;
                }
                return URL.createObjectURL(img);
              };

              return (
                <div key={index} className="news-detail-image-wrapper">
                  <img
                    src={getImageSrc(url)}
                    alt={`${item.title} фото ${index + 1}`}
                    className="news-detail-image"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="news-detail-content">
          {item.preview && (
            <p className="news-detail-preview">{item.preview}</p>
          )}
          <div className="news-detail-description">
            {item.description?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsItemDetail;
