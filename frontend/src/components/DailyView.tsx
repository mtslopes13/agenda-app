import React, { useEffect, useState } from 'react';
import { Task, TaskType, Appointment, CalendarEvent } from '../types';
import { taskService, dailyService } from '../services/api';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import './style/DailyView.css';

const LIST_TYPES: { type: TaskType; label: string; emoji: string }[] = [
  { type: 'META',        label: 'Metas do Dia',        emoji: '🌟' },
  { type: 'IMPORTANTE',  label: 'Tarefas Importantes', emoji: '🔥' },
  { type: 'AMANHA',      label: 'Para Amanhã',         emoji: '🕒' },
];

type NewTasksState = {
  [K in TaskType]: string[];
};

const initialNewTasks: NewTasksState = {
  META: Array(5).fill(''),
  IMPORTANTE: Array(5).fill(''),
  AMANHA: Array(5).fill(''),
};

// slots de horário
const COLUMN1_HOURS = [
  '05:00','05:30','06:00','06:30',
  '07:00','07:30','08:00','08:30',
  '09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00'
];

const COLUMN2_HOURS = [
  '14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30',
  '19:00','19:30','20:00','20:30',
  '21:00','21:30','22:00','22:30',
  '23:00','23:30'
];

// 6 cores pastel (bem diferente do Google Agenda)
const PASTEL_COLORS = [
  '#FFB3BA', // rosa
  '#FFDFBA', // laranja claro
  '#FFFFBA', // amarelo
  '#BAFFC9', // verde
  '#BAE1FF', // azul
  '#E3BAFF', // roxo
];

interface DailyViewProps {
  selectedDate: Date;
}

