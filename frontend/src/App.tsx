import FinanceTracker from './components/FinanceTracker';
import CalendarView from './components/CalendarView';
import React, { useEffect, useState } from 'react';
import DailyView from './components/DailyView';
import Auth from './components/Auth';
import { User } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'tasks' | 'finances' | 'calendar'>('tasks');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">📅 Minha Agenda</h1>
          <small className="app-user">Olá, {user.name}</small>
        </div>

        <div className="app-header-right">
          <nav className="app-nav">
            <button
              onClick={() => setCurrentView('tasks')}
              className={
                'app-nav-button' +
                (currentView === 'tasks' ? ' app-nav-button--active' : '')
              }
            >
              📝 Visão Diária
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={
                'app-nav-button' +
                (currentView === 'calendar' ? ' app-nav-button--active' : '')
              }
            >
              📆 Calendário
            </button>
            <button
              onClick={() => setCurrentView('finances')}
              className={
                'app-nav-button' +
                (currentView === 'finances' ? ' app-nav-button--active' : '')
              }
            >
              💰 Finanças
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="app-logout-button"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'tasks' && (
          <DailyView selectedDate={selectedDate} />
        )}
        {currentView === 'calendar' && (
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setCurrentView('tasks');
            }}
          />
        )}
        {currentView === 'finances' && <FinanceTracker />}
      </main>
    </div>
  );
}

export default App;
