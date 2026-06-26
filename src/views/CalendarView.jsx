import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Calendar, ChevronLeft, ChevronRight, BookOpen, CheckCircle, Award } from 'lucide-react';

export default function CalendarView() {
  const { config } = useAppState();
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const daysGrid = [];
  
  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysGrid.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i)
    });
  }

  // Next month padding days
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }

  const handlePrevMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(1);
  };

  // Deterministic study hours generator for heatmap
  const getStudyHoursForDay = (dateObj) => {
    const today = new Date();
    // Future date
    if (dateObj > today) return 0;
    
    // Check if it matches this week (uses actual weeklyData if matched)
    const diffTime = Math.abs(today - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      const dayOfWeekIndex = (dateObj.getDay() + 6) % 7; // Mon=0, Sun=6
      return config.weeklyData.studyTime[dayOfWeekIndex] || 0;
    }

    // Otherwise, generate realistic mock values based on date hash
    const hash = (dateObj.getDate() * 3 + dateObj.getMonth() * 7) % 11;
    if (hash === 0) return 0;
    if (hash < 4) return hash * 0.8; // 0.8 to 2.4 hours
    if (hash < 8) return hash * 0.6 + 1; // 3.4 to 5.2 hours
    return 1.5;
  };

  // Get color scale for heatmap
  const getHeatmapColor = (hours) => {
    if (hours === 0) return 'transparent';
    if (hours < 1.5) return 'rgba(168, 85, 247, 0.15)'; // light purple
    if (hours < 3.5) return 'rgba(168, 85, 247, 0.4)';  // medium purple
    if (hours < 5) return 'rgba(139, 92, 246, 0.7)';    // solid purple
    return 'var(--purple-700)';                         // deep purple
  };

  // Generate day-specific breakdown details
  const getDetailsForDay = (dayNum) => {
    const dayDate = new Date(currentYear, currentMonth, dayNum);
    const hours = getStudyHoursForDay(dayDate);
    
    // Distribute hours into subjects
    const subjectsBreakdown = config.subjects.map((sub, idx) => {
      // Allocate fractional hours
      const share = idx === 0 ? 0.4 : idx === 1 ? 0.3 : 0.1;
      const subHrs = Number((hours * share).toFixed(1));
      return { ...sub, hours: subHrs };
    }).filter(s => s.hours > 0);

    // Mock completed tasks
    const tasksDoneCount = Math.min(config.tasks.length, Math.floor(hours * 1.2));
    const sampleTasks = config.tasks.slice(0, tasksDoneCount).map((t, i) => ({
      ...t,
      done: true,
      text: i === 0 ? `Revise ${config.subjects[0]?.name || 'Study'} Chapters` : t.text
    }));

    // Mock habits checked
    const habitsCount = Math.min(config.habits.length, Math.floor(hours * 0.8) + 1);
    const sampleHabits = config.habits.slice(0, habitsCount).map(h => ({
      ...h,
      done: true
    }));

    return {
      hours,
      subjectsBreakdown,
      tasks: sampleTasks,
      habits: sampleHabits
    };
  };

  const selectedDetails = getDetailsForDay(selectedDay);

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analytical Calendar</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analyze your study patterns through visual heatmaps and historical tracking.</p>
        </div>
      </div>

      <div className="grid-study-overview">
        {/* Heatmap Calendar */}
        <div className="card card-animate" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handlePrevMonth} className="date-nav-btn" style={{ background: 'var(--bg-input)' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="date-nav-btn" style={{ background: 'var(--bg-input)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: '6px' }}>
                {d}
              </div>
            ))}

            {daysGrid.map((cell, idx) => {
              const studyHrs = getStudyHoursForDay(cell.date);
              const bgColor = getHeatmapColor(studyHrs);
              const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
              
              return (
                <div 
                  key={idx}
                  onClick={() => cell.isCurrentMonth && setSelectedDay(cell.day)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: cell.isCurrentMonth ? 600 : 400,
                    color: cell.isCurrentMonth 
                      ? 'var(--text-primary)' 
                      : 'var(--text-dim)',
                    background: cell.isCurrentMonth ? bgColor : 'rgba(0,0,0,0.05)',
                    border: isSelected 
                      ? '2px solid var(--purple-400)' 
                      : studyHrs > 0 && cell.isCurrentMonth
                        ? '1px solid rgba(139,92,246,0.1)' 
                        : '1px solid transparent',
                    cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                  title={cell.isCurrentMonth ? `${studyHrs.toFixed(1)} hrs studied` : ''}
                  className={cell.isCurrentMonth ? 'calendar-cell-hover' : ''}
                >
                  <span>{cell.day}</span>
                  {studyHrs > 0 && cell.isCurrentMonth && (
                    <span 
                      style={{ 
                        position: 'absolute', 
                        bottom: '4px', 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        background: 'white' 
                      }} 
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Less study</span>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--border-color)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: getHeatmapColor(1) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: getHeatmapColor(3) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: getHeatmapColor(4.5) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: getHeatmapColor(6) }} />
            <span>More study</span>
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="card card-animate" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            📜 Details for {monthNames[currentMonth]} {selectedDay}, {currentYear}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Total studied KPI */}
            <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-card-icon purple" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {selectedDetails.hours.toFixed(1)} hrs
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total time studied</div>
              </div>
            </div>

            {/* Subjects breakdown */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Subject Breakdown</h4>
              {selectedDetails.subjectsBreakdown.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No subjects studied.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedDetails.subjectsBreakdown.map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="subject-dot" style={{ backgroundColor: s.color }} />
                        <span>{s.name}</span>
                      </div>
                      <strong>{s.hours}h</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks breakdown */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Tasks Completed</h4>
              {selectedDetails.tasks.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No tasks completed.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedDetails.tasks.map((t) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                      <CheckCircle size={12} style={{ color: 'var(--green)' }} />
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Habits breakdown */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Habits Maintained</h4>
              {selectedDetails.habits.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No habits completed.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedDetails.habits.map((h) => (
                    <span 
                      key={h.id} 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'rgba(34, 197, 94, 0.12)', 
                        color: 'var(--green)', 
                        padding: '2px 8px', 
                        borderRadius: '100px',
                        fontWeight: 500
                      }}
                    >
                      ✓ {h.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
