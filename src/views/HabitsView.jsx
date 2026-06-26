import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, Heart, Award, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function HabitsView() {
  const { config, addHabit, deleteHabit, toggleHabitCheck } = useAppState();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim());
    setNewHabitName('');
    setIsAddOpen(false);
  };

  const getCompletionRate = (habit) => {
    const checkedCount = habit.checked.filter(Boolean).length;
    return Math.round((checkedCount / 7) * 100);
  };

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

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Habits Tracker</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Build consistent, positive study rituals and track your daily streaks.</p>
        </div>
        <button className="btn-add" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {/* Habit Stats */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="card stat-card card-animate" style={{ animationDelay: '0s' }}>
          <div className="stat-card-icon purple">
            <Heart size={20} />
          </div>
          <div className="stat-card-value">{config.habits.length}</div>
          <div className="stat-card-label">Total Active Habits</div>
        </div>

        <div className="card stat-card card-animate" style={{ animationDelay: '0.05s' }}>
          <div className="stat-card-icon green">
            <Award size={20} />
          </div>
          <div className="stat-card-value">
            {config.habits.length > 0
              ? Math.round(config.habits.reduce((acc, h) => acc + h.checked.filter(Boolean).length, 0) / (config.habits.length * 7) * 100)
              : 0}%
          </div>
          <div className="stat-card-label">Weekly Completion Rate</div>
        </div>
      </div>

      {/* Habits Grid Card */}
      <div className="card card-animate" style={{ padding: '24px', overflowX: 'auto', animationDelay: '0.1s' }}>
        <div style={{ minWidth: '600px' }}>
          <div className="habits-grid" style={{ display: 'grid', gridTemplateColumns: '2fr repeat(7, 1fr) 1fr 1fr', gap: '8px', alignItems: 'center' }}>
            {/* Header row */}
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Habit</div>
            {daysOfWeek.map((day, idx) => (
              <div key={idx} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {day}
              </div>
            ))}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ratio</div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</div>

            <hr style={{ gridColumn: 'span 10', border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0 12px' }} />

            {/* Habit Rows */}
            {config.habits.map((habit) => {
              const compRate = getCompletionRate(habit);
              const checkedCount = habit.checked.filter(Boolean).length;
              return (
                <React.Fragment key={habit.id}>
                  {/* Habit Name */}
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {habit.name}
                  </div>

                  {/* 7 Day Checks */}
                  {habit.checked.map((checked, dayIdx) => (
                    <div key={dayIdx} style={{ display: 'flex', justifyContent: 'center' }}>
                      <div 
                        className={`habit-check ${checked ? 'checked' : ''}`}
                        onClick={(e) => {
                          toggleHabitCheck(habit.id, dayIdx);
                          if (!checked) triggerConfetti(e);
                        }}
                      >
                        <CheckCircle size={14} style={{ color: checked ? 'white' : 'transparent' }} />
                      </div>
                    </div>
                  ))}

                  {/* Ratio Column */}
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: compRate > 50 ? 'var(--green)' : 'var(--text-secondary)' }}>
                    {checkedCount}/7
                  </div>

                  {/* Delete button */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="modal-close" 
                      style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}
                      title="Delete habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <hr style={{ gridColumn: 'span 10', border: 'none', borderTop: '1px solid rgba(139,92,246,0.05)', margin: '6px 0' }} />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Habit">
        <form onSubmit={handleAddHabit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Habit Name</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="e.g. 5am Wake Up, Solve 10 Math Problems"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              marginTop: '12px', 
              padding: '12px', 
              borderRadius: '12px', 
              fontFamily: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'var(--gradient-purple)',
              color: 'white',
              boxShadow: '0 2px 10px rgba(139,92,246,0.3)'
            }}
          >
            Create Habit
          </button>
        </form>
      </Modal>
    </main>
  );
}
