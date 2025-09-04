import React from 'react';
import './Dashboard_Restructured.css';

const MemoEdit = ({ formData, handleInputChange, theme, documentTypes, loadingDocumentTypes, organizations, loadingOrganizations, cfos, projects, openModal }) => {
  return (
    <div className="info-grid">
      <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className="detail-item">
          <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Автор:</span>
          <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>Администратор</span>
        </div>
        <div className="detail-item">
          <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
          <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>Администратор</span>
        </div>
      </div>
      
      {/* Document Type Field */}
      <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Тип Документа:</label>
          <select 
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
            value={formData.documentType}
            onChange={(e) => handleInputChange('documentType', e.target.value)}
            disabled={loadingDocumentTypes}
          >
            <option value="">-- Выберите тип документа --</option>
            {documentTypes.map((type) => (
              <option key={type.guid} value={type.guid}>
                {type.name}
              </option>
            ))}
          </select>
          {loadingDocumentTypes && (
            <div className="loading-indicator">
              <i className="fas fa-spinner fa-spin"></i> Загрузка типов документов...
            </div>
          )}
        </div>
        
        {/* Organization Field */}
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Организация:</label>
          <select 
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
            value={formData.organizationGuid}
            onChange={(e) => {
              handleInputChange('organizationGuid', e.target.value);
            }}
            disabled={loadingOrganizations}
          >
            <option value="">-- Выберите организацию --</option>
            {organizations.map((org) => (
              <option key={org.guid} value={org.guid}>
                {org.name}
              </option>
            ))}
          </select>
          {loadingOrganizations && (
            <div className="loading-indicator">
              <i className="fas fa-spinner fa-spin"></i> Загрузка организаций...
            </div>
          )}
        </div>
      </div>
      
      {/* CFO Field with Modal */}
      <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>ЦФО (Центр Финансовой Ответственности):</label>
          <div className="input-with-button">
            <input 
              type="text" 
              className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
              value={formData.cfo || ''}
              readOnly
              placeholder="Выберите ЦФО..."
            />
            <button 
              type="button" 
              className="search-button"
              onClick={() => openModal('cfo')}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          <input 
            type="hidden" 
            name="cfoGuid" 
            value={formData.cfoGuid || ''}
          />
        </div>
        
        {/* Project Field with Modal */}
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект:</label>
          <div className="input-with-button">
            <input 
              type="text" 
              className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
              value={formData.project || ''}
              readOnly
              placeholder="Выберите Проект..."
            />
            <button 
              type="button" 
              className="search-button"
              onClick={() => openModal('project')}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          <input 
            type="hidden" 
            name="projectGuid" 
            value={formData.projectGuid || ''}
          />
        </div>
      </div>
      
      <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Сообщение:</label>
          <textarea
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
            value={formData.text || ''}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Введите сообщение"
            rows="6"
          />
        </div>
      </div>
    </div>
  );
};

export default MemoEdit;