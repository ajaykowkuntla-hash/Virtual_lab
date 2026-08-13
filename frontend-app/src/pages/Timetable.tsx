import React, { useState } from 'react';
import { Layout } from '../components/Layout';

export const Timetable: React.FC = () => {
  const [activeView, setActiveView] = useState<'week' | 'list'>('week');

  // Hardcoded for the design mockup
  const weekDays = [
    { name: 'Mon', date: '26 May', active: true },
    { name: 'Tue', date: '27 May', active: false },
    { name: 'Wed', date: '28 May', active: false },
    { name: 'Thu', date: '29 May', active: false },
    { name: 'Fri', date: '30 May', active: false },
    { name: 'Sat', date: '31 May', active: false },
    { name: 'Sun', date: '1 Jun', active: false }
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Helper to convert time (e.g., "10:00 AM") to top offset (pixels)
  // Assuming 8:00 AM is 0px, each hour is 80px.
  const getTopOffset = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const baseHour = 8; // 8:00 AM
    const totalMinutes = (hours - baseHour) * 60 + minutes;
    return (totalMinutes / 60) * 80;
  };

  const getHeight = (durationHours: number) => {
    return durationHours * 80;
  };

  // Mock class data
  const classes = [
    // Monday
    { dayIdx: 0, time: '10:00 AM', duration: 2, title: 'Digital Signal Processing', room: 'Room 304', color: 'bg-blue-100 text-blue-900 border-blue-200', icon: 'book' },
    { dayIdx: 0, time: '1:00 PM', duration: 1.5, title: 'Electromagnetic Fields', room: 'Room 201', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', icon: 'bolt' },
    { dayIdx: 0, time: '3:00 PM', duration: 2, title: 'MATLAB Lab', room: 'Lab 2', color: 'bg-cyan-100 text-cyan-900 border-cyan-200', icon: 'science' },
    
    // Tuesday
    { dayIdx: 1, time: '10:30 AM', duration: 2, title: 'Analog Electronics', room: 'Room 105', color: 'bg-green-100 text-green-900 border-green-200', icon: 'menu_book' },
    { dayIdx: 1, time: '2:00 PM', duration: 1.5, title: 'Communication Systems', room: 'Room 202', color: 'bg-pink-100 text-pink-900 border-pink-200', icon: 'podcasts' },
    
    // Wednesday
    { dayIdx: 2, time: '9:30 AM', duration: 2, title: 'Microcontrollers', room: 'Room 104', color: 'bg-purple-100 text-purple-900 border-purple-200', icon: 'memory' },
    { dayIdx: 2, time: '3:30 PM', duration: 2, title: 'Digital Signal Processing Lab', room: 'Lab 1', color: 'bg-blue-100 text-blue-900 border-blue-200', icon: 'menu_book' },
    
    // Thursday
    { dayIdx: 3, time: '10:00 AM', duration: 1.5, title: 'Digital Signal Processing', room: 'Room 304', color: 'bg-blue-100 text-blue-900 border-blue-200', icon: 'book' },
    { dayIdx: 3, time: '2:30 PM', duration: 2, title: 'Analog Electronics Lab', room: 'Lab 2', color: 'bg-green-100 text-green-900 border-green-200', icon: 'menu_book' },
    
    // Friday
    { dayIdx: 4, time: '10:00 AM', duration: 2, title: 'Electromagnetic Fields', room: 'Room 201', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', icon: 'menu_book' },
    { dayIdx: 4, time: '1:00 PM', duration: 3, title: 'Communication Systems Lab', room: 'Lab 3', color: 'bg-pink-100 text-pink-900 border-pink-200', icon: 'menu_book' },
  ];

  return (
    <Layout role="student" breadcrumbs={<span className="font-medium text-primary">Timetable</span>}>
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            Fall Semester 2026
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Timetable</h1>
          <p className="text-gray-500">Your complete class, lab and meeting schedule — all in one place.</p>
        </div>

        <div className="flex bg-gray-100 rounded-full p-1">
          <button 
            onClick={() => setActiveView('week')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeView === 'week' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="material-symbols-outlined text-[18px]">timeline</span>
            Week
          </button>
          <button 
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeView === 'list' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            List
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
          
          {/* Mini Calendar */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">May 2026</h3>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-xs font-semibold text-gray-400">{d}</div>
              ))}
              
              {/* Dummy dates for May 2026 */}
              {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map(d => (
                <div key={d} className="text-sm font-semibold text-gray-700 w-8 h-8 mx-auto flex items-center justify-center rounded-full hover:bg-gray-50 cursor-pointer">{d}</div>
              ))}
              <div className="text-sm font-bold text-white bg-purple-600 w-8 h-8 mx-auto flex items-center justify-center rounded-full shadow-sm cursor-pointer">26</div>
              {[27, 28, 29, 30, 31].map(d => (
                <div key={d} className="text-sm font-semibold text-gray-700 w-8 h-8 mx-auto flex items-center justify-center rounded-full hover:bg-gray-50 cursor-pointer">{d}</div>
              ))}
            </div>
          </div>

          {/* Today Schedule */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Today</h3>
                <p className="text-xs text-gray-500 font-medium">Mon, 26 May 2026</p>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">3 Classes</span>
            </div>

            <div className="relative pl-6 space-y-6">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200"></div>
              
              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white"></div>
                <div className="flex gap-4">
                  <div className="w-16 shrink-0 text-xs font-bold text-gray-900 pt-0.5">10:00 AM</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Digital Signal Processing</div>
                    <div className="text-xs text-gray-500 mt-0.5">Room 304</div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-yellow-500 ring-4 ring-white"></div>
                <div className="flex gap-4">
                  <div className="w-16 shrink-0 text-xs font-bold text-gray-900 pt-0.5">01:00 PM</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Electromagnetic Fields</div>
                    <div className="text-xs text-gray-500 mt-0.5">Room 201</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-white"></div>
                <div className="flex gap-4">
                  <div className="w-16 shrink-0 text-xs font-bold text-gray-900 pt-0.5">03:00 PM</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">MATLAB Lab</div>
                    <div className="text-xs text-gray-500 mt-0.5">Lab 2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This Week Stats */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">bar_chart</span>
              This Week
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-xs text-gray-500 font-medium">Lectures</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">2</div>
                <div className="text-xs text-gray-500 font-medium">Labs</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-500 font-medium">Meetings</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">7</div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Main Grid */}
        <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Grid Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-20">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">26 May – 1 Jun 2026</h2>
            </div>
            <button className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[800px] relative">
              
              {/* Days Header */}
              <div className="flex border-b border-gray-100 pl-16">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex-1 py-4 flex flex-col items-center justify-center border-l border-transparent relative">
                    {day.active && <div className="absolute inset-2 bg-purple-100 rounded-2xl -z-10"></div>}
                    <span className={`text-sm font-bold ${day.active ? 'text-purple-900' : 'text-gray-900'}`}>{day.name}</span>
                    <span className={`text-xs ${day.active ? 'text-purple-700 font-semibold' : 'text-gray-500'}`}>{day.date}</span>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="relative" style={{ height: '800px' }}>
                
                {/* Time Labels & Horizontal Lines */}
                {timeSlots.map((time, i) => (
                  <div key={i} className="absolute w-full flex" style={{ top: `${i * 80}px` }}>
                    <div className="w-16 shrink-0 text-right pr-4 text-xs font-semibold text-gray-500 -mt-2">
                      {time}
                    </div>
                    <div className="flex-1 border-t border-gray-100"></div>
                  </div>
                ))}
                
                {/* Vertical Lines */}
                <div className="absolute inset-0 left-16 flex">
                  {weekDays.map((_, i) => (
                    <div key={i} className="flex-1 border-l border-gray-100 h-full"></div>
                  ))}
                </div>

                {/* Current Time Indicator */}
                <div className="absolute w-full flex z-10 pointer-events-none" style={{ top: `${getTopOffset('9:25 AM')}px` }}>
                  <div className="w-16 shrink-0 flex justify-end pr-2 -mt-2.5">
                    <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">09:25 AM</span>
                  </div>
                  <div className="flex-1 border-t-2 border-purple-500 relative">
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>

                {/* Class Blocks */}
                <div className="absolute inset-0 left-16 flex">
                  {weekDays.map((_, dayIdx) => (
                    <div key={dayIdx} className="flex-1 relative">
                      {classes.filter(c => c.dayIdx === dayIdx).map((cls, i) => (
                        <div 
                          key={i} 
                          className={`absolute w-[calc(100%-8px)] left-[4px] rounded-lg p-3 border shadow-sm flex flex-col gap-1 overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-md cursor-pointer ${cls.color}`}
                          style={{ top: `${getTopOffset(cls.time)}px`, height: `${getHeight(cls.duration)}px` }}
                        >
                          <h4 className="font-bold text-sm leading-tight flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0 opacity-80">{cls.icon}</span>
                            {cls.title}
                          </h4>
                          <div className="text-xs font-medium opacity-80 flex items-center gap-1 mt-auto">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {cls.room}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Grid Footer */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Lectures
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div> Labs
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Meetings
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Other
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                Sync to Calendar
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};
