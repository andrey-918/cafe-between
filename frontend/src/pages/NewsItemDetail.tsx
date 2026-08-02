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
    // Сбрасываем скролл в самом начале
    window.scrollTo(0, 0);
    
    let loadingTimer: number;
    let hasShownLoading = false;

    const showLoadingAfterDelay = () => {
      loadingTimer = window.setTimeout(() => {
        setLoading(true);
        hasShownLoading = true;
      }, 2000); // Show loading after 2 seconds
    };

    try {
      const cachedItem = localStorage.getItem(`news_item_${id}`);
      if (cachedItem) {
        setItem(JSON.parse(cachedItem));
        setLoading(false);
        // Убедимся, что скролл сброшен после загрузки из кэша
        setTimeout(() => window.scrollTo(0, 0), 0);
        return;
      }
    } catch (e) {
      // Ignore cache errors
    }

    showLoadingAfterDelay();

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
        if (!hasShownLoading) {
          setLoading(false);
          clearTimeout(loadingTimer);
        }
      } catch (err) {
        setError('Failed to load news item');
        if (!hasShownLoading) {
          setLoading(false);
          clearTimeout(loadingTimer);
        }
      } finally {
        if (hasShownLoading) {
          setLoading(false);
        }
        // Всегда скроллим к началу после загрузки
        setTimeout(() => window.scrollTo(0, 0), 0);
      }
    };
    loadData();

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [id]);

  // Добавляем еще один useEffect для скролла при изменении loading
  useEffect(() => {
    if (!loading && item) {
      // Небольшая задержка для гарантии рендера контента
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [loading, item]);

  if (loading) return (
    <div className="news-detail-container">
      <div className="news-detail-header">
        <div className="back-link skeleton"></div>
      </div>
      <div className="news-detail-layout">
        <div className="news-detail-image-column">
          <div className="news-detail-image-wrapper skeleton"></div>
        </div>
        <div className="news-detail-info-column">
          <div className="news-detail-title skeleton"></div>
          <div className="news-detail-date skeleton"></div>
          <div className="news-detail-preview">
            <div className="news-detail-preview skeleton"></div>
          </div>
          <div className="news-detail-description">
            <div className="news-detail-description skeleton"></div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <p>{error}</p>;
  if (!item) return <p>Событие не найдено</p>;

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
          Назад к событиям
        </Link>
      </div>

      <div className="news-detail-layout">
        {/* Левая колонка - фото */}
        <div className="news-detail-image-column">
          {item.imageURLs && item.imageURLs.length > 0 ? (
            <div className="news-detail-image-wrapper">
              <img
                src={getImageSrc(item.imageURLs[0])}
                alt={item.title}
                className="news-detail-image"
              />
            </div>
          ) : (
            <div className="news-detail-image-placeholder">
              <span>Нет фото</span>
            </div>
          )}
        </div>

        {/* Правая колонка - информация */}
        <div className="news-detail-info-column">
          <h1 className="news-detail-title">{item.title}</h1>
          
          <time className="news-detail-date">
            {new Date(item.postedAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>

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
        </div>
      </div>
    </div>
  );
};

export default NewsItemDetail;