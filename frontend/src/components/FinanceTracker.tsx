import React, { useState, useEffect } from 'react';
import { Finance, MonthlySummary } from '../types';
import { financeService } from '../services/api';
import './style/FinanceTracker.css';

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
    <div className="finance-container">
      <h2 className="finance-title">💰 Controle Financeiro</h2>

      {summary && (
        <div className="finance-summary-grid">
          <div className="finance-summary-card finance-summary-income">
            <h3>Receitas</h3>
            <p className="finance-summary-value">
              R$ {summary.totals.income.toFixed(2)}
            </p>
          </div>
          <div className="finance-summary-card finance-summary-expense">
            <h3>Despesas</h3>
            <p className="finance-summary-value">
              R$ {summary.totals.expenses.toFixed(2)}
            </p>
          </div>
          <div className="finance-summary-card finance-summary-balance">
            <h3>Saldo</h3>
            <p
              className={
                'finance-summary-value ' +
                (summary.balance >= 0
                  ? 'finance-summary-balance-positive'
                  : 'finance-summary-balance-negative')
              }
            >
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="finance-new-btn"
      >
        + Nova Transação
      </button>

      {showForm && (
        <div className="finance-form-card">
          <h3>Adicionar Transação</h3>
          <div className="finance-form-grid">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="finance-input"
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <input
              type="number"
              placeholder="Valor"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="finance-input"
            />
            <input
              type="text"
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="finance-input"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="finance-input"
            />
            <div className="finance-form-actions">
              <button
                onClick={addTransaction}
                className="finance-btn finance-btn-primary"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="finance-btn finance-btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="finance-transactions">
        <h3>Últimas Transações</h3>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={
              'finance-transaction-item ' +
              (transaction.type === 'INCOME'
                ? 'finance-transaction-income'
                : 'finance-transaction-expense')
            }
          >
            <div className="finance-transaction-info">
              <strong>{transaction.description}</strong>
              <br />
              <small>
                {transaction.category} •{' '}
                {new Date(transaction.date).toLocaleDateString()}
              </small>
            </div>
            <div className="finance-transaction-right">
              <span
                className={
                  'finance-amount ' +
                  (transaction.type === 'INCOME'
                    ? 'finance-amount-income'
                    : 'finance-amount-expense')
                }
              >
                {transaction.type === 'INCOME' ? '+' : '-'} R${' '}
                {transaction.amount.toFixed(2)}
              </span>
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="finance-delete-btn"
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
