import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSuccess, defaultDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:30');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('blue');
  const [targetRole, setTargetRole] = useState('all');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [labId, setLabId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  const [dateStr, setDateStr] = useState(
    defaultDate 
      ? defaultDate.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (isOpen) {
      const loadMetadata = async () => {
        try {
          const [cRes, lRes] = await Promise.all([
            apiClient.get('/courses'),
            apiClient.get('/labs')
          ]);
          setCourses(cRes.data);
          setLabs(lRes.data);
        } catch (err) {
          console.error('Failed to load courses/labs', err);
        }
      };
      loadMetadata();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const format12h = (time24: string): string => {
    if (!time24) return '';
    const [hrsStr, minsStr] = time24.split(':');
    const hrs = parseInt(hrsStr, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs % 12 || 12;
    return `${String(hrs12).padStart(2, '0')}:${minsStr} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const start_time = `${dateStr}T${startTimeStr}:00`;
      const end_time = `${dateStr}T${endTimeStr}:00`;
      const timeFmt = format12h(startTimeStr);

      await apiClient.post('/calendar/events', {
        title,
        description: description || undefined,
        start_time,
        end_time,
        date: dateStr,
        time: timeFmt,
        location,
        type,
        target_role: targetRole || undefined,
        course_id: courseId || undefined,
        lab_id: labId || undefined
      });
      onSuccess();
      onClose();
      // Reset fields
      setTitle('');
      setDescription('');
      setLocation('');
      setCourseId('');
      setLabId('');
    } catch (err: any) {
      console.error('Failed to create event', err);
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg w-full max-w-lg rounded-[24px] border border-border-subtle shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-[24px] font-semibold text-primary">New Event</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Event Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DSP Lab Session"
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors placeholder:text-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the event..."
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors placeholder:text-secondary/50 h-20 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Date</label>
                <input 
                  type="date" 
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Start Time</label>
                <input 
                  type="time" 
                  required
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">End Time</label>
                <input 
                  type="time" 
                  required
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Location</label>
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Virtual Lab 1"
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors placeholder:text-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                >
                  <option value="all">Everyone</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="student">Student Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Event Type Color</label>
                <div className="flex gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="blue" 
                      checked={type === 'blue'} 
                      onChange={(e) => setType(e.target.value)}
                      className="accent-neural-blue"
                    />
                    <span className="text-sm font-semibold text-neural-blue">Blue (Work)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="pink" 
                      checked={type === 'pink'} 
                      onChange={(e) => setType(e.target.value)}
                      className="accent-neural-pink"
                    />
                    <span className="text-sm font-semibold text-neural-pink">Pink (Meeting)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Course Scope (Optional)</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                >
                  <option value="">Institution-wide</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Lab Scope (Optional)</label>
                <select
                  value={labId}
                  onChange={(e) => setLabId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-neural-blue transition-colors text-sm"
                >
                  <option value="">No lab filter</option>
                  {labs.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-border-subtle text-secondary hover:text-primary hover:bg-surface-container-low transition-colors font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
