import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(password);
    if (success) {
      navigate('/admin/menu');
    } else {
      setError('Неверный пароль');
    }
  };

  return (
    <main>
      <section className="login">
        <h2>Вход в админ-панель</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Войти</button>
        </form>
      </section>
    </main>
  );
};

export default Login;
