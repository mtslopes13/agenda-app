import React, { useState } from 'react';
import { authService } from '../services/api';
import { User } from '../types';
import './style/Auth.css';

interface AuthProps {
  onAuthSuccess: (token: string, user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const data = await authService.register(name, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        const data = await authService.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        (mode === 'login'
          ? 'Erro ao fazer login. Verifique suas credenciais.'
          : 'Erro ao registrar. Tente novamente.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">📅 Minha Agenda</h1>

        <div className="auth-tabs">
          <button
            onClick={() => setMode('login')}
            className={
              'auth-tab' + (mode === 'login' ? ' auth-tab--active' : '')
            }
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            className={
              'auth-tab' + (mode === 'register' ? ' auth-tab--active' : '')
            }
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'register'}
                className="auth-input"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading
              ? 'Carregando...'
              : mode === 'login'
              ? 'Entrar'
              : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
