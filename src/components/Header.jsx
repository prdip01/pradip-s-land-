import React, { useEffect, useState } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search, 
  Bell, 
  Plus 
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export default function Header({ sidebarCollapsed, setSidebarCollapsed, onAddTaskOpen }) {
  const { config, currentDate, setCurrentDate, setCurrentTab } = useAppState();
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentDate]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handlePrevDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() - 1);
    setCurrentDate(nextDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="hamburger" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="greeting">
          <span>{greeting}, </span>
          <strong 
            className="greeting-edit" 
            onClick={() => setCurrentTab('settings')}
            title="Click to edit in Settings"
          >
            {config.profile.name}
          </strong>
        </div>
      </div>

      <div className="header-center">
        <div className="date-nav">
          <button className="date-nav-btn" onClick={handlePrevDay} aria-label="Previous day">
            <ChevronLeft size={16} />
          </button>
          <span className="date-nav-text">{formatDate(currentDate)}</span>
          <button className="date-nav-btn" onClick={handleNextDay} aria-label="Next day">
            <ChevronRight size={16} />
          </button>
          <button 
            className="date-nav-btn" 
            onClick={handleToday} 
            aria-label="Go to today" 
            title="Today"
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" aria-label="Search">
          <Search size={20} />
        </button>
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="btn-add" onClick={onAddTaskOpen}>
          <Plus size={16} />
          Add
        </button>
      </div>
    </header>
  );
}
