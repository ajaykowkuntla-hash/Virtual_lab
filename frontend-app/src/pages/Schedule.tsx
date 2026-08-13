import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CreateEventModal } from '../components/CreateEventModal';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedEvent, setDetailedEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/calendar/events');
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  const currentEvents = events;

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const emptyDaysStart = firstDay;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((emptyDaysStart + daysInMonth) / 7) * 7;
  
  const monthString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <Layout role={user?.role as 'admin' | 'faculty' | 'student' || 'student'}>
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Schedule
          </h1>
          <p className="font-body-lg text-secondary">Manage your upcoming classes and lab sessions.</p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all font-label-caps text-label-caps font-bold">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Event
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-card-bg rounded-[20px] border border-border-subtle shadow-sm p-8 fade-in-up stagger-2 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-h3 text-h3 text-primary flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-neural-blue">calendar_today</span>
              {monthString}
            </h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-[10px] border border-border-subtle hover:bg-surface-container-low transition-colors text-secondary hover:text-primary">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-[10px] border border-border-subtle hover:bg-surface-container-low transition-colors text-secondary hover:text-primary">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col border border-border-subtle rounded-xl overflow-hidden bg-surface-container-lowest">
            <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-container-low">
              {weekdays.map(day => (
                <div key={day} className="text-center py-4 font-label-caps text-[11px] text-secondary font-bold tracking-widest border-r border-border-subtle last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 flex-1 bg-border-subtle gap-px">
              {[...Array(totalCells)].map((_, i) => {
                const dateNum = i - emptyDaysStart + 1;
                const isCurrentMonth = dateNum > 0 && dateNum <= daysInMonth;
                const cellDate = isCurrentMonth ? new Date(year, month, dateNum) : null;
                
                const isSelected = cellDate && 
                  selectedDate.getFullYear() === cellDate.getFullYear() && 
                  selectedDate.getMonth() === cellDate.getMonth() && 
                  selectedDate.getDate() === cellDate.getDate();
                  
                const isToday = cellDate && 
                  new Date().getFullYear() === cellDate.getFullYear() &&
                  new Date().getMonth() === cellDate.getMonth() &&
                  new Date().getDate() === cellDate.getDate();

                const fmtCell = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                const dayEvents = isCurrentMonth ? currentEvents.filter(e => e.date === fmtCell) : [];
                
                return (
                  <div 
                    key={i} 
                    onClick={() => isCurrentMonth && cellDate && setSelectedDate(cellDate)}
                    className={`
                      min-h-[100px] bg-white p-2 relative flex flex-col transition-colors
                      ${isCurrentMonth ? 'cursor-pointer hover:bg-surface-container-low/50' : 'bg-surface-container-low/30'}
                    `}
                  >
                    {isCurrentMonth && (
                      <div className={`
                        w-full h-full p-2 flex flex-col
                        ${isSelected ? 'bg-neural-blue/10 rounded-[14px]' : 'rounded-none'}
                      `}>
                        <span className={`
                          font-mono-metrics text-sm text-right flex items-center justify-end gap-1
                          ${isSelected ? 'font-bold text-neural-blue' : 'text-primary'}
                        `}>
                          {isToday && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-neural-blue"></span>}
                          {dateNum}
                        </span>
                        
                        <div className="mt-auto flex flex-col gap-1 w-full">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div 
                              key={e.id} 
                              onClick={(event) => {
                                event.stopPropagation();
                                setDetailedEvent(e);
                              }}
                              className={`h-2 w-full rounded-full opacity-80 cursor-pointer ${e.type === 'blue' ? 'bg-neural-blue' : 'bg-neural-pink'} hover:scale-105 transition-transform`}
                              title={e.title}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-card-bg rounded-[20px] border border-border-subtle shadow-sm p-8 fade-in-up stagger-3 flex flex-col h-fit">
          <h3 className="font-h3 text-[24px] text-primary mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px] text-neural-blue">view_list</span>
            Agenda for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h3>
          
          <div className="relative pl-6 flex-1">
            <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-neural-blue/20"></div>
            
            {(() => {
              const selectedDateFmt = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
              const selectedEvents = currentEvents.filter(e => e.date === selectedDateFmt).sort((a, b) => a.time.localeCompare(b.time));
              
              if (selectedEvents.length === 0) {
                return (
                  <div className="h-full flex items-center justify-center pt-8 text-secondary font-body-md italic text-sm">
                    No events scheduled.
                  </div>
                );
              }
              
              return (
                <div className="space-y-6">
                  {selectedEvents.map((item) => (
                    <div key={item.id} onClick={() => setDetailedEvent(item)} className="relative group cursor-pointer">
                      <div className={`absolute -left-[29px] top-[6px] w-[10px] h-[10px] rounded-full bg-white border-[2px] z-10 group-hover:scale-125 transition-transform ${item.type === 'blue' ? 'border-neural-blue' : 'border-neural-pink'}`}></div>
                      
                      <div className="mb-1">
                        <span className={`font-mono-metrics text-xs font-bold ${item.type === 'blue' ? 'text-neural-blue' : 'text-neural-pink'}`}>{item.time}</span>
                      </div>
                      
                      <div className={`bg-surface-container-lowest border border-border-subtle p-4 rounded-[14px] transition-all group-hover:translate-x-1 hover:shadow-md ${item.type === 'blue' ? 'hover:border-neural-blue/30' : 'hover:border-neural-pink/30'}`}>
                        <h4 className="font-body-md font-semibold text-primary">{item.title}</h4>
                        <div className="flex items-center gap-1.5 mt-2 text-secondary">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="text-xs">{item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      
      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
        defaultDate={selectedDate}
      />

      {detailedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-bg w-full max-w-md rounded-[24px] border border-border-subtle shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <h3 className="text-xl font-bold text-primary">{detailedEvent.title}</h3>
              <button onClick={() => setDetailedEvent(null)} className="text-secondary hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm text-primary">
              {detailedEvent.description && (
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Description</span>
                  <p className="bg-surface-container-low p-3 rounded-lg text-secondary leading-relaxed">{detailedEvent.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Date</span>
                  <p className="font-semibold text-secondary">{detailedEvent.date}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Time</span>
                  <p className="font-semibold text-secondary">{detailedEvent.time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Location</span>
                  <p className="font-semibold text-secondary">{detailedEvent.location}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Scope</span>
                  <p className="font-semibold text-secondary capitalize">{detailedEvent.target_role || 'Everyone'}</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <button onClick={() => setDetailedEvent(null)} className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-md">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
