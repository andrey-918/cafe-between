import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuItemDetail from './pages/MenuItemDetail';
import News from './pages/News';
import NewsItemDetail from './pages/NewsItemDetail';
import AdminMenu from './pages/AdminMenu';
import AdminNews from './pages/AdminNews';
import './style/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<MenuItemDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsItemDetail />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/news" element={<AdminNews />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
