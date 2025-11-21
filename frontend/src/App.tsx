import React, { useState } from 'react';
import TaskList from './components/TaskList';
import FinanceTracker from './components/FinanceTracker';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'tasks' | 'finances'>('tasks');

  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#343a40', 
        color: 'white', 
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h1>📅 Minha Agenda</h1>
        <nav>
          <button 
            onClick={() => setCurrentView('tasks')}
            style={{ 
              marginRight: '10px',
              backgroundColor: currentView === 'tasks' ? '#007bff' : 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📝 Tarefas
          </button>
          <button 
            onClick={() => setCurrentView('finances')}
            style={{ 
              backgroundColor: currentView === 'finances' ? '#007bff' : 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💰 Finanças
          </button>
        </nav>
      </header>

      <main>
        {currentView === 'tasks' && <TaskList />}
        {currentView === 'finances' && <FinanceTracker />}
      </main>
    </div>
  );
}

export default App;