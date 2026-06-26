import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, Save, FileText, Search, Folder, Calendar } from 'lucide-react';

export default function NotesView() {
  const { config, addNote, updateNote, deleteNote } = useAppState();
  
  const [activeNoteId, setActiveNoteId] = useState(config.notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Editor states
  const activeNote = config.notes.find((n) => n.id === activeNoteId);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');

  // Synchronize editor fields when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditCategory(activeNote.category || 'General');
    } else {
      setEditTitle('');
      setEditContent('');
      setEditCategory('General');
    }
  }, [activeNoteId]);

  const [isSaving, setIsSaving] = useState(false);

  // Auto-save note content
  React.useEffect(() => {
    if (!activeNoteId || !activeNote) return;
    
    const isDifferent = 
      editTitle !== activeNote.title ||
      editContent !== activeNote.content ||
      editCategory !== activeNote.category;

    if (isDifferent) {
      setIsSaving(true);
      const delayDebounceFn = setTimeout(() => {
        updateNote(activeNoteId, editTitle, editContent, editCategory);
        setIsSaving(false);
      }, 800);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setIsSaving(false);
    }
  }, [editTitle, editContent, editCategory, activeNoteId]);

  const handleCreateNote = () => {
    const newId = addNote('New Note', 'Write your thoughts here...', 'General');
    if (newId) {
      setActiveNoteId(newId);
    }
  };

  const handleSaveNote = () => {
    if (!activeNoteId) return;
    updateNote(activeNoteId, editTitle, editContent, editCategory);
    setIsSaving(false);
  };

  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    deleteNote(activeNoteId);
    // Select first note remaining or set to null
    const remaining = config.notes.filter((n) => n.id !== activeNoteId);
    setActiveNoteId(remaining[0]?.id || null);
  };

  const categories = ['all', ...new Set(config.notes.map((n) => n.category || 'General'))];

  // Filter notes
  const filteredNotes = config.notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      categoryFilter === 'all' || 
      note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="main-content" style={{ padding: '24px 0 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      <div style={{ padding: '0 24px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grimoire Notes</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quick capture formulas, reminders, and summaries.</p>
        </div>
        <button className="btn-add" onClick={handleCreateNote}>
          <Plus size={16} /> New Note
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left pane: Notes list */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(15, 10, 26, 0.3)', flexShrink: 0 }}>
          {/* Search and Filters */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '0.8rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-dim)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={14} style={{ color: 'var(--text-dim)' }} />
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="section-dropdown"
                style={{ flex: 1, padding: '4px 28px 4px 10px', fontSize: '0.75rem' }}
              >
                <option value="all">All Folders</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes list scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No notes found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredNotes.map((note) => {
                  const isActive = note.id === activeNoteId;
                  return (
                    <div 
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      style={{ 
                        padding: '12px 14px', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        background: isActive ? 'var(--gradient-purple-soft)' : 'transparent',
                        border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                      className="note-list-item"
                    >
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                        {note.title || 'Untitled Note'}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                        {note.content || 'Empty note...'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: 'var(--purple-300)', padding: '2px 6px', borderRadius: '4px' }}>
                          {note.category || 'General'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Calendar size={10} /> {formatDate(note.updatedAt).split(',')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(26, 17, 40, 0.2)' }}>
          {activeNote ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', overflowY: 'auto' }}>
              {/* Header Editor toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)', 
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '100%'
                    }}
                    placeholder="Note Title"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Category select */}
                  <select 
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="section-dropdown"
                    style={{ padding: '6px 28px 6px 12px', background: 'var(--bg-input)' }}
                  >
                    <option value="General">General</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="Current Affairs">Current Affairs</option>
                  </select>

                  <button 
                    onClick={handleSaveNote}
                    className="btn-add" 
                    style={{ 
                      padding: '8px 16px', 
                      background: isSaving 
                        ? 'var(--bg-input)' 
                        : (editTitle === activeNote.title && editContent === activeNote.content && editCategory === activeNote.category)
                          ? 'rgba(34, 197, 94, 0.15)'
                          : 'var(--gradient-purple)', 
                      color: (editTitle === activeNote.title && editContent === activeNote.content && editCategory === activeNote.category) && !isSaving
                        ? 'var(--green)'
                        : 'white',
                      border: (editTitle === activeNote.title && editContent === activeNote.content && editCategory === activeNote.category) && !isSaving
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : 'none',
                      display: 'inline-flex', 
                      gap: '6px', 
                      cursor: 'pointer' 
                    }}
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : (editTitle === activeNote.title && editContent === activeNote.content && editCategory === activeNote.category) ? 'Saved' : 'Save'}
                  </button>

                  <button 
                    onClick={handleDeleteNote}
                    className="modal-close" 
                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--red)', width: '36px', height: '36px' }}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Last updated: {formatDate(activeNote.updatedAt)}
              </div>

              {/* Text Area Content */}
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ 
                  flex: 1, 
                  width: '100%', 
                  minHeight: '280px',
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  resize: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
                placeholder="Start writing..."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--text-dim)', gap: '12px' }}>
              <FileText size={48} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
              <p>Select a note from the sidebar or create a new note.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
