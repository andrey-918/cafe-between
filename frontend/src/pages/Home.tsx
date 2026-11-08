import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem, MenuItem } from '../types';
import { fetchNews, fetchMenu, getImageUrl } from '../api';
import '../style/home.css';

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsCount, setNewsCount] = useState(() => window.innerWidth <= 768 ? 2 : 3);

  useEffect(() => {
    const updateNewsCount = () => {
      setNewsCount(window.innerWidth <= 768 ? 2 : 3);
    };

    window.addEventListener('resize', updateNewsCount);
    return () => window.removeEventListener('resize', updateNewsCount);
  }, []);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('homeScrollPosition');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem('homeScrollPosition');
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadData = async () => {
      try {
        const [newsData, menuData] = await Promise.all([
          fetchNews(controller.signal),
          fetchMenu(controller.signal),
        ]);
        if (!active) return;

        const now = Date.now();
        setNews(newsData.filter(item => new Date(item.postedAt).getTime() <= now));
        setMenu(menuData.slice(0, 6));
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        console.error('Не удалось загрузить главную страницу', err);
        setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadData();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Кофейня · искусство · люди</p>
          <h1>Место, где <span>встречаются</span> кофе и культура</h1>
          <p className="hero-description">
            TheCafé — пространство для неспешных разговоров, авторского кофе и новых впечатлений.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="hero-button hero-button-primary">Открыть меню</Link>
            <Link to="/news" className="hero-button hero-button-secondary">Ближайшие события <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="hero-note">
            <span className="hero-note-mark" aria-hidden="true">✳</span>
            Хороший кофе — хороший повод встретиться
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Графическая иллюстрация лиц, символизирующая искусство и общение">
          <span className="hero-art-label">TheCafé / 01</span>
          <span className="hero-art-caption">Свое место<br />в центре города</span>
        </div>
      </section>

      <section className="features" aria-label="О кафе">
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
      </section>

      <section className="home-section-container">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Жизнь TheCafé</p>
            <h2>События и новости</h2>
          </div>
          <Link to="/news" className="view-all-link">Все новости →</Link>
        </div>

        <div className="section-grid">
          {news.slice(0, newsCount).map((item) => {
            const imagePath = item.imageURLs?.find((image): image is string => typeof image === 'string');
            return (
              <Link key={item.id} to={`/news/${item.id}`} className="news-item-link">
                <article className="news-item-card">
                  <div className="news-item-image">
                    {imagePath
                      ? <img src={getImageUrl(imagePath)} alt="" loading="lazy" />
                      : <div className="news-item-placeholder" aria-hidden="true">TheCafé</div>}
                  </div>
                  <div className="news-item-content">
                    <div className="news-item-meta">
                      <time className="news-item-date" dateTime={item.postedAt}>
                        {new Date(item.postedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </time>
                      <span className="news-item-category">Событие</span>
                    </div>
                    <h3 className="news-item-title">{item.title}</h3>
                    <p className="news-item-description">{item.preview || item.description}</p>
                    <span className="news-item-link-text">Подробнее <span aria-hidden="true">↗</span></span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {loading && <p className="home-state" role="status">Загружаем события…</p>}
        {!loading && !error && news.length === 0 && <p className="home-state">Скоро здесь появятся новые события.</p>}
        {error && <p className="home-state home-error" role="alert">{error}</p>}
      </section>

      <section className="home-section-container home-menu-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Из нашей кухни</p>
            <h2>Любимое в меню</h2>
          </div>
          <Link to="/menu" className="view-all-link">Всё меню →</Link>
        </div>

        <div className="popular-items-grid">
          {menu.map((item) => (
             <Link to={`/menu/${item.id}`} key={item.id} className="popular-item-link">
              <article className="popular-item">
                <div className="popular-item-content">
                  <h3 className="popular-item-title">{item.title}</h3>
                  <p className="popular-item-description">{item.description || ''}</p>
                </div>
                <span className="popular-item-price">{item.price} ₽</span>
              </article>
            </Link>
          ))}
        </div>

        {!loading && !error && menu.length === 0 && <p className="home-state">Меню скоро появится.</p>}
        <Link to="/menu" className="menu-section-link">Смотреть всё меню <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
};

export default Home;