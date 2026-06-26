import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CalendarDays, 
  CheckSquare, 
  HeartPulse, 
  FileText, 
  LineChart, 
  Calendar, 
  Link2, 
  Timer, 
  Settings, 
  Flame,
  Clock,
  Menu
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const { currentTab, setCurrentTab, config } = useAppState();
  const [streakBars, setStreakBars] = useState([0, 0, 0, 0, 0, 0, 0]);

  // Streak sparkline animation
  useEffect(() => {
    const bars = [40, 60, 80, 50, 90, 70, 100];
    const timer = setTimeout(() => {
      setStreakBars(bars);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: HeartPulse },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'calendar', label: 'Analytical Calendar', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Link2 },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: 'white' }}>
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span>Prdip's Land</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div 
              key={item.id} 
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={20} />
              <span className="sidebar-label">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-stat">
          <div className="sidebar-stat-icon streak">
            <Flame size={18} />
          </div>
          <div className="sidebar-stat-info">
            <div className="sidebar-stat-number">{config.streak}</div>
            <div className="sidebar-bottom-text">days in a row!</div>
            <div className="sidebar-sparkline" id="streakSparkline">
              {streakBars.map((h, i) => (
                <div 
                  key={i} 
                  className="bar" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="sidebar-stat">
          <div className="sidebar-stat-icon focus">
            <Clock size={18} />
          </div>
          <div className="sidebar-stat-info">
            <div className="sidebar-stat-number">{formatMinutes(config.focusTimeToday)}</div>
            <div className="sidebar-bottom-text">Keep going! You're doing great.</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
