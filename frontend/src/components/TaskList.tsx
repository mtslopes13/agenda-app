import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { taskService } from '../services/api';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        await taskService.createTask({
          title: newTask,
          dueDate: new Date().toISOString()
        });
        setNewTask('');
        loadTasks();
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
      }
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>📝 Lista de Tarefas</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nova tarefa..."
          style={{ 
            padding: '10px', 
            marginRight: '10px', 
            width: '300px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button 
          onClick={addTask}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Adicionar
        </button>
      </div>

      <div>
        {tasks.map(task => (
          <div 
            key={task.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '10px',
              border: '1px solid #eee',
              marginBottom: '5px',
              borderRadius: '4px',
              backgroundColor: task.completed ? '#f8f9fa' : 'white'
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              style={{ marginRight: '10px' }}
            />
            <span style={{ 
              flex: 1,
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#6c757d' : 'inherit'
            }}>
              {task.title}
            </span>
            <button 
              onClick={() => deleteTask(task.id)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;