import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';

// Views
import DashboardView from './views/DashboardView';
import GoalsView from './views/GoalsView';
import PlannerView from './views/PlannerView';
import TasksView from './views/TasksView';
import HabitsView from './views/HabitsView';
import NotesView from './views/NotesView';
import ProgressView from './views/ProgressView';
import CalendarView from './views/CalendarView';
import ResourcesView from './views/ResourcesView';
import TimerView from './views/TimerView';
import SettingsView from './views/SettingsView';

import { useAppState } from './context/AppStateContext';
import { 
  CheckCircle, 
  BookOpen, 
  Quote, 
  Lightbulb, 
  ChevronRight, 
  Plus, 
  Paperclip, 
  Mic, 
  Image as ImageIcon 
} from 'lucide-react';

export default function App() {
  const { 
    currentTab, 
    config, 
    addTask, 
    toggleTaskDone, 
    addNote 
  } = useAppState();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Global add task modal form fields
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTag, setNewTaskTag] = useState(config.tags[0]?.name || 'Study');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Everyone');
  const [customAssignee, setCustomAssignee] = useState('');
  const [showCustomAssigneeInput, setShowCustomAssigneeInput] = useState(false);

  // Quick Capture notes
  const [quickNote, setQuickNote] = useState('');

  const handleGlobalAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const assignee = showCustomAssigneeInput && customAssignee.trim() 
      ? customAssignee.trim() 
      : newTaskAssignee;
    addTask(newTaskName.trim(), newTaskTag, assignee);
    setNewTaskName('');
    setNewTaskTag(config.tags[0]?.name || 'Study');
    setNewTaskAssignee('Everyone');
    setCustomAssignee('');
    setShowCustomAssigneeInput(false);
    setIsAddTaskOpen(false);
  };

  const handleQuickCapture = () => {
    if (!quickNote.trim()) return;
    addNote('Quick Capture', quickNote.trim(), 'General');
    setQuickNote('');
    alert('Captured as a General Note!');
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard': return <DashboardView />;
      case 'goals': return <GoalsView />;
      case 'planner': return <PlannerView />;
      case 'tasks': return <TasksView />;
      case 'habits': return <HabitsView />;
      case 'notes': return <NotesView />;
      case 'progress': return <ProgressView />;
      case 'calendar': return <CalendarView />;
      case 'resources': return <ResourcesView />;
      case 'timer': return <TimerView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  // Confetti trigger for today tasks checkbox
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
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        sidebarCollapsed={sidebarCollapsed} 
        setSidebarCollapsed={setSidebarCollapsed} 
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
          onAddTaskOpen={() => setIsAddTaskOpen(true)}
        />

        <div className="content-area">
          {/* Active Feature View Panel */}
          {renderActiveView()}

          {/* Right Panel: Tasks checklist, capture box, quote (hidden on settings, timer, notes views for cleaner focus layout) */}
          {!['settings', 'timer', 'notes'].includes(currentTab) && (
            <aside className={`right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`} id="rightPanel">
              
              {/* Today's Tasks */}
              <div className="section-header">
                <h2 className="section-title">Today's Tasks</h2>
                <button className="section-link" onClick={() => setCurrentTab('tasks')}>
                  View All
                </button>
              </div>
              <div className="task-list">
                {config.tasks.slice(0, 3).map((task) => {
                  const tagObj = config.tags.find(t => t.name === task.tag) || { color: '#a855f7' };
                  return (
                    <div 
                      key={task.id} 
                      className={`task-item ${task.done ? 'completed' : ''}`}
                    >
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
                      <div className="task-content">
                        <div className="task-text">{task.text}</div>
                        <span 
                          className="task-tag" 
                          style={{ background: `${tagObj.color}22`, color: tagObj.color }}
                        >
                          {task.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="add-task-btn" onClick={() => setIsAddTaskOpen(true)}>
                + Add New Task
              </button>

              {/* Quick Capture Box */}
              <div className="quick-capture">
                <div className="section-header">
                  <h2 className="section-title">Quick Capture</h2>
                </div>
                <textarea 
                  className="quick-capture-input" 
                  placeholder="Type a quick note and hit Save..." 
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div className="quick-capture-toolbar" style={{ marginTop: 0 }}>
                    <button className="quick-capture-btn" aria-label="Attach file"><Paperclip size={14} /></button>
                    <button className="quick-capture-btn" aria-label="Voice note"><Mic size={14} /></button>
                    <button className="quick-capture-btn" aria-label="Add image"><ImageIcon size={14} /></button>
                  </div>
                  <button 
                    onClick={handleQuickCapture}
                    className="btn-add" 
                    style={{ padding: '6px 14px', fontSize: '0.75rem', boxShadow: 'none' }}
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Wisdom Quote Card */}
              <div className="card wisdom-card">
                <div className="wisdom-icon">
                  <Lightbulb size={18} />
                </div>
                <div className="wisdom-quote">{config.wisdom.quote}</div>
                <div className="wisdom-author">{config.wisdom.author}</div>
              </div>

            </aside>
          )}
        </div>
      </div>

      {/* Global Add Task Modal */}
      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="Add New Task">
        <form onSubmit={handleGlobalAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Task Name</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="What do you need to do?" 
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
                {config.tags.map((tag) => (
                  <option key={tag.id} value={tag.name}>{tag.name}</option>
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
    </div>
  );
}
