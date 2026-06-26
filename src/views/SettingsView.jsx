import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Save, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function SettingsView() {
  const { 
    config, 
    updateProfile, 
    updateConfigField, 
    resetData, 
    addSubject, 
    deleteSubject, 
    updateSubjectColor,
    addGoal,
    deleteGoal,
    updateGoalColor,
    updateGoalProgress,
    addHabit,
    deleteHabit,
    addTag,
    deleteTag,
    updateTagColor,
    saveConfig
  } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile fields
  const [profileName, setProfileName] = useState(config.profile.name);
  const [heroTitle, setHeroTitle] = useState(config.profile.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(config.profile.heroSubtitle);

  // Subject fields
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#a855f7');

  // Goal fields
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(0);
  const [newGoalColor, setNewGoalColor] = useState('#7c3aed');
  const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');

  // Habit fields
  const [newHabitName, setNewHabitName] = useState('');

  // Tag fields
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#a855f7');

  // Timer fields
  const [pomodoro, setPomodoro] = useState(config.timer.pomodoro);
  const [shortBreak, setShortBreak] = useState(config.timer.shortBreak);
  const [longBreak, setLongBreak] = useState(config.timer.longBreak);
  const [autoStart, setAutoStart] = useState(config.timer.autoStart);

  // Data fields
  const [wisdomQuote, setWisdomQuote] = useState(config.wisdom.quote);
  const [wisdomAuthor, setWisdomAuthor] = useState(config.wisdom.author);

  // Synchronize local states when global config updates (e.g., via reset or import)
  useEffect(() => {
    setProfileName(config.profile.name || '');
    setHeroTitle(config.profile.heroTitle || '');
    setHeroSubtitle(config.profile.heroSubtitle || '');
  }, [config.profile]);

  useEffect(() => {
    setPomodoro(config.timer.pomodoro);
    setShortBreak(config.timer.shortBreak);
    setLongBreak(config.timer.longBreak);
    setAutoStart(config.timer.autoStart);
  }, [config.timer]);

  useEffect(() => {
    setWisdomQuote(config.wisdom.quote || '');
    setWisdomAuthor(config.wisdom.author || '');
  }, [config.wisdom]);

  const handleSaveProfile = () => {
    updateProfile({
      name: profileName || 'Scholar',
      heroTitle: heroTitle || 'Learn. Grow. Become.',
      heroSubtitle: heroSubtitle || ''
    });
    alert('Profile saved!');
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    addSubject(newSubName.trim(), newSubColor);
    setNewSubName('');
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) return;
    addGoal(newGoalName.trim(), newGoalProgress, newGoalColor, newGoalEmoji);
    setNewGoalName('');
    setNewGoalProgress(0);
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim());
    setNewHabitName('');
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTag(newTagName.trim(), newTagColor);
    setNewTagName('');
  };

  const handleSaveTimer = () => {
    updateConfigField('timer', {
      pomodoro: parseInt(pomodoro) || 25,
      shortBreak: parseInt(shortBreak) || 5,
      longBreak: parseInt(longBreak) || 15,
      autoStart
    });
    alert('Timer settings saved!');
  };

  const handleSaveQuote = () => {
    updateConfigField('wisdom', {
      quote: wisdomQuote,
      author: wisdomAuthor
    });
    alert('Quote saved!');
  };

  const handleExport = () => {
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aether-scholar-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const merged = {
          ...config,
          profile: imported.profile || config.profile,
          subjects: imported.subjects || config.subjects,
          goals: imported.goals || config.goals,
          habits: imported.habits || config.habits,
          tasks: imported.tasks || config.tasks,
          tags: imported.tags || config.tags,
          timer: imported.timer || config.timer,
          appearance: imported.appearance || config.appearance,
          wisdom: imported.wisdom || config.wisdom
        };
        if (imported.notes) merged.notes = imported.notes;
        if (imported.resources) merged.resources = imported.resources;
        if (imported.weeklyData) merged.weeklyData = imported.weeklyData;
        if (imported.streak !== undefined) merged.streak = imported.streak;
        if (imported.focusTimeToday !== undefined) merged.focusTimeToday = imported.focusTimeToday;
        if (imported.studyTimeToday !== undefined) merged.studyTimeToday = imported.studyTimeToday;

        saveConfig(merged);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to default? This action is irreversible.')) {
      resetData();
      alert('Data reset successfully!');
      window.location.reload();
    }
  };

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>⚙️ The Arcanum Settings</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure your identity, subjects list, focus variables, and backup data.</p>
        </div>
      </div>

      <div className="card card-animate" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Settings Tab Selector */}
        <div className="settings-tabs" style={{ marginBottom: 0 }}>
          {['profile', 'subjects', 'goals', 'habits', 'tags', 'timer', 'appearance', 'data'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`settings-tab ${activeSubTab === tab ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {tab === 'tags' ? 'Tasks & Tags' : tab}
            </button>
          ))}
        </div>

        {/* Tab Sections */}
        <div style={{ minHeight: '300px' }}>
          
          {/* PROFILE */}
          {activeSubTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Name</label>
                <input className="form-input" type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hero Title</label>
                <input className="form-input" type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Your motivational title" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hero Subtitle</label>
                <input className="form-input" type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Your motivational subtitle" />
              </div>
              <button onClick={handleSaveProfile} className="btn-add" style={{ padding: '10px 20px', display: 'inline-flex', gap: '6px', alignSelf: 'flex-start', cursor: 'pointer' }}>
                <Save size={16} /> Save Profile
              </button>
            </div>
          )}

          {/* SUBJECTS */}
          {activeSubTab === 'subjects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.subjects.map((sub) => (
                  <div key={sub.id} className="settings-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="color" 
                        value={sub.color} 
                        onChange={(e) => updateSubjectColor(sub.id, e.target.value)}
                        className="color-dot" 
                        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                      />
                      <span className="item-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sub.name}</span>
                    </div>
                    <button onClick={() => deleteSubject(sub.id)} className="modal-close" style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">New Subject Name</label>
                  <input className="form-input" type="text" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="e.g. Physics" />
                </div>
                <div className="form-group" style={{ width: '60px', marginBottom: 0 }}>
                  <label className="form-label">Color</label>
                  <input type="color" value={newSubColor} onChange={(e) => setNewSubColor(e.target.value)} style={{ padding: '2px', height: '38px', cursor: 'pointer', width: '100%', background: 'transparent', border: 'none' }} />
                </div>
                <button onClick={handleAddSubject} className="btn-add" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                  Add
                </button>
              </div>
            </div>
          )}

          {/* GOALS */}
          {activeSubTab === 'goals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.goals.map((goal) => (
                  <div key={goal.id} className="settings-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{goal.emoji}</span>
                      <input 
                        type="color" 
                        value={goal.color} 
                        onChange={(e) => updateGoalColor(goal.id, e.target.value)}
                        className="color-dot" 
                        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                      />
                      <span className="item-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{goal.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number" 
                        value={goal.progress} 
                        onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                        className="goal-progress-input" 
                        style={{ width: '50px', padding: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', textAlign: 'center', fontSize: '0.8rem' }}
                      />
                      <button onClick={() => deleteGoal(goal.id)} className="modal-close" style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add New Goal</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                    <label className="form-label">Goal Name</label>
                    <input className="form-input" type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="e.g. Master History" />
                  </div>
                  <div className="form-group" style={{ width: '70px', marginBottom: 0 }}>
                    <label className="form-label">Progress</label>
                    <input className="form-input" type="number" min="0" max="100" value={newGoalProgress} onChange={(e) => setNewGoalProgress(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group" style={{ width: '50px', marginBottom: 0 }}>
                    <label className="form-label">Color</label>
                    <input type="color" value={newGoalColor} onChange={(e) => setNewGoalColor(e.target.value)} style={{ border: 'none', background: 'transparent', height: '38px', width: '100%', cursor: 'pointer' }} />
                  </div>
                  <div className="form-group" style={{ width: '60px', marginBottom: 0 }}>
                    <label className="form-label">Emoji</label>
                    <input className="form-input" type="text" value={newGoalEmoji} onChange={(e) => setNewGoalEmoji(e.target.value)} placeholder="🎯" maxLength={2} />
                  </div>
                  <button onClick={handleAddGoal} className="btn-add" style={{ padding: '10px 20px', alignSelf: 'flex-end', cursor: 'pointer' }}>
                    Add Goal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HABITS */}
          {activeSubTab === 'habits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.habits.map((h) => (
                  <div key={h.id} className="settings-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                    <span className="item-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{h.name}</span>
                    <button onClick={() => deleteHabit(h.id)} className="modal-close" style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">New Habit Name</label>
                  <input className="form-input" type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="e.g. Read 15 mins" />
                </div>
                <button onClick={handleAddHabit} className="btn-add" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                  Add Habit
                </button>
              </div>
            </div>
          )}

          {/* TASKS & TAGS */}
          {activeSubTab === 'tags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Manage Tags</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {config.tags.map((tag) => (
                  <div key={tag.id} className="settings-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="color" 
                        value={tag.color} 
                        onChange={(e) => updateTagColor(tag.id, e.target.value)}
                        className="color-dot" 
                        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                      />
                      <span className="item-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{tag.name}</span>
                    </div>
                    <button onClick={() => deleteTag(tag.id)} className="modal-close" style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">New Tag Name</label>
                  <input className="form-input" type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="e.g. Revision" />
                </div>
                <div className="form-group" style={{ width: '60px', marginBottom: 0 }}>
                  <label className="form-label">Color</label>
                  <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} style={{ padding: '2px', height: '38px', cursor: 'pointer', width: '100%', background: 'transparent', border: 'none' }} />
                </div>
                <button onClick={handleAddTag} className="btn-add" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                  Add Tag
                </button>
              </div>
            </div>
          )}

          {/* FOCUS TIMER */}
          {activeSubTab === 'timer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pomodoro Duration (minutes)</label>
                <input className="form-input" type="number" value={pomodoro} onChange={(e) => setPomodoro(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Short Break (minutes)</label>
                <input className="form-input" type="number" value={shortBreak} onChange={(e) => setShortBreak(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Long Break (minutes)</label>
                <input className="form-input" type="number" value={longBreak} onChange={(e) => setLongBreak(e.target.value)} />
              </div>
              <div className="toggle-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="toggle-label-text" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Auto-start next session</span>
                <button 
                  onClick={() => setAutoStart(!autoStart)}
                  className={`timer-mode-btn ${autoStart ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  {autoStart ? 'ON' : 'OFF'}
                </button>
              </div>
              <button onClick={handleSaveTimer} className="btn-add" style={{ padding: '10px 20px', display: 'inline-flex', gap: '6px', alignSelf: 'flex-start', cursor: 'pointer' }}>
                <Save size={16} /> Save Timer Settings
              </button>
            </div>
          )}

          {/* APPEARANCE */}
          {activeSubTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="toggle-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="toggle-label-text" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Midnight Obsidian (Dark Mode)</span>
                <button 
                  onClick={() => updateConfigField('appearance', { ...config.appearance, darkMode: !config.appearance.darkMode })}
                  className={`timer-mode-btn ${config.appearance.darkMode ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  {config.appearance.darkMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="toggle-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="toggle-label-text" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Compact Mode</span>
                <button 
                  onClick={() => updateConfigField('appearance', { ...config.appearance, compactMode: !config.appearance.compactMode })}
                  className={`timer-mode-btn ${config.appearance.compactMode ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  {config.appearance.compactMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* DATA */}
          {activeSubTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Wisdom quote */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Wisdom Quote</h4>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Custom Quote Text</label>
                  <textarea className="form-input" rows="2" value={wisdomQuote} onChange={(e) => setWisdomQuote(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Author</label>
                  <input className="form-input" type="text" value={wisdomAuthor} onChange={(e) => setWisdomAuthor(e.target.value)} />
                </div>
                <button onClick={handleSaveQuote} className="btn-add" style={{ padding: '8px 16px', display: 'inline-flex', gap: '6px', alignSelf: 'flex-start', cursor: 'pointer' }}>
                  <Save size={14} /> Save Quote
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Data backups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Data Management</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={handleExport} className="timer-mode-btn active" style={{ padding: '10px 18px', background: 'var(--gradient-purple)', border: 'none' }}>
                    📦 Export My Data
                  </button>
                  <label className="timer-mode-btn" style={{ padding: '10px 18px', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    📥 Import My Data
                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                  </label>
                  <button onClick={handleReset} className="timer-mode-btn" style={{ padding: '10px 18px', border: '1px solid var(--red)', color: 'var(--red)' }}>
                    🗑️ Reset to Default
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
