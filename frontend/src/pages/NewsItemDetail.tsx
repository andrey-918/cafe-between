import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { NewsItem } from '../types';
import { fetchNewsItem } from '../api';

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
    <main>
      <section className="news-item-detail">
        <h2>{item.title}</h2>
        {item.imageURLs && item.imageURLs.length > 0 && (
          <div className="photos">
            {item.imageURLs.map((url, index) => (
              <img key={index} src={url} alt={`${item.title} photo ${index + 1}`} />
            ))}
          </div>
        )}
        <p>{item.description}</p>
        <p><strong>Опубликовано:</strong> {new Date(item.postedAt).toLocaleDateString()}</p>
        <p><strong>Создано:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
        <p><strong>Обновлено:</strong> {new Date(item.updatedAt).toLocaleDateString()}</p>
      </section>
    </main>
  );
};

export default NewsItemDetail;
