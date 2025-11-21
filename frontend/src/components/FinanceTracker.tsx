import React, { useState, useEffect } from 'react';
import { Finance, MonthlySummary } from '../types';
import { financeService } from '../services/api';

const FinanceTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<Finance[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    loadFinances();
    loadMonthlySummary();
  }, []);

  const loadFinances = async () => {
    try {
      const financesData = await financeService.getFinances();
      setTransactions(financesData);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadMonthlySummary = async () => {
    try {
      const summaryData = await financeService.getMonthlyStatement();
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar extrato:', error);
    }
  };

  const addTransaction = async () => {
    try {
      await financeService.addTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString()
      });
      setShowForm(false);
      setFormData({ type: 'EXPENSE', amount: '', description: '', category: '' });
      loadFinances();
      loadMonthlySummary();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await financeService.deleteTransaction(id);
      loadFinances();
      loadMonthlySummary();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>💰 Controle Financeiro</h2>

      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
            <h3>Receitas</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
              R$ {summary.totals.income.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
            <h3>Despesas</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
              R$ {summary.totals.expenses.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
            <h3>Saldo</h3>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: summary.balance >= 0 ? '#155724' : '#721c24' 
            }}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setShowForm(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        + Nova Transação
      </button>

      {showForm && (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>Adicionar Transação</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{ padding: '8px' }}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <input
              type="number"
              placeholder="Valor"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ padding: '8px' }}
            />
            <div>
              <button 
                onClick={addTransaction} 
                style={{ 
                  marginRight: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Adicionar
              </button>
              <button 
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3>Últimas Transações</h3>
        {transactions.map(transaction => (
          <div 
            key={transaction.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #eee',
              marginBottom: '5px',
              borderRadius: '4px',
              backgroundColor: transaction.type === 'INCOME' ? '#f8fff9' : '#fff8f8'
            }}
          >
            <div>
              <strong>{transaction.description}</strong>
              <br />
              <small>{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                color: transaction.type === 'INCOME' ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
              </span>
              <button 
                onClick={() => deleteTransaction(transaction.id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc3545'
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinanceTracker;