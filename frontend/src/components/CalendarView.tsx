import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService, dailyService } from '../services/api';
import { CalendarEvent } from '../types';
import './style/CalendarView.css';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

type ModalMode = 'EVENT' | 'APPOINTMENT';

const PASTEL_COLORS = [
  '#FFB3BA',
  '#FFDFBA',
  '#FFFFBA',
  '#BAFFC9',
  '#BAE1FF',
  '#E3BAFF',
];

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onSelectDate }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>('EVENT');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalStartTime, setModalStartTime] = useState('09:00');
  const [modalEndTime, setModalEndTime] = useState('10:00');
  const [modalColor, setModalColor] = useState(PASTEL_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const loadEvents = async (year: number, month: number) => {
    try {
      const data = await calendarService.getMonthlyEvents(year, month);
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  const handleMonthChange = (arg: any) => {
    const year = arg.view.currentStart.getFullYear();
    const month = arg.view.currentStart.getMonth() + 1;
    loadEvents(year, month);
  };

  useEffect(() => {
    const today = new Date();
    loadEvents(today.getFullYear(), today.getMonth() + 1);
  }, []);

  const resetModal = () => {
    setModalTitle('');
    setModalDescription('');
    setModalStartTime('09:00');
    setModalEndTime('10:00');
    setModalColor(PASTEL_COLORS[0]);
    setModalMode('EVENT');
    setEditingEventId(null);
  };

  const handleDateClick = (info: any) => {
    const isoDate = info.dateStr;
    resetModal();
    setModalDate(isoDate);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const id = info.event.id as string;

    // Se for compromisso da visão diária (id começa com apt_), abre a visão diária
    if (id.startsWith('apt_')) {
      const start: Date | null = info.event.start;
      if (start) {
        onSelectDate(start);
      }
      return;
    }

    // Senão, é um CalendarEvent normal -> abre modal de edição
    const found = events.find((e) => e.id === id);
    if (!found) return;

    setEditingEventId(found.id);
    setModalDate(found.date);
    setModalMode('EVENT');
    setModalTitle(found.title);
    setModalDescription(found.description || '');
    setModalColor(found.color || PASTEL_COLORS[0]);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!modalTitle.trim()) {
      alert('Informe um título.');
      return;
    }

    try {
      setSaving(true);

      if (modalMode === 'EVENT') {
        if (editingEventId) {
          await calendarService.updateEvent(editingEventId, {
            title: modalTitle.trim(),
            date: modalDate,
            description: modalDescription || undefined,
            allDay: true,
            color: modalColor,
          });
        } else {
          await calendarService.createEvent({
            title: modalTitle.trim(),
            date: modalDate,
            allDay: true,
            description: modalDescription || undefined,
            color: modalColor,
          });
        }

        const d = new Date(modalDate);
        await loadEvents(d.getFullYear(), d.getMonth() + 1);
      } else {
        await dailyService.createAppointment({
          title: modalTitle.trim(),
          date: modalDate,
          startTime: modalStartTime,
          endTime: modalEndTime,
          color: modalColor,
        });
      }

      setIsModalOpen(false);
      setEditingEventId(null);
    } catch (err) {
      console.error('Erro ao salvar no calendário:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEventId) return;
    const ok = window.confirm('Deseja excluir este evento?');
    if (!ok) return;

    try {
      await calendarService.deleteEvent(editingEventId);
      const d = new Date(modalDate);
      await loadEvents(d.getFullYear(), d.getMonth() + 1);
      setIsModalOpen(false);
      setEditingEventId(null);
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      alert('Erro ao excluir.');
    }
  };

  const handleOpenDailyView = () => {
    if (!modalDate) return;
    const d = new Date(modalDate);
    onSelectDate(d);
    setIsModalOpen(false);
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">📆 Calendário</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={selectedDate}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          allDay: e.allDay,
          backgroundColor: e.color || undefined,
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleMonthChange}
        dayMaxEvents={3}          // 👈 espaço fixo por dia + “+X mais”
        height="auto"
      />

      {isModalOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <h3 className="calendar-modal-title">
              {editingEventId ? 'Editar entrada' : 'Nova entrada'}
            </h3>
            <p className="calendar-modal-subtitle">
              Dia {new Date(modalDate).toLocaleDateString('pt-BR')}
            </p>

            <div className="calendar-radio-row">
              <label>
                <input
                  type="radio"
                  checked={modalMode === 'EVENT'}
                  onChange={() => setModalMode('EVENT')}
                />
                Evento (dia inteiro)
              </label>
              <label>
                <input
                  type="radio"
                  checked={modalMode === 'APPOINTMENT'}
                  onChange={() => setModalMode('APPOINTMENT')}
                />
                Compromisso com horário
              </label>
            </div>

            <div className="calendar-form-grid">
              <input
                type="text"
                placeholder="Título"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="calendar-input"
              />

              {modalMode === 'EVENT' && (
                <textarea
                  placeholder="Descrição (opcional)"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  rows={3}
                  className="calendar-textarea"
                />
              )}

              {modalMode === 'APPOINTMENT' && (
                <div className="calendar-time-row">
                  <div className="calendar-time-field">
                    <label className="calendar-time-label">Início (HH:MM)</label>
                    <input
                      type="text"
                      value={modalStartTime}
                      onChange={(e) => setModalStartTime(e.target.value)}
                      className="calendar-input"
                    />
                  </div>
                  <div className="calendar-time-field">
                    <label className="calendar-time-label">Fim (HH:MM)</label>
                    <input
                      type="text"
                      value={modalEndTime}
                      onChange={(e) => setModalEndTime(e.target.value)}
                      className="calendar-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="calendar-color-label">Cor</label>
                <div className="calendar-color-palette">
                  {PASTEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        'calendar-color-swatch' +
                        (modalColor === color ? ' selected' : '')
                      }
                      style={{ backgroundColor: color }}
                      onClick={() => setModalColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="calendar-footer">
              <button
                type="button"
                onClick={handleOpenDailyView}
                className="calendar-btn calendar-btn-outline"
              >
                Abrir visão diária
              </button>

              <div className="calendar-footer-right">
                {editingEventId && modalMode === 'EVENT' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="calendar-btn calendar-btn-danger"
                  >
                    Excluir
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEventId(null);
                  }}
                  className="calendar-btn calendar-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="calendar-btn calendar-btn-primary"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
