import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuItemDetail from './pages/MenuItemDetail';
import News from './pages/News';
import NewsItemDetail from './pages/NewsItemDetail';
import Login from './pages/Login';
import AdminMenu from './pages/AdminMenu';
import AdminNews from './pages/AdminNews';
import './style/App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:id" element={<MenuItemDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsItemDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
            {isAuthenticated ? (
              <>
                <Route path="/admin/menu" element={<AdminMenu />} />
                <Route path="/admin/news" element={<AdminNews />} />
              </>
            ) : (
              <Route path="/admin/*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
