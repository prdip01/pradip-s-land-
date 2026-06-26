import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { BookOpen, Clock, CheckCircle, Award, LineChart } from 'lucide-react';

export default function ProgressView() {
  const { config } = useAppState();
  const weekly = config.weeklyData;

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr) => arr.length > 0 ? (sum(arr) / arr.length).toFixed(1) : '0';

  const formatHours = (hrs) => {
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // SVG Chart helper
  const drawLineChart = (data, color, maxOverride = null) => {
    const W = 500;
    const H = 150;
    const padding = { top: 15, right: 15, bottom: 25, left: 15 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    
    const maxVal = maxOverride || Math.max(...data, 1);
    const xStep = chartW / (data.length - 1);
    
    const getX = (i) => padding.left + i * xStep;
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;
    
    let pathD = `M${getX(0)},${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      pathD += ` L${getX(i)},${getY(data[i])}`;
    }
    
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
        {/* Gridlines */}
        {[0, 1, 2, 3].map((i) => {
          const yy = padding.top + (chartH / 3) * i;
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
        {/* Trend Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {data.map((val, idx) => (
          <circle key={idx} cx={getX(idx)} cy={getY(val)} r="4" fill="var(--bg-primary)" stroke={color} strokeWidth="2" />
        ))}
        {/* Day labels */}
        {days.map((day, idx) => (
          <text 
            key={day} 
            x={getX(idx)} 
            y={H - 4} 
            textAnchor="middle" 
            fill="var(--text-muted)" 
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {day}
          </text>
        ))}
      </svg>
    );
  };

  const drawBarChart = (data, color) => {
    const W = 500;
    const H = 150;
    const padding = { top: 15, right: 15, bottom: 25, left: 15 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    
    const maxVal = Math.max(...data, 1);
    const xStep = chartW / data.length;
    const barWidth = Math.max(12, xStep * 0.4);
    
    const getX = (i) => padding.left + i * xStep + xStep / 2;
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;
    
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
        {/* Gridlines */}
        {[0, 1, 2, 3].map((i) => {
          const yy = padding.top + (chartH / 3) * i;
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
        {/* Bars */}
        {data.map((val, idx) => {
          const cx = getX(idx);
          const cy = getY(val);
          const barH = padding.top + chartH - cy;
          return (
            <rect 
              key={idx} 
              x={cx - barWidth / 2} 
              y={cy} 
              width={barWidth} 
              height={barH} 
              rx="4"
              fill={color} 
            />
          );
        })}
        {/* Day labels */}
        {days.map((day, idx) => (
          <text 
            key={day} 
            x={getX(idx)} 
            y={H - 4} 
            textAnchor="middle" 
            fill="var(--text-muted)" 
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {day}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Progress Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visualize your study habits, tasks completed, and goal trajectories.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card stat-card card-animate" style={{ animationDelay: '0s' }}>
          <div className="stat-card-icon purple">
            <BookOpen size={20} />
          </div>
          <div className="stat-card-value">{formatHours(sum(weekly.studyTime))}</div>
          <div className="stat-card-label">Total Study Time</div>
        </div>

        <div className="card stat-card card-animate" style={{ animationDelay: '0.05s' }}>
          <div className="stat-card-icon blue">
            <Clock size={20} />
          </div>
          <div className="stat-card-value">{sum(weekly.focusSessions)}</div>
          <div className="stat-card-label">Focus Sessions Completed</div>
        </div>

        <div className="card stat-card card-animate" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-card-value">{sum(weekly.tasksDone)}</div>
          <div className="stat-card-label">Total Tasks Completed</div>
        </div>

        <div className="card stat-card card-animate" style={{ animationDelay: '0.15s' }}>
          <div className="stat-card-icon orange">
            <Award size={20} />
          </div>
          <div className="stat-card-value">{avg(weekly.goalsProgress)}%</div>
          <div className="stat-card-label">Average Goal Progress</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        {/* Chart 1: Study Time Trend */}
        <div className="card card-animate" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h3 className="section-title">Study Time Trend (Hours)</h3>
          </div>
          <div style={{ height: '160px', marginTop: '16px' }}>
            {drawLineChart(weekly.studyTime, '#a855f7')}
          </div>
        </div>

        {/* Chart 2: Tasks Done */}
        <div className="card card-animate" style={{ animationDelay: '0.25s' }}>
          <div className="section-header">
            <h3 className="section-title">Tasks Completed Trend</h3>
          </div>
          <div style={{ height: '160px', marginTop: '16px' }}>
            {drawBarChart(weekly.tasksDone, '#22c55e')}
          </div>
        </div>

        {/* Chart 3: Focus Sessions */}
        <div className="card card-animate" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h3 className="section-title">Focus Sessions Completed</h3>
          </div>
          <div style={{ height: '160px', marginTop: '16px' }}>
            {drawBarChart(weekly.focusSessions, '#3b82f6')}
          </div>
        </div>

        {/* Chart 4: Goals Progress Trend */}
        <div className="card card-animate" style={{ animationDelay: '0.35s' }}>
          <div className="section-header">
            <h3 className="section-title">Goals Average Progress (%)</h3>
          </div>
          <div style={{ height: '160px', marginTop: '16px' }}>
            {drawLineChart(weekly.goalsProgress, '#f97316', 100)}
          </div>
        </div>
      </div>
    </main>
  );
}
