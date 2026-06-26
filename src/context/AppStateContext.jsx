import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DEFAULT_CONFIG = {
  profile: {
    name: 'Pradeep Kumar',
    heroTitle: 'Learn. Grow. Become.',
    heroSubtitle: 'Small steps every day lead to big changes.'
  },
  subjects: [
    { id: 's1', name: 'Mathematics', color: '#a855f7', hours: [0, 0, 0, 0, 0, 0, 0] },
    { id: 's2', name: 'Reasoning', color: '#3b82f6', hours: [0, 0, 0, 0, 0, 0, 0] },
    { id: 's3', name: 'English', color: '#14b8a6', hours: [0, 0, 0, 0, 0, 0, 0] },
    { id: 's4', name: 'General Knowledge', color: '#22c55e', hours: [0, 0, 0, 0, 0, 0, 0] },
    { id: 's5', name: 'Current Affairs', color: '#f97316', hours: [0, 0, 0, 0, 0, 0, 0] }
  ],
  goals: [],
  habits: [],
  tasks: [],
  tags: [
    { id: 'tag1', name: 'Study', color: '#a855f7' },
    { id: 'tag2', name: 'Practice', color: '#3b82f6' },
    { id: 'tag3', name: 'Review', color: '#14b8a6' }
  ],
  timer: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStart: false
  },
  appearance: {
    darkMode: false,
    compactMode: false
  },
  wisdom: {
    quote: '"The beautiful thing about learning is that no one can take it away from you."',
    author: '— B.B. King'
  },
  streak: 0,
  focusTimeToday: 0,
  studyTimeToday: 0,
  weeklyData: {
    studyTime: [0, 0, 0, 0, 0, 0, 0],
    focusSessions: [0, 0, 0, 0, 0, 0, 0],
    tasksDone: [0, 0, 0, 0, 0, 0, 0],
    goalsProgress: [0, 0, 0, 0, 0, 0, 0]
  },
  notes: [],
  resources: []
};

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_scholar_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults
        return deepMerge(structuredClone(DEFAULT_CONFIG), parsed);
      }
    } catch (e) {
      console.warn('Failed to load config:', e);
    }
    return structuredClone(DEFAULT_CONFIG);
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(config.timer.pomodoro * 60);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(config.timer.pomodoro * 60);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSound, setTimerSound] = useState('silence'); // 'silence' | 'tick' | 'rain'
  const timerIntervalRef = useRef(null);

  // Deep merge helper
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  // Save config to localStorage
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('aether_scholar_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save config:', e);
    }
  };

  const updateConfigField = (field, value) => {
    const updated = { ...config, [field]: value };
    saveConfig(updated);
  };

  const resetData = () => {
    localStorage.removeItem('aether_scholar_config');
    const reset = structuredClone(DEFAULT_CONFIG);
    saveConfig(reset);
    setTimerMode('pomodoro');
    setTimerSeconds(reset.timer.pomodoro * 60);
    setTimerTotalSeconds(reset.timer.pomodoro * 60);
    setTimerRunning(false);
  };

  // Appearance classes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.appearance.darkMode ? 'dark' : '');
    document.documentElement.setAttribute('data-compact', config.appearance.compactMode);
  }, [config.appearance.darkMode, config.appearance.compactMode]);

  // Timer logic
  useEffect(() => {
    const duration = getTimerDuration(timerMode);
    setTimerSeconds(duration);
    setTimerTotalSeconds(duration);
    setTimerRunning(false);
  }, [config.timer, timerMode]);

  function getTimerDuration(mode) {
    const t = config.timer;
    if (mode === 'pomodoro') return t.pomodoro * 60;
    if (mode === 'short') return t.shortBreak * 60;
    return t.longBreak * 60;
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const configRef = useRef(config);
  const timerModeRef = useRef(timerMode);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    timerModeRef.current = timerMode;
  }, [timerMode]);

  // Global Audio Synthesis Refs
  const audioCtxRef = useRef(null);
  const soundNodeRef = useRef(null);

  const stopAudio = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
      } catch (e) {}
      soundNodeRef.current = null;
    }
  };

  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  // Sound element effect (continuous white rain noise)
  useEffect(() => {
    if (!timerRunning || timerSound === 'silence') {
      stopAudio();
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (timerSound === 'rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut * 0.95 + white * 0.05);
          lastOut = output[i];
          output[i] *= 1.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        soundNodeRef.current = whiteNoise;
      }
    } catch (e) {
      console.warn('Web Audio API failed:', e);
    }

    return () => stopAudio();
  }, [timerRunning, timerSound]);

  // Tick trigger effect
  useEffect(() => {
    if (timerRunning && timerSound === 'tick') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      playTickSound();
    }
  }, [timerSeconds, timerRunning, timerSound]);

  // Timer interval callback (ref-safe)
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            
            // Notification / Alert
            const alertText = timerModeRef.current === 'pomodoro' 
              ? 'Focus session completed! Time for a break.' 
              : 'Break completed! Ready to focus?';

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Aether Scholar Focus Timer', {
                body: alertText,
                icon: '/favicon.svg'
              });
            } else {
              alert(alertText);
            }
            
            // Auto Start
            if (configRef.current.timer.autoStart) {
              setTimeout(() => {
                const nextMode = timerModeRef.current === 'pomodoro' ? 'short' : 'pomodoro';
                setTimerMode(nextMode);
                setTimerRunning(true);
              }, 1000);
            }
            
            // Add focus session stats to weeklyData
            if (timerModeRef.current === 'pomodoro') {
              const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
              const updatedWeeklyData = { ...configRef.current.weeklyData };
              updatedWeeklyData.focusSessions[currentDayIndex] += 1;
              const updatedConfig = { 
                ...configRef.current, 
                focusTimeToday: configRef.current.focusTimeToday + configRef.current.timer.pomodoro,
                weeklyData: updatedWeeklyData
              };
              saveConfig(updatedConfig);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  const startTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(getTimerDuration(timerMode));
  };
  const skipTimer = () => {
    setTimerRunning(false);
    const nextMode = timerMode === 'pomodoro' ? 'short' : 'pomodoro';
    setTimerMode(nextMode);
  };

  const generateId = () => '_' + Math.random().toString(36).substring(2, 9);

  return (
    <AppStateContext.Provider
      value={{
        config,
        currentTab,
        setCurrentTab,
        currentDate,
        setCurrentDate,
        
        // Timer
        timerSeconds,
        timerTotalSeconds,
        timerMode,
        timerRunning,
        timerSound,
        setTimerSound,
        startTimer,
        resetTimer,
        skipTimer,
        setTimerMode,
        
        // Actions
        updateConfigField,
        resetData,
        generateId,
        saveConfig,
        
        // Profile
        updateProfile: (profile) => updateConfigField('profile', profile),

        // Subjects CRUD
        addSubject: (name, color) => {
          const id = generateId();
          const newSub = { id, name, color, hours: [0, 0, 0, 0, 0, 0, 0] };
          updateConfigField('subjects', [...config.subjects, newSub]);
          return id;
        },
        deleteSubject: (id) => {
          updateConfigField('subjects', config.subjects.filter((s) => s.id !== id));
        },
        updateSubjectColor: (id, color) => {
          updateConfigField('subjects', config.subjects.map((s) => s.id === id ? { ...s, color } : s));
        },
        updateSubjectHours: (id, hours) => {
          updateConfigField('subjects', config.subjects.map((s) => s.id === id ? { ...s, hours } : s));
        },

        // Goals CRUD
        addGoal: (name, progress = 0, color = '#7c3aed', emoji = '🎯') => {
          const id = generateId();
          const newGoal = { id, name, progress, color, emoji };
          updateConfigField('goals', [...config.goals, newGoal]);
          return id;
        },
        deleteGoal: (id) => {
          updateConfigField('goals', config.goals.filter((g) => g.id !== id));
        },
        updateGoalProgress: (id, progress) => {
          updateConfigField('goals', config.goals.map((g) => g.id === id ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g));
        },
        updateGoalColor: (id, color) => {
          updateConfigField('goals', config.goals.map((g) => g.id === id ? { ...g, color } : g));
        },

        // Habits CRUD
        addHabit: (name) => {
          const id = generateId();
          const newHabit = { id, name, checked: [false, false, false, false, false, false, false] };
          updateConfigField('habits', [...config.habits, newHabit]);
          return id;
        },
        deleteHabit: (id) => {
          updateConfigField('habits', config.habits.filter((h) => h.id !== id));
        },
        toggleHabitCheck: (id, dayIndex) => {
          updateConfigField('habits', config.habits.map((h) => {
            if (h.id === id) {
              const nextChecked = [...h.checked];
              nextChecked[dayIndex] = !nextChecked[dayIndex];
              return { ...h, checked: nextChecked };
            }
            return h;
          }));
        },

        // Tasks CRUD
        addTask: (text, tag = 'Study', assignee = 'Everyone') => {
          const id = generateId();
          const newTask = { id, text, tag, done: false, assignee };
          updateConfigField('tasks', [...config.tasks, newTask]);
          return id;
        },
        deleteTask: (id) => {
          updateConfigField('tasks', config.tasks.filter((t) => t.id !== id));
        },
        toggleTaskDone: (id) => {
          const nextTasks = config.tasks.map((t) => {
            if (t.id === id) {
              // Adjust weekly tasks count if checking
              const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
              const updatedWeeklyData = { ...config.weeklyData };
              if (!t.done) {
                updatedWeeklyData.tasksDone[currentDayIndex] += 1;
              } else {
                updatedWeeklyData.tasksDone[currentDayIndex] = Math.max(0, updatedWeeklyData.tasksDone[currentDayIndex] - 1);
              }
              return { ...t, done: !t.done };
            }
            return t;
          });
          updateConfigField('tasks', nextTasks);
        },

        // Tags CRUD
        addTag: (name, color) => {
          const id = generateId();
          const newTag = { id, name, color };
          updateConfigField('tags', [...config.tags, newTag]);
          return id;
        },
        deleteTag: (id) => {
          updateConfigField('tags', config.tags.filter((t) => t.id !== id));
        },
        updateTagColor: (id, color) => {
          updateConfigField('tags', config.tags.map((t) => t.id === id ? { ...t, color } : t));
        },

        // Notes CRUD
        addNote: (title, content, category = 'General') => {
          const id = generateId();
          const newNote = { id, title, content, category, updatedAt: new Date().toISOString() };
          updateConfigField('notes', [...config.notes, newNote]);
          return id;
        },
        updateNote: (id, title, content, category) => {
          updateConfigField('notes', config.notes.map((n) => n.id === id ? { ...n, title, content, category, updatedAt: new Date().toISOString() } : n));
        },
        deleteNote: (id) => {
          updateConfigField('notes', config.notes.filter((n) => n.id !== id));
        },

        // Resources CRUD
        addResource: (title, url, category = 'Website', description = '') => {
          const id = generateId();
          const newRes = { id, title, url, category, description };
          updateConfigField('resources', [...config.resources, newRes]);
          return id;
        },
        deleteResource: (id) => {
          updateConfigField('resources', config.resources.filter((r) => r.id !== id));
        }
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
