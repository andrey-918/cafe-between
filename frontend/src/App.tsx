import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationPanel from './components/NotificationPanel.tsx';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuItemDetail from './pages/MenuItemDetail';
import News from './pages/News';
import NewsItemDetail from './pages/NewsItemDetail';
import Login from './pages/Login';
import AdminMenu from './pages/AdminMenu';
import AdminNews from './pages/AdminNews';
import './style/App.css';
import './style/header.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <NotificationProvider>
      <Router>
        <div className="app">
          <Header />
          {isAuthenticated && <NotificationPanel />}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:id" element={<MenuItemDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsItemDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/menu" element={isAuthenticated ? <AdminMenu /> : <Navigate to="/login" replace />} />
              <Route path="/admin/news" element={isAuthenticated ? <AdminNews /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
