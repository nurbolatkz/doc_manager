import React from 'react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay active">
      <div className="confirm-modal">
        <div className="confirm-header">
          <h2 className="confirm-title">{title}</h2>
          <button 
            className="confirm-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="confirm-body">
          <p>{message}</p>
          
          <div className="confirm-buttons">
            <button
              className="confirm-button secondary"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="confirm-button primary"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .confirm-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        .confirm-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          transform: translateY(-20px);
          transition: transform 0.3s ease;
        }
        
        /* Dark theme support */
        body.dark .confirm-modal {
          background: #374151;
        }
        
        .confirm-overlay.active .confirm-modal {
          transform: translateY(0);
        }
        
        .confirm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        /* Dark theme support */
        body.dark .confirm-header {
          border-bottom-color: #4b5563;
        }
        
        .confirm-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          flex: 1;
        }
        
        /* Dark theme support */
        body.dark .confirm-title {
          color: #f9fafb;
        }
        
        .confirm-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        /* Dark theme support */
        body.dark .confirm-close {
          color: #d1d5db;
        }
        
        .confirm-close:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        /* Dark theme support */
        body.dark .confirm-close:hover {
          background: #4b5563;
          color: #f9fafb;
        }
        
        .confirm-body {
          padding: 24px;
        }
        
        .confirm-body p {
          color: #374151;
          margin: 0 0 24px 0;
        }
        
        /* Dark theme support */
        body.dark .confirm-body p {
          color: #d1d5db;
        }
        
        .confirm-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        /* Dark theme support */
        body.dark .confirm-buttons {
          border-top-color: #4b5563;
        }
        
        .confirm-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .confirm-button.primary {
          background: #3b82f6;
          color: white;
        }
        
        .confirm-button.primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }
        
        .confirm-button.secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        /* Dark theme support */
        body.dark .confirm-button.secondary {
          background: #4b5563;
          color: #f9fafb;
        }
        
        .confirm-button.secondary:hover {
          background: #e5e7eb;
        }
        
        /* Dark theme support */
        body.dark .confirm-button.secondary:hover {
          background: #6b7280;
        }
        
        @media (max-width: 640px) {
          .confirm-modal {
            margin: 0;
            border-radius: 16px 16px 0 0;
            max-height: 95vh;
          }
          
          .confirm-buttons {
            flex-direction: column;
          }
          
          .confirm-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;