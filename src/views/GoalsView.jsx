import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, Edit2, Sliders } from 'lucide-react';
import Modal from '../components/Modal';

export default function GoalsView() {
  const { config, addGoal, deleteGoal, updateGoalProgress } = useAppState();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(0);
  const [newGoalColor, setNewGoalColor] = useState('#7c3aed');
  const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    addGoal(newGoalName, newGoalProgress, newGoalColor, newGoalEmoji || '🎯');
    
    // Reset form
    setNewGoalName('');
    setNewGoalProgress(0);
    setNewGoalColor('#7c3aed');
    setNewGoalEmoji('🎯');
    setIsAddOpen(false);
  };

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Goals</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define, edit, and keep track of your long-term focus targets.</p>
        </div>
        <button className="btn-add" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Goal
        </button>
      </div>

      <div className="grid-2">
        {config.goals.map((goal) => (
          <div key={goal.id} className="card card-animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="goal-icon" 
                  style={{ 
                    backgroundColor: `${goal.color}22`, 
                    color: goal.color, 
                    width: '42px', 
                    height: '42px', 
                    fontSize: '1.25rem',
                    borderRadius: '12px'
                  }}
                >
                  {goal.emoji}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{goal.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: goal.color, fontWeight: 500 }}>Target Active</span>
                </div>
              </div>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="modal-close" 
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--red)' }}
                title="Delete goal"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Progress</span>
                <strong style={{ color: goal.color }}>{goal.progress}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <Sliders size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={goal.progress}
                onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                style={{ 
                  flex: 1, 
                  accentColor: goal.color,
                  cursor: 'pointer',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'var(--bg-input)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Goal">
        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Goal Name</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="e.g. Master React & Redux"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Progress (%)</label>
              <input 
                className="form-input" 
                type="number" 
                min="0" 
                max="100"
                value={newGoalProgress}
                onChange={(e) => setNewGoalProgress(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group" style={{ width: '80px', marginBottom: 0 }}>
              <label className="form-label">Color</label>
              <input 
                className="form-input" 
                type="color" 
                value={newGoalColor}
                onChange={(e) => setNewGoalColor(e.target.value)}
                style={{ padding: '4px', height: '42px', cursor: 'pointer' }}
              />
            </div>

            <div className="form-group" style={{ width: '80px', marginBottom: 0 }}>
              <label className="form-label">Emoji</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="🎯"
                maxLength={2}
                value={newGoalEmoji}
                onChange={(e) => setNewGoalEmoji(e.target.value)}
              />
            </div>
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
            Add Goal
          </button>
        </form>
      </Modal>
    </main>
  );
}
