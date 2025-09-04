import React from 'react';
import './Dashboard_Restructured.css';

const MemoEdit = ({ 
  formData, 
  handleInputChange, 
  theme, 
  documentTypes, 
  loadingDocumentTypes, 
  organizations, 
  loadingOrganizations, 
  cfos, 
  projects, 
  openModal,
  handleFileUpload,
  uploadedFiles,
  removeFile,
  formatFileSize,
  existingAttachments,
  loadingAttachments
}) => {
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

      {/* File Upload Section */}
      <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
        <div className="detail-item">
          <label className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Прикрепленные файлы:</label>
          
          {/* Loading indicator for attachments */}
          {loadingAttachments && (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-2xl"></i>
              <p>Загрузка вложений...</p>
            </div>
          )}
          
          {/* Existing attachments */}
          {!loadingAttachments && existingAttachments && existingAttachments.length > 0 && (
            <div className="existing-files-table mb-4">
              <h4>Существующие вложения:</h4>
              <table className={`table table-bordered ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Имя файла</th>
                    <th>Дата загрузки</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {existingAttachments.map((attachment) => (
                    <tr key={attachment.id}>
                      <td>{attachment.name}</td>
                      <td>{attachment.uploadDate ? new Date(attachment.uploadDate).toLocaleDateString('ru-RU') : '-'}</td>
                      <td>
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFile(attachment.id)}
                        >
                          <i className="fas fa-trash"></i> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* File upload input */}
          <div className="file-upload-container">
            <input 
              type="file" 
              id="file-upload" 
              className="file-input"
              onChange={handleFileUpload}
              multiple
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <i className="fas fa-cloud-upload-alt"></i> Выберите файлы или перетащите их сюда
            </label>
          </div>
          
          {/* Newly uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-table mt-4">
              <h4>Новые вложения:</h4>
              <table className={`table table-bordered ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Имя файла</th>
                    <th>Размер</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file) => (
                    <tr key={file.id}>
                      <td>{file.name}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <i className="fas fa-trash"></i> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* No attachments message */}
          {!loadingAttachments && (!existingAttachments || existingAttachments.length === 0) && uploadedFiles.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <i className="fas fa-paperclip text-2xl mb-2"></i>
              <p>Нет прикрепленных файлов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoEdit;