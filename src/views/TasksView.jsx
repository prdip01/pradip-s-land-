import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, CheckSquare, Square, User, Filter, Tag } from 'lucide-react';
import Modal from '../components/Modal';

export default function TasksView() {
  const { config, addTask, deleteTask, toggleTaskDone } = useAppState();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTag, setNewTaskTag] = useState(config.tags[0]?.name || 'Study');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Everyone');
  const [customAssignee, setCustomAssignee] = useState('');
  const [showCustomAssigneeInput, setShowCustomAssigneeInput] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [tagFilter, setTagFilter] = useState('all'); // 'all' | tag_name
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // 'all' | assignee_name

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const assignee = showCustomAssigneeInput && customAssignee.trim() 
      ? customAssignee.trim() 
      : newTaskAssignee;

    addTask(newTaskName.trim(), newTaskTag, assignee);
    
    // Reset form
    setNewTaskName('');
    setNewTaskTag(config.tags[0]?.name || 'Study');
    setNewTaskAssignee('Everyone');
    setCustomAssignee('');
    setShowCustomAssigneeInput(false);
    setIsAddOpen(false);
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

  // Get unique assignees list for filters
  const uniqueAssignees = ['all', 'Everyone', ...new Set(config.tasks.map(t => t.assignee).filter(a => a && a !== 'Everyone'))];
  const uniqueTags = ['all', ...config.tags.map(t => t.name)];

  // Apply filters
  const filteredTasks = config.tasks.filter(task => {
    const matchStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && !task.done) || 
      (statusFilter === 'completed' && task.done);
      
    const matchTag = 
      tagFilter === 'all' || 
      task.tag === tagFilter;
      
    const matchAssignee = 
      assigneeFilter === 'all' || 
      task.assignee === assigneeFilter;

    return matchStatus && matchTag && matchAssignee;
  });

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks List</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organize, assign, and execute your study roadmap.</p>
        </div>
        <button className="btn-add" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card card-animate" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Filter size={16} /> <strong>Filter:</strong>
          </div>
          
          {/* Status Select */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setStatusFilter('all')} 
              className={`timer-mode-btn ${statusFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('active')} 
              className={`timer-mode-btn ${statusFilter === 'active' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Active
            </button>
            <button 
              onClick={() => setStatusFilter('completed')} 
              className={`timer-mode-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Completed
            </button>
          </div>

          {/* Tag Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} style={{ color: 'var(--text-muted)' }} />
            <select 
              value={tagFilter} 
              onChange={(e) => setTagFilter(e.target.value)}
              className="section-dropdown"
              style={{ padding: '4px 24px 4px 10px', minWidth: '100px' }}
            >
              <option value="all">All Tags</option>
              {config.tags.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <select 
              value={assigneeFilter} 
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="section-dropdown"
              style={{ padding: '4px 24px 4px 10px', minWidth: '130px' }}
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.filter(a => a !== 'all').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="card card-animate" style={{ padding: '20px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            No tasks match the selected filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTasks.map((task) => {
              const tagObj = config.tags.find(t => t.name === task.tag) || { color: '#a855f7' };
              return (
                <div 
                  key={task.id} 
                  className={`task-item ${task.done ? 'completed' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div 
                      className={`task-checkbox ${task.done ? 'checked' : ''}`}
                      onClick={(e) => {
                        toggleTaskDone(task.id);
                        if (!task.done) triggerConfetti(e);
                      }}
                    >
                      {task.done && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', color: 'white' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="task-text" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{task.text}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span 
                          className="task-tag" 
                          style={{ 
                            background: `${tagObj.color}22`, 
                            color: tagObj.color,
                            marginTop: 0
                          }}
                        >
                          {task.tag}
                        </span>
                        <span 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '0.7rem', 
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          <User size={10} /> {task.assignee || 'Everyone'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="modal-close" 
                    style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)', marginLeft: '12px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Task">
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Task Name</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="What do you need to accomplish?"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Tag</label>
              <select 
                className="form-input" 
                value={newTaskTag}
                onChange={(e) => setNewTaskTag(e.target.value)}
              >
                {config.tags.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Assignee</label>
              <select 
                className="form-input" 
                value={newTaskAssignee}
                onChange={(e) => {
                  setNewTaskAssignee(e.target.value);
                  if (e.target.value === 'custom') {
                    setShowCustomAssigneeInput(true);
                  } else {
                    setShowCustomAssigneeInput(false);
                  }
                }}
              >
                <option value="Everyone">Everyone</option>
                <option value={config.profile.name}>{config.profile.name} (Me)</option>
                <option value="custom">+ Assign Custom Person...</option>
              </select>
            </div>
          </div>

          {showCustomAssigneeInput && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Enter Custom Assignee Name</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g. John Doe, Study Partner"
                value={customAssignee}
                onChange={(e) => setCustomAssignee(e.target.value)}
                required
              />
            </div>
          )}

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
            Add Task
          </button>
        </form>
      </Modal>
    </main>
  );
}
