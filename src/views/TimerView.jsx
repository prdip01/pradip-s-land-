import React, { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, ListCollapse } from 'lucide-react';

export default function TimerView() {
  const { 
    config, 
    timerSeconds, 
    timerTotalSeconds, 
    timerMode, 
    timerRunning, 
    timerSound,
    setTimerSound,
    startTimer, 
    resetTimer, 
    skipTimer, 
    setTimerMode 
  } = useAppState();

  const formatTimerSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerCircumference = 2 * Math.PI * 110; // larger radius
  const timerStrokeOffset = timerCircumference * (1 - (timerTotalSeconds > 0 ? (timerTotalSeconds - timerSeconds) / timerTotalSeconds : 0));

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="card card-animate" style={{ maxWidth: '480px', width: '90%', padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Focus Sanctuary</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tune out the noise and immerse yourself in the zone.</p>
        </div>

        {/* Mode Buttons */}
        <div className="timer-mode-select" style={{ marginBottom: 0 }}>
          <button 
            className={`timer-mode-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setTimerMode('pomodoro')}
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            Pomodoro
          </button>
          <button 
            className={`timer-mode-btn ${timerMode === 'short' ? 'active' : ''}`}
            onClick={() => setTimerMode('short')}
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            Short Break
          </button>
          <button 
            className={`timer-mode-btn ${timerMode === 'long' ? 'active' : ''}`}
            onClick={() => setTimerMode('long')}
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            Long Break
          </button>
        </div>

        {/* Large Timer Circle */}
        <div className="timer-ring-wrapper" style={{ width: '240px', height: '240px' }}>
          <svg className="timer-ring" viewBox="0 0 240 240">
            <circle className="timer-ring-bg" cx="120" cy="120" r="110" strokeWidth="8" />
            <circle 
              className="timer-ring-fill" 
              cx="120" 
              cy="120" 
              r="110" 
              strokeWidth="8"
              strokeDasharray={timerCircumference}
              strokeDashoffset={timerStrokeOffset}
            />
          </svg>
          <div className="timer-display">
            <div className="timer-time" style={{ fontSize: '3.5rem' }}>{formatTimerSeconds(timerSeconds)}</div>
            <div className="timer-label" style={{ fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {timerMode === 'pomodoro' ? 'Focusing' : 'Resting'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Audio selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--bg-input)', borderRadius: '100px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {timerSound === 'silence' ? <VolumeX size={14} /> : <Volume2 size={14} />} <strong>Audio:</strong>
            </span>
            <select 
              value={timerSound} 
              onChange={(e) => setTimerSound(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-primary)', 
                fontFamily: 'inherit', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="silence">Silent Focus</option>
              <option value="tick">Analog Ticking</option>
              <option value="rain">White Rain Noise</option>
            </select>
          </div>

          {/* Notification status / request button */}
          {('Notification' in window) && (
            <button
              onClick={() => {
                if (Notification.permission === 'default') {
                  Notification.requestPermission().then(() => {
                    // force page re-render
                    window.dispatchEvent(new Event('resize')); 
                  });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: Notification.permission === 'granted' ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-input)',
                borderRadius: '100px',
                border: `1px solid ${Notification.permission === 'granted' ? 'var(--green)' : 'var(--border-color)'}`,
                fontSize: '0.75rem',
                color: Notification.permission === 'granted' ? 'var(--green-light)' : 'var(--text-secondary)',
                cursor: Notification.permission === 'default' ? 'pointer' : 'default',
                fontWeight: 600
              }}
              disabled={Notification.permission !== 'default'}
            >
              🔔 {Notification.permission === 'granted' ? 'Notifications Enabled' : Notification.permission === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
            </button>
          )}
        </div>

        {/* Timer Control Buttons */}
        <div className="timer-controls">
          <button 
            className="timer-btn secondary" 
            onClick={resetTimer} 
            style={{ width: '48px', height: '48px' }}
            title="Reset Session"
          >
            <RotateCcw size={22} />
          </button>
          
          <button 
            className={`timer-btn primary ${!timerRunning ? 'pulse' : ''}`} 
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
              startTimer();
            }}
            style={{ width: '64px', height: '64px' }}
            title={timerRunning ? 'Pause Session' : 'Start Session'}
          >
            {timerRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button 
            className="timer-btn secondary" 
            onClick={skipTimer}
            style={{ width: '48px', height: '48px' }}
            title="Skip Session"
          >
            <SkipForward size={22} />
          </button>
        </div>

        {/* Session log */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <ListCollapse size={14} /> <strong>Completed Focus Sessions:</strong>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple-400)' }}>
            {config.weeklyData.focusSessions[(new Date().getDay() + 6) % 7]} sessions today ({config.focusTimeToday} mins)
          </span>
        </div>
      </div>
    </main>
  );
}
