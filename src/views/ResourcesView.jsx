import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Plus, Trash2, ExternalLink, Bookmark, Video, FileText, Globe, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';

export default function ResourcesView() {
  const { config, addResource, deleteResource } = useAppState();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Website');
  const [newDescription, setNewDescription] = useState('');

  const [activeFilter, setActiveFilter] = useState('all');

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    addResource(newTitle.trim(), formattedUrl, newCategory, newDescription.trim());
    
    // Reset Form
    setNewTitle('');
    setNewUrl('');
    setNewCategory('Website');
    setNewDescription('');
    setIsAddOpen(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Video':
        return <Video size={16} />;
      case 'PDF':
        return <FileText size={16} />;
      case 'Book':
        return <BookOpen size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Video': return 'var(--red)';
      case 'PDF': return 'var(--teal)';
      case 'Book': return 'var(--orange)';
      default: return 'var(--blue)';
    }
  };

  const categories = ['all', 'Video', 'PDF', 'Book', 'Website'];

  const filteredResources = activeFilter === 'all' 
    ? config.resources 
    : config.resources.filter(r => r.category === activeFilter);

  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grimoire Resources</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keep track of websites, videos, PDFs, and books that enhance your research.</p>
        </div>
        <button className="btn-add" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="card card-animate" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filters:</strong>
          {categories.map((c) => (
            <button 
              key={c}
              onClick={() => setActiveFilter(c)}
              className={`timer-mode-btn ${activeFilter === c ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            >
              {c === 'all' ? 'All Types' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Resources grid */}
      <div className="grid-2">
        {filteredResources.map((res) => {
          const color = getCategoryColor(res.category);
          return (
            <div 
              key={res.id} 
              className="card card-animate" 
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '0.7rem', 
                      color, 
                      background: `${color}15`, 
                      padding: '4px 10px', 
                      borderRadius: '100px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {getCategoryIcon(res.category)}
                    <span>{res.category}</span>
                  </span>
                  
                  <button 
                    onClick={() => deleteResource(res.id)}
                    className="modal-close" 
                    style={{ width: '28px', height: '28px', backgroundColor: 'transparent', color: 'var(--text-dim)' }}
                    title="Delete resource"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {res.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {res.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="section-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--purple-400)', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Visit Resource Link
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Resource Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Resource">
        <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Resource Title</label>
            <input 
              className="form-input" 
              type="text" 
              placeholder="e.g. MIT Linear Algebra course"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Resource URL</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g. youtube.com/watch?..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ width: '130px', marginBottom: 0 }}>
              <label className="form-label">Type</label>
              <select 
                className="form-input" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Website">Website</option>
                <option value="Video">Video</option>
                <option value="PDF">PDF</option>
                <option value="Book">Book</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description (Optional)</label>
            <textarea 
              className="form-input" 
              rows="3"
              placeholder="Provide a quick overview of why this resource is useful..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
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
            Create Resource
          </button>
        </form>
      </Modal>
    </main>
  );
}
