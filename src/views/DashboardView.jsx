import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
  BookOpen, 
  CheckCircle, 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function DashboardView() {
  const { 
    config, 
    timerSeconds, 
    timerTotalSeconds, 
    timerMode, 
    timerRunning, 
    startTimer, 
    resetTimer, 
    skipTimer, 
    setTimerMode,
    toggleHabitCheck,
    toggleTaskDone,
    setCurrentTab
  } = useAppState();

  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const formatHours = (hrs) => {
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Stacked chart calculations
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const subjects = config.subjects;
  const padding = { top: 15, right: 20, bottom: 30, left: 20 };
  const W = 600;
  const H = 220;
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const stacked = [];
  for (let d = 0; d < 7; d++) {
    let cumulative = 0;
    const layers = [];
    for (let s = 0; s < subjects.length; s++) {
      const val = subjects[s].hours[d] || 0;
      layers.push({ bottom: cumulative, top: cumulative + val, value: val, subject: subjects[s] });
      cumulative += val;
    }
    stacked.push({ layers, total: cumulative, day: days[d] });
  }

  const maxVal = Math.max(...stacked.map(d => d.total), 1);
  const xStep = chartW / 6;

  const getX = (i) => padding.left + i * xStep;
  const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

  const smoothLine = (points) => {
    if (points.length < 2) return '';
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpx = (curr.x + next.x) / 2;
      d += ` C${cpx},${curr.y} ${cpx},${next.y} ${next.x},${next.y}`;
    }
    return d;
  };

  // Study stats
  const totalHrs = subjects.reduce((sum, s) => sum + s.hours.reduce((a, b) => a + b, 0), 0);
  const avgProgress = config.goals.length > 0
    ? Math.round(config.goals.reduce((s, g) => s + g.progress, 0) / config.goals.length)
    : 0;

  const doneTasks = config.tasks.filter(t => t.done).length;
  const totalTasks = config.tasks.length;

  // Confetti effect wrapper
  const triggerConfetti = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const colors = ['#a855f7', '#c084fc', '#7c3aed', '#3b82f6', '#22c55e', '#f97316'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const angle = (i / 8) * 360;
      const distance = 20 + Math.random() * 30;
      const dx = Math.cos(angle * Math.PI / 180) * distance;
      const dy = Math.sin(angle * Math.PI / 180) * distance;
      p.style.cssText = `
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        background: ${colors[i % colors.length]};
        --confetti-x: ${dx}px;
        --confetti-y: ${dy}px;
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
        animation: confettiFly 0.6s ease forwards;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  };

  // Format timer
  const formatTimerSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerCircumference = 2 * Math.PI * 82;
  const timerStrokeOffset = timerCircumference * (1 - (timerTotalSeconds > 0 ? (timerTotalSeconds - timerSeconds) / timerTotalSeconds : 0));

  return (
    <main className="main-content">
      {/* ROW 1: Hero Cards */}
      <div className="grid-4">
        {/* Hero Card */}
        <div className="card hero-card span-2 card-animate" style={{ animationDelay: '0s' }}>
          <svg className="hero-bg" viewBox="0 0 200 200" fill="none">
            <path d="M100 20 L60 90 L80 90 L70 180 L140 80 L110 80 L130 20 Z" fill="rgba(139,92,246,0.3)" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
            <circle cx="100" cy="100" r="80" stroke="rgba(139,92,246,0.15)" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" fill="none" />
          </svg>
          <div className="hero-title">{config.profile.heroTitle}</div>
          <div className="hero-subtitle">{config.profile.heroSubtitle}</div>
        </div>

        {/* Study Time Card */}
        <div className="card stat-card card-animate" style={{ animationDelay: '0.05s' }}>
          <div className="stat-card-icon purple">
            <BookOpen size={20} />
          </div>
          <div className="stat-card-value">{formatMinutes(config.studyTimeToday)}</div>
          <div className="stat-card-label">Study Time Today</div>
          <div className="stat-card-change">+15% vs yesterday</div>
          <div className="sparkline">
            {config.weeklyData.studyTime.map((val, i) => {
              const max = Math.max(...config.weeklyData.studyTime, 1);
              return (
                <div 
                  key={i} 
                  className="bar purple" 
                  style={{ height: `${(val / max) * 100}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Goals Progress Card */}
        <div className="card stat-card card-animate" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="progress-ring-wrapper">
              <svg className="progress-ring" viewBox="0 0 64 64" style={{ width: '64px', height: '64px' }}>
                <circle className="progress-ring-bg" cx="32" cy="32" r="26" />
                <circle 
                  className="progress-ring-fill" 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  strokeDasharray="163.36"
                  strokeDashoffset={163.36 - (avgProgress / 100) * 163.36}
                />
              </svg>
            </div>
            <div>
              <div className="stat-card-value">{avgProgress}%</div>
              <div className="stat-card-label">Goals Progress</div>
              <div className="stat-card-change">+8% vs last week</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* ROW 2: Study Overview & Focus Timer */}
      <div className="grid-study-overview">
        {/* Study Chart Card */}
        <div className="card card-animate" style={{ animationDelay: '0.15s' }}>
          <div className="section-header">
            <h2 className="section-title">Study Overview</h2>
            <select className="section-dropdown" defaultValue="week">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatHours(totalHrs)}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 500 }}>+2h 15m vs last week</span>
          </div>

          <div className="subject-legend">
            {subjects.map((s) => {
              const subHrs = s.hours.reduce((a, b) => a + b, 0);
              return (
                <div key={s.id} className="subject-legend-item">
                  <div className="subject-dot" style={{ backgroundColor: s.color }} />
                  <span>{s.name} ({formatHours(subHrs)})</span>
                </div>
              );
            })}
          </div>

          <div className="chart-container" style={{ position: 'relative' }}>
            <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`}>
              {/* Gridlines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const yy = padding.top + (chartH / 4) * i;
                return (
                  <line 
                    key={i} 
                    x1={padding.left} 
                    y1={yy} 
                    x2={W - padding.right} 
                    y2={yy} 
                    stroke="rgba(139,92,246,0.06)" 
                    strokeWidth="1" 
                  />
                );
              })}

              {/* Areas */}
              {subjects.map((sub, s) => {
                const topPoints = [];
                const bottomPoints = [];
                for (let d = 0; d < 7; d++) {
                  topPoints.push({ x: getX(d), y: getY(stacked[d].layers[s].top) });
                  bottomPoints.push({ x: getX(d), y: getY(stacked[d].layers[s].bottom) });
                }
                const topPath = smoothLine(topPoints);
                const bottomPointsReversed = [...bottomPoints].reverse();
                const bottomPath = smoothLine(bottomPointsReversed);
                const pathD = `${topPath} L${bottomPointsReversed[0].x},${bottomPointsReversed[0].y} ${bottomPath.replace(/^M/, 'L')} Z`;

                return (
                  <path 
                    key={sub.id} 
                    d={pathD} 
                    fill={sub.color} 
                    fillOpacity="0.3" 
                    stroke={sub.color} 
                    strokeWidth="1.5" 
                    strokeOpacity="0.5" 
                    style={{ transition: 'opacity 0.8s ease' }}
                  />
                );
              })}

              {/* Day Labels */}
              {days.map((day, i) => (
                <text 
                  key={day} 
                  x={getX(i)} 
                  y={H - 5} 
                  textAnchor="middle" 
                  fill="var(--text-muted)" 
                  fontSize="11" 
                  fontFamily="Inter, sans-serif"
                >
                  {day}
                </text>
              ))}

              {/* Interactive Hover Zones */}
              {days.map((day, i) => {
                const cx = getX(i);
                return (
                  <g key={i}>
                    {/* Invisible hover capture rect */}
                    <rect 
                      x={cx - xStep / 2} 
                      y={padding.top} 
                      width={xStep} 
                      height={chartH} 
                      fill="transparent" 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const box = e.currentTarget.parentElement.getBoundingClientRect();
                        setTooltipPos({
                          x: cx + 12,
                          y: getY(stacked[i].total) - 20
                        });
                        setTooltipData(stacked[i]);
                      }}
                      onMouseMove={(e) => {
                        setTooltipPos({
                          x: cx + 12,
                          y: getY(stacked[i].total) - 20
                        });
                      }}
                      onMouseLeave={() => setTooltipData(null)}
                    />
                    {/* Hover line indicators */}
                    <line 
                      x1={cx} 
                      y1={padding.top} 
                      x2={cx} 
                      y2={padding.top + chartH} 
                      stroke="rgba(139,92,246,0.15)" 
                      strokeWidth="1" 
                      strokeDasharray="4,4" 
                      style={{ pointerEvents: 'none', opacity: tooltipData?.day === day ? 1 : 0, transition: 'opacity 0.15s' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Tooltip */}
            {tooltipData && (
              <div 
                className="chart-tooltip visible"
                style={{ 
                  left: `${(tooltipPos.x / W) * 100}%`, 
                  top: `${tooltipPos.y}px`,
                  transform: 'translateY(-100%)'
                }}
              >
                <strong>{tooltipData.day}</strong><br />
                {tooltipData.layers.map((layer, index) => {
                  if (layer.value > 0) {
                    return (
                      <div key={index}>
                        <span style={{ color: layer.subject.color }}>●</span> {layer.subject.name}: {formatHours(layer.value)}
                      </div>
                    );
                  }
                  return null;
                })}
                <strong>Total: {formatHours(tooltipData.total)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Focus Timer Card */}
        <div className="card timer-card card-animate" style={{ animationDelay: '0.2s' }}>
          <div className="timer-mode-select">
            <button 
              className={`timer-mode-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
              onClick={() => setTimerMode('pomodoro')}
            >
              Pomodoro
            </button>
            <button 
              className={`timer-mode-btn ${timerMode === 'short' ? 'active' : ''}`}
              onClick={() => setTimerMode('short')}
            >
              Short Break
            </button>
            <button 
              className={`timer-mode-btn ${timerMode === 'long' ? 'active' : ''}`}
              onClick={() => setTimerMode('long')}
            >
              Long Break
            </button>
          </div>

          <div className="timer-ring-wrapper">
            <svg className="timer-ring" viewBox="0 0 180 180">
              <circle className="timer-ring-bg" cx="90" cy="90" r="82" />
              <circle 
                className="timer-ring-fill" 
                cx="90" 
                cy="90" 
                r="82" 
                strokeDasharray={timerCircumference}
                strokeDashoffset={timerStrokeOffset}
              />
            </svg>
            <div className="timer-display">
              <div className="timer-time">{formatTimerSeconds(timerSeconds)}</div>
              <div className="timer-label">{timerMode === 'pomodoro' ? 'Focus' : 'Break'}</div>
            </div>
          </div>

          <div className="timer-controls">
            <button className="timer-btn secondary" onClick={resetTimer} aria-label="Reset timer">
              <RotateCcw size={20} />
            </button>
            <button 
              className={`timer-btn primary ${!timerRunning ? 'pulse' : ''}`} 
              onClick={startTimer}
              aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
            >
              {timerRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="timer-btn secondary" onClick={skipTimer} aria-label="Skip session">
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Goals & Habits */}
      <div className="grid-2">
        {/* Goals List Card */}
        <div className="card card-animate" style={{ animationDelay: '0.25s' }}>
          <div className="section-header">
            <h2 className="section-title">Goals</h2>
            <button className="section-link" onClick={() => setCurrentTab('goals')}>
              View All <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </button>
          </div>
          <div id="goalsList">
            {config.goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="goal-item">
                <div className="goal-icon" style={{ backgroundColor: `${goal.color}22`, color: goal.color }}>
                  {goal.emoji}
                </div>
                <div className="goal-info">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-progress">
                    <div className="goal-bar">
                      <div className="goal-bar-fill" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }} />
                    </div>
                    <span className="goal-percent">{goal.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habits Tracker Card */}
        <div className="card card-animate" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h2 className="section-title">Habits Tracker</h2>
            <button className="section-link" onClick={() => setCurrentTab('habits')}>
              View All <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </button>
          </div>
          <div className="habits-grid">
            <div className="habits-header">
              <span></span>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span key={idx}>{day}</span>
              ))}
            </div>
            {config.habits.slice(0, 3).map((habit) => (
              <div key={habit.id} className="habit-row">
                <div className="habit-name" title={habit.name}>{habit.name}</div>
                {habit.checked.map((checked, dayIdx) => (
                  <div 
                    key={dayIdx} 
                    className={`habit-check ${checked ? 'checked' : ''}`}
                    onClick={(e) => {
                      toggleHabitCheck(habit.id, dayIdx);
                      if (!checked) triggerConfetti(e);
                    }}
                  >
                    <CheckCircle size={14} style={{ color: checked ? 'white' : 'transparent' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: Weekly Progress */}
      <div className="card card-animate" style={{ animationDelay: '0.35s', marginBottom: '24px' }}>
        <div className="section-header">
          <h2 className="section-title">Weekly Progress</h2>
          <select className="section-dropdown" defaultValue="this-week">
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
          </select>
        </div>
        <div className="weekly-cards">
          {/* Card 1: Study Time */}
          <div className="weekly-card">
            <div className="weekly-card-label">Study Time</div>
            <div className="weekly-card-value">
              {formatHours(config.weeklyData.studyTime.reduce((a, b) => a + b, 0))}
            </div>
            <div className="weekly-sparkline">
              {config.weeklyData.studyTime.map((val, idx) => {
                const max = Math.max(...config.weeklyData.studyTime, 1);
                return (
                  <div 
                    key={idx} 
                    className="bar purple" 
                    style={{ height: `${(val / max) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Card 2: Focus Sessions */}
          <div className="weekly-card">
            <div className="weekly-card-label">Focus Sessions</div>
            <div className="weekly-card-value">
              {config.weeklyData.focusSessions.reduce((a, b) => a + b, 0)}
            </div>
            <div className="weekly-sparkline">
              {config.weeklyData.focusSessions.map((val, idx) => {
                const max = Math.max(...config.weeklyData.focusSessions, 1);
                return (
                  <div 
                    key={idx} 
                    className="bar blue" 
                    style={{ height: `${(val / max) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Card 3: Tasks Done */}
          <div className="weekly-card">
            <div className="weekly-card-label">Tasks Completed</div>
            <div className="weekly-card-value">
              {config.weeklyData.tasksDone.reduce((a, b) => a + b, 0)}
            </div>
            <div className="weekly-sparkline">
              {config.weeklyData.tasksDone.map((val, idx) => {
                const max = Math.max(...config.weeklyData.tasksDone, 1);
                return (
                  <div 
                    key={idx} 
                    className="bar green" 
                    style={{ height: `${(val / max) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Card 4: Goals Average */}
          <div className="weekly-card">
            <div className="weekly-card-label">Goals Avg</div>
            <div className="weekly-card-value">
              {config.weeklyData.goalsProgress[config.weeklyData.goalsProgress.length - 1]}%
            </div>
            <div className="weekly-sparkline">
              {config.weeklyData.goalsProgress.map((val, idx) => {
                const max = Math.max(...config.weeklyData.goalsProgress, 1);
                return (
                  <div 
                    key={idx} 
                    className="bar orange" 
                    style={{ height: `${(val / max) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
