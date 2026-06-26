import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle clicking on backdrop to close
  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Handle Esc key
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <dialog 
      ref={dialogRef} 
      onClick={handleClick}
      onCancel={handleCancel}
      className="settings-dialog" // Keep original styling class
      style={{ overflow: 'hidden' }}
    >
      <div className="modal-content" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {children}
        </div>
      </div>
    </dialog>
  );
}
