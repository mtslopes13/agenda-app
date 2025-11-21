import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks';
import financeRoutes from './routes/finances';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/tasks', taskRoutes);
app.use('/api/finances', financeRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor rodando!',
    timestamp: new Date().toISOString()
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Agenda - Bem vindo!',
    endpoints: {
      tasks: '/api/tasks',
      finances: '/api/finances',
      health: '/health'
    }
  });
});

export default app;