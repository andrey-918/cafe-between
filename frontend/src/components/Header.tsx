import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <img src="/info/logo.jpeg" alt="Cafe Between Logo" className="logo" />
      <nav>
        <Link to="/" className="nav-link">Главная</Link>
        <Link to="/menu" className="nav-link">Меню</Link>
        <Link to="/news" className="nav-link">Новости</Link>
        <Link to="/admin/menu" className="nav-link">Админ Меню</Link>
        <Link to="/admin/news" className="nav-link">Админ Новости</Link>
      </nav>
    </header>
  );
};

export default Header;