const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
  // Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTasks, setNewTasks] = useState<NewTasksState>(initialNewTasks);

  // Cronograma
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Modal de compromisso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState('');
  const [modalEndTime, setModalEndTime] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalLocation, setModalLocation] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalColor, setModalColor] = useState(PASTEL_COLORS[0]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Menu de contexto
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appointment: Appointment;
  } | null>(null);

  const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

  // ==== TAREFAS ====

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Erro ao carregar tarefas', err);
    }
  };

  useEffect(() => {
    setNewTasks(prev => {
      const copy: NewTasksState = { ...prev };
      const allTypes: TaskType[] = ['META', 'IMPORTANTE', 'AMANHA'];

      allTypes.forEach(type => {
        const countTasksOfType = tasks.filter(t => t.type === type).length;

        const desiredInputs =
          countTasksOfType < 5
            ? 5 - countTasksOfType
            : 1;

        let arr = copy[type] || [];

        if (arr.length < desiredInputs) {
          arr = [...arr, ...Array(desiredInputs - arr.length).fill('')];
        } else if (arr.length > desiredInputs) {
          arr = arr.slice(0, desiredInputs);
        }

        copy[type] = arr;
      });

      return copy;
    });
  }, [tasks]);

  const handleNewTaskChange = (type: TaskType, index: number, value: string) => {
    setNewTasks(prev => {
      const copy = { ...prev };
      const arr = [...copy[type]];
      arr[index] = value;
      copy[type] = arr;
      return copy;
    });
  };

  const handleNewTaskKeyDown = async (type: TaskType, index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    const title = newTasks[type][index].trim();
    if (!title) return;

    try {
      await taskService.createTask({
        title,
        dueDate: new Date().toISOString(),
        type,
      });
      await loadTasks();
      setNewTasks(prev => {
        const copy = { ...prev };
        const arr = [...copy[type]];
        arr[index] = '';
        copy[type] = arr;
        return copy;
      });
    } catch (err) {
      console.error('Erro ao criar tarefa', err);
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed });
      await loadTasks();
    } catch (err) {
      console.error('Erro ao atualizar tarefa', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Erro ao deletar tarefa', err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromType = source.droppableId as TaskType;
    const toType = destination.droppableId as TaskType;

    if (fromType === toType && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    if (fromType !== toType) {
      try {
        await taskService.updateTask(task.id, { type: toType });
        await loadTasks();
      } catch (err) {
        console.error('Erro ao mover tarefa', err);
      }
    }
  };

  const tasksByType: { [K in TaskType]: Task[] } = {
    META: tasks.filter(t => t.type === 'META'),
    IMPORTANTE: tasks.filter(t => t.type === 'IMPORTANTE'),
    AMANHA: tasks.filter(t => t.type === 'AMANHA'),
  };

  // ==== CRONOGRAMA ====

  const loadDailyData = async () => {
    try {
      setLoadingDaily(true);
      const data = await dailyService.getDailyData(formatDateParam(selectedDate));
      setEvents(data.events);
      setAppointments(data.appointments);
    } catch (err) {
      console.error('Erro ao carregar dados do dia', err);
    } finally {
      setLoadingDaily(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const openAppointmentModalForCreate = (startTime: string) => {
    setEditingAppointment(null);
    setModalStartTime(startTime);

    const [h, m] = startTime.split(':').map(Number);
    const end = new Date();
    end.setHours(h, m + 30);
    const endStr = end.toTimeString().substring(0, 5);

    setModalEndTime(endStr);
    setModalTitle('');
    setModalLocation('');
    setModalDescription('');
    setModalColor(PASTEL_COLORS[0]);
    setIsModalOpen(true);
  };

  const openAppointmentModalForEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setModalTitle(appointment.title);
    setModalStartTime(appointment.startTime);
    setModalEndTime(appointment.endTime);
    setModalLocation(appointment.location || '');
    setModalDescription(appointment.description || '');
    setModalColor(appointment.color || PASTEL_COLORS[0]);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!modalTitle.trim()) {
      alert('Dê um título ao compromisso.');
      return;
    }

    try {
      if (editingAppointment) {
        await dailyService.updateAppointment(editingAppointment.id, {
          title: modalTitle.trim(),
          startTime: modalStartTime,
          endTime: modalEndTime,
          location: modalLocation || undefined,
          description: modalDescription || undefined,
          color: modalColor,
        });
      } else {
        await dailyService.createAppointment({
          title: modalTitle.trim(),
          date: formatDateParam(selectedDate),
          startTime: modalStartTime,
          endTime: modalEndTime,
          location: modalLocation || undefined,
          description: modalDescription || undefined,
          color: modalColor,
        });
      }

      setIsModalOpen(false);
      setEditingAppointment(null);
      await loadDailyData();
    } catch (err) {
      console.error('Erro ao salvar compromisso', err);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    const ok = window.confirm(`Excluir o compromisso "${appointment.title}"?`);
    if (!ok) return;

    try {
      await dailyService.deleteAppointment(appointment.id);
      await loadDailyData();
    } catch (err) {
      console.error('Erro ao excluir compromisso', err);
    }
  };

  const parseTimeToMinutes = (time: string): number | null => {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const appointmentsAtSlot = (slot: string) => {
    const slotStart = parseTimeToMinutes(slot);
    if (slotStart === null) return [];
    const slotEnd = slotStart + 30;

    return appointments.filter(a => {
      const t = parseTimeToMinutes(a.startTime);
      if (t === null) return false;
      return t >= slotStart && t < slotEnd;
    });
  };

  const renderSlot = (hour: string) => {
    const slotAppointments = appointmentsAtSlot(hour);
    const cols = slotAppointments.length > 0 ? slotAppointments.length : 1;

    return (
      <div
        key={hour}
        className="schedule-slot"
        onClick={() => openAppointmentModalForCreate(hour)}
      >
        <div className="schedule-slot-hour">{hour}</div>

        <div
          className="schedule-slot-appointments"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {slotAppointments.map((a) => (
            <div
              key={a.id}
              className="appointment-card"
              style={{ backgroundColor: a.color || '#d6ffe3' }}
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  appointment: a,
                });
              }}
              title={`${a.title} (${a.startTime} - ${a.endTime})`}
            >
              <span className="appointment-title">{a.title}</span>
              <span className="appointment-time">
                {a.startTime} - {a.endTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="daily-view">
      <h2 className="daily-view-title">📅 {selectedDate.toLocaleDateString()}</h2>

      <div className="daily-layout">
        {/* ESQUERDA: tarefas */}
        <div className="daily-tasks-column">
          <DragDropContext onDragEnd={onDragEnd}>
            {LIST_TYPES.map(list => (
              <Droppable droppableId={list.type} key={list.type}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="dv-card"
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : '#f8f9fa',
                    }}
                  >
                    <div className="dv-card-header">
                      <span className="dv-card-header-emoji">{list.emoji}</span>
                      <span>{list.label}</span>
                    </div>

                    <div className="dv-task-list">
                      {tasksByType[list.type].map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                'dv-task-item' +
                                (snapshot.isDragging ? ' dv-task-item-dragging' : '')
                              }
                            >
                              <div className="dv-task-left">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleCompleted(task)}
                                />
                                <span
                                  className={
                                    'dv-task-title' +
                                    (task.completed ? ' dv-task-title-completed' : '')
                                  }
                                >
                                  {task.title}
                                </span>
                              </div>
                              <button
                                className="dv-task-delete-btn"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {newTasks[list.type].map((value, index) => (
                        <div
                          key={`new-${list.type}-${index}`}
                          className="dv-task-input-wrapper"
                        >
                          <input
                            type="text"
                            placeholder="Adicionar..."
                            value={value}
                            onChange={(e) =>
                              handleNewTaskChange(list.type, index, e.target.value)
                            }
                            onKeyDown={(e) => handleNewTaskKeyDown(list.type, index, e)}
                            className="dv-task-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>

        {/* DIREITA: cronograma + eventos */}
        <div className="daily-right">
          <div className="daily-schedule">
            <div className="daily-schedule-columns">
              <div className="schedule-column">
                {COLUMN1_HOURS.map(renderSlot)}
              </div>
              <div className="schedule-column">
                {COLUMN2_HOURS.map(renderSlot)}
              </div>
            </div>

            {loadingDaily && (
              <p className="daily-loading">Carregando cronograma...</p>
            )}
          </div>

          <div className="daily-events-panel">
            <div className="daily-events-card">
              <div className="daily-events-title">Eventos do dia</div>
              {events.length === 0 ? (
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                  Nenhum evento para este dia.
                </span>
              ) : (
                <div className="daily-events-list">
                  {events.map(ev => (
                    <div key={ev.id} className="daily-event-item">
                      {ev.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENU DE CONTEXTO DO COMPROMISSO */}
      {contextMenu && (
        <div
          className="dv-context-overlay"
          onClick={() => setContextMenu(null)}
        >
          <div
            className="dv-context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dv-context-btn"
              onClick={() => {
                openAppointmentModalForEdit(contextMenu.appointment);
                setContextMenu(null);
              }}
            >
              ✏️ Editar compromisso
            </button>
            <button
              className="dv-context-btn dv-context-btn-delete"
              onClick={() => {
                handleDeleteAppointment(contextMenu.appointment);
                setContextMenu(null);
              }}
            >
              🗑️ Excluir
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="dv-modal-overlay">
          <div className="dv-modal">
            <h3 className="dv-modal-header-text">
              {editingAppointment ? 'Editar compromisso' : 'Novo compromisso'}
            </h3>
            <p className="dv-modal-subtitle">
              Dia {selectedDate.toLocaleDateString()} – horário base {modalStartTime}
            </p>

            <div className="dv-modal-body">
              <input
                type="text"
                placeholder="Título"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="dv-input"
              />

              <div className="dv-time-row">
                <div className="dv-time-field">
                  <label className="dv-time-label">Início (HH:MM)</label>
                  <input
                    type="text"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    className="dv-input"
                  />
                </div>
                <div className="dv-time-field">
                  <label className="dv-time-label">Fim (HH:MM)</label>
                  <input
                    type="text"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    className="dv-input"
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Local (opcional)"
                value={modalLocation}
                onChange={(e) => setModalLocation(e.target.value)}
                className="dv-input"
              />

              <textarea
                placeholder="Descrição (opcional)"
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                rows={3}
                className="dv-textarea"
              />

              <div className="dv-color-row">
                <label style={{ fontSize: '0.8rem' }}>Cor do compromisso</label>
                <div className="dv-color-palette">
                  {PASTEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        'dv-color-swatch' +
                        (modalColor === color ? ' selected' : '')
                      }
                      style={{ backgroundColor: color }}
                      onClick={() => setModalColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="dv-modal-footer">
              <button
                className="dv-btn dv-btn-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAppointment(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="dv-btn dv-btn-primary"
                onClick={handleSaveAppointment}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyView;