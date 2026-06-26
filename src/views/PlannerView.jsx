import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';

const DEFAULT_SLOTS = [
  { id: 'ps1', day: 'Monday', timeStart: '09:00', timeEnd: '11:00', subjectId: 's1', topic: 'Coordinate Geometry Practice' },
  { id: 'ps2', day: 'Tuesday', timeStart: '10:00', timeEnd: '11:30', subjectId: 's2', topic: 'Syllogism and Blood Relations' },
  { id: 'ps3', day: 'Wednesday', timeStart: '14:00', timeEnd: '15:30', subjectId: 's3', topic: 'Reading Comprehension & Vocabulary' },
  { id: 'ps4', day: 'Thursday', timeStart: '09:00', timeEnd: '11:00', subjectId: 's1', topic: 'Permutations & Combinations' },
  { id: 'ps5', day: 'Friday', timeStart: '16:00', timeEnd: '17:30', subjectId: 's4', topic: 'Mughal Empire & Freedom Struggle' }
];

export default function PlannerView() {
  const { config, updateConfigField, generateId } = useAppState();
  const slots = config.plannerSlots || DEFAULT_SLOTS;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDay, setNewDay] = useState('Monday');
  const [newSubjectId, setNewSubjectId] = useState(config.subjects[0]?.id || '');
  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('11:00');
  const [newTopic, setNewTopic] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSubjectId) return;

    const newSlot = {
      id: generateId(),
      day: newDay,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      subjectId: newSubjectId,
      topic: newTopic.trim() || 'General Studies'
    };

    updateConfigField('plannerSlots', [...slots, newSlot]);
    setIsAddOpen(false);
    setNewTopic('');
  };

  const handleDeleteSlot = (id) => {
    updateConfigField('plannerSlots', slots.filter((slot) => slot.id !== id));
  };

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Study Planner</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Map out your weekly study blocks to maintain structured focus.</p>
        </div>
        <button className="btn-add" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Study Block
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {daysOfWeek.map((day) => {
          const daySlots = slots
            .filter((s) => s.day === day)
            .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

          return (
            <div key={day} className="card card-animate" style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                <Calendar size={18} style={{ color: 'var(--purple-400)' }} /> {day}
              </h3>
              {daySlots.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '10px 0' }}>No study blocks scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {daySlots.map((slot) => {
                    const subject = config.subjects.find((sub) => sub.id === slot.subjectId) || { name: 'Unknown', color: 'var(--purple-500)' };
                    return (
                      <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: '12px', borderLeft: `4px solid ${subject.color}` }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>{slot.timeStart} - {slot.timeEnd}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <BookOpen size={14} style={{ color: subject.color }} />
                            <span>{subject.name}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({slot.topic})</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="modal-close" 
                          style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Study Block Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Study Block">
        <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Day of Week</label>
              <select className="form-input" value={newDay} onChange={(e) => setNewDay(e.target.value)}>
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Subject</label>
              <select className="form-input" value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)}>
                {config.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Start Time</label>
              <input className="form-input" type="time" value={newTimeStart} onChange={(e) => setNewTimeStart(e.target.value)} required />
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">End Time</label>
              <input className="form-input" type="time" value={newTimeEnd} onChange={(e) => setNewTimeEnd(e.target.value)} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Topic / Focus Details</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="e.g. Chapter 4 Integration, Mock Test Practice"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
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
            Schedule Block
          </button>
        </form>
      </Modal>
    </main>
  );
}
