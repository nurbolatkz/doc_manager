import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';
import { fetchDocumentTypes, fetchOrganizations, fetchProjects, fetchCFOs, apiRequest } from '../services/fetchManager';

const MemoForm = ({ currentUser, onBack, onSave, theme }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    documentType: '',
    documentTypeGuid:'',
    text: '',
    organization: '', // Organization name
    organizationGuid: '', // Organization GUID
    cfo: '',
    cfoGuid: '',
    project: '',
    projectGuid: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [cfos, setCfos] = useState([]);
  const [loadingCfos, setLoadingCfos] = useState(true);

  // Fetch document types from API
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
        const response = await fetchDocumentTypes(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          setDocumentTypes(response.data);
        } else {
          // Fallback to default options if API doesn't return expected data
          setDocumentTypes([
            { name: 'Внутренний', guid: 'internal' },
            { name: 'Внешний', guid: 'external' },
            { name: 'Официальное письмо', guid: 'official' },
            { name: 'Служебная записка', guid: 'memo' },
            { name: 'Приказ', guid: 'order' },
            { name: 'Договор', guid: 'contract' },
            { name: 'Отчёт', guid: 'report' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching document types:', err);
        // Fallback to default options on error
        setDocumentTypes([
          { name: 'Внутренний', guid: 'internal' },
          { name: 'Внешний', guid: 'external' },
          { name: 'Официальное письмо', guid: 'official' },
          { name: 'Служебная записка', guid: 'memo' },
          { name: 'Приказ', guid: 'order' },
          { name: 'Договор', guid: 'contract' },
          { name: 'Отчёт', guid: 'report' }
        ]);
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    loadDocumentTypes();
  }, []);

  // Fetch organizations from API
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoadingOrganizations(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
        const response = await fetchOrganizations(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Map the API response to match the expected format (guid -> id, GUID -> guid)
          const formattedOrganizations = response.data.map(org => ({
            id: org.guid || org.GUID,
            guid: org.GUID || org.guid,
            name: org.name
          }));
          setOrganizations(formattedOrganizations);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setOrganizations([
            { id: 1, guid: 'org-001', name: 'ООО "Рога и копыта"' },
            { id: 2, guid: 'org-002', name: 'ПАО "Газпром"' },
            { id: 3, guid: 'org-003', name: 'АО "Российские железные дороги"' },
            { id: 4, guid: 'org-004', name: 'ПАО "Сбербанк"' },
            { id: 5, guid: 'org-005', name: 'ОАО "НК "Роснефть"' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        // Fallback to dummy data on error
        setOrganizations([
          { id: 1, guid: 'org-001', name: 'ООО "Рога и копыта"' },
          { id: 2, guid: 'org-002', name: 'ПАО "Газпром"' },
          { id: 3, guid: 'org-003', name: 'АО "Российские железные дороги"' },
          { id: 4, guid: 'org-004', name: 'ПАО "Сбербанк"' },
          { id: 5, guid: 'org-005', name: 'ОАО "НК "Роснефть"' }
        ]);
      } finally {
        setLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
        const response = await fetchProjects(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setProjects([
            { id: 1, guid: 'proj-001', name: 'Проект "Альфа" - Разработка нового продукта' },
            { id: 2, guid: 'proj-002', name: 'Проект "Бета" - Внедрение CRM системы' },
            { id: 3, guid: 'proj-003', name: 'Проект "Гамма" - Оптимизация бизнес-процессов' },
            { id: 4, guid: 'proj-004', name: 'Проект "Дельта" - Расширение на новые рынки' },
            { id: 5, guid: 'proj-005', name: 'Проект "Омега" - Повышение клиентской удовлетворенности' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Fallback to dummy data on error
        setProjects([
          { id: 1, guid: 'proj-001', name: 'Проект "Альфа" - Разработка нового продукта' },
          { id: 2, guid: 'proj-002', name: 'Проект "Бета" - Внедрение CRM системы' },
          { id: 3, guid: 'proj-003', name: 'Проект "Гамма" - Оптимизация бизнес-процессов' },
          { id: 4, guid: 'proj-004', name: 'Проект "Дельта" - Расширение на новые рынки' },
          { id: 5, guid: 'proj-005', name: 'Проект "Омега" - Повышение клиентской удовлетворенности' }
        ]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Fetch CFOs from API
  useEffect(() => {
    const loadCFOs = async () => {
      try {
        setLoadingCfos(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
        const response = await fetchCFOs(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          setCfos(response.data);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setCfos([
            { id: 1, guid: 'cfo-001', name: 'ЦФО-001 - Центральный офис' },
            { id: 2, guid: 'cfo-002', name: 'ЦФО-002 - Отдел продаж' },
            { id: 3, guid: 'cfo-003', name: 'ЦФО-003 - Производственный отдел' },
            { id: 4, guid: 'cfo-004', name: 'ЦФО-004 - IT отдел' },
            { id: 5, guid: 'cfo-005', name: 'ЦФО-005 - Маркетинг' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching CFOs:', err);
        // Fallback to dummy data on error
        setCfos([
          { id: 1, guid: 'cfo-001', name: 'ЦФО-001 - Центральный офис' },
          { id: 2, guid: 'cfo-002', name: 'ЦФО-002 - Отдел продаж' },
          { id: 3, guid: 'cfo-003', name: 'ЦФО-003 - Производственный отдел' },
          { id: 4, guid: 'cfo-004', name: 'ЦФО-004 - IT отдел' },
          { id: 5, guid: 'cfo-005', name: 'ЦФО-005 - Маркетинг' }
        ]);
      } finally {
        setLoadingCfos(false);
      }
    };

    loadCFOs();
  }, []);

  const handleInputChange = (field, value) => {
    // Handle document type GUID when document type is selected
    if (field === 'documentType') {
      if (value) {
        const selectedDocType = documentTypes.find(type => type.guid === value);
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          documentTypeGuid: selectedDocType ? selectedDocType.guid : value
        }));
      } else {
        // Clear document type GUID when document type is cleared
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          documentTypeGuid: ''
        }));
      }
    } else {
      // Handle all other fields normally
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openModal = (type) => {
    setModalType(type);
    setModalSearchTerm('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setModalSearchTerm('');
  };

  const handleModalSearch = (value) => {
    setModalSearchTerm(value);
  };

  const handleModalSelect = (item) => {
    if (modalType === 'cfo') {
      setFormData(prev => ({
        ...prev,
        cfo: item.name,
        cfoGuid: item.guid
      }));
    } else if (modalType === 'project') {
      setFormData(prev => ({
        ...prev,
        project: item.name,
        projectGuid: item.guid
      }));
    }
    closeModal();
  };

  const getFilteredModalData = () => {
    let data = [];
    if (modalType === 'cfo') {
      data = cfos;
    } else if (modalType === 'project') {
      data = projects;
    }
    
    return data.filter(item => 
      item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.documentType) {
      showCustomMessage('Пожалуйста, выберите тип документа', 'danger');
      return;
    }
    
    if (!formData.text) {
      showCustomMessage('Пожалуйста, введите текст обращения', 'danger');
      return;
    }
    
    if (!formData.organizationGuid) {
      showCustomMessage('Пожалуйста, выберите организацию', 'danger');
      return;
    }
    
    if (!formData.cfoGuid) {
      showCustomMessage('Пожалуйста, выберите ЦФО', 'danger');
      return;
    }
    
    if (!formData.projectGuid) {
      showCustomMessage('Пожалуйста, выберите проект', 'danger');
      return;
    }
    
    try {
      // Get auth token
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Prepare request body according to specification
      const requestBody = {
        username: "Администратор",
        token: token,
        action: "save_document_memo",
        type: "memo",
        documentTypeGuid: formData.documentTypeGuid,
        projectGuid: formData.projectGuid,
        organizationGuid: formData.organizationGuid,
        cfoGuid: formData.cfoGuid,
        text: formData.text
      };
      
      // Send request to backend
      const response = await apiRequest("register_document_action", requestBody, token);
      
      if (response && response.success === 1) {
        showCustomMessage('Служебная записка успешно создана!', 'success');
        // Call onSave with the form data and created document ID
        if (onSave) {
          onSave(formData, response.guid);
        }
        // Close the form after successful submission
        onBack();
      } else {
        const errorMessage = response && response.message ? response.message : 'Неизвестная ошибка при создании документа';
        showCustomMessage(errorMessage, 'danger');
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      showCustomMessage('Ошибка при создании служебной записки: ' + error.message, 'danger');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Вы уверены, что хотите закрыть форму? Все несохраненные данные будут потеряны.')) {
      onBack();
    }
  };

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <h2>Создать Служебную Записку</h2>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>

      {/* Success/Error Message Box */}
      {/* This will be handled by showCustomMessage */}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-info-circle"></i>
            Основная информация
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              {/* Date Field */}
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Дата Создания:</span>
                <input 
                  type="date" 
                  id="memo-date" 
                  name="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="form-control"
                />
              </div>
              
              {/* Document Type Field */}
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Тип Документа:</span>
                <select 
                  id="memo-document-type" 
                  name="documentType" 
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className="form-control"
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
            </div>
            
            {/* Document Type and Organization Section */}
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Организация:</span>
                <select 
                  id="memo-organization" 
                  name="organization" 
                  value={formData.organizationGuid}
                  onChange={(e) => {
                    const selectedOrg = organizations.find(org => org.guid === e.target.value);
                    handleInputChange('organizationGuid', e.target.value);
                    handleInputChange('organization', selectedOrg ? selectedOrg.name : '');
                  }}
                  className="form-control"
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
                <input 
                  type="hidden" 
                  id="memo-organization-name" 
                  name="organization" 
                  value={formData.organization}
                />
              </div>
            </div>
            
            {/* CFO and Project Section */}
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>ЦФО (Центр Финансовой Ответственности):</span>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="memo-cfo" 
                    name="cfo" 
                    value={formData.cfo}
                    readOnly
                    className="form-control" 
                    placeholder="Выберите ЦФО..."
                  />
                  <button 
                    type="button" 
                    id="open-cfo-modal" 
                    className="search-button"
                    onClick={() => openModal('cfo')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="memo-cfo-guid" 
                  name="cfoGuid" 
                  value={formData.cfoGuid}
                />
              </div>
              
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект:</span>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="memo-project" 
                    name="project" 
                    value={formData.project}
                    readOnly
                    className="form-control" 
                    placeholder="Выберите Проект..."
                  />
                  <button 
                    type="button" 
                    id="open-project-modal" 
                    className="search-button"
                    onClick={() => openModal('project')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="memo-project-guid" 
                  name="projectGuid" 
                  value={formData.projectGuid}
                />
              </div>
            </div>
            
            {/* Message Section */}
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Текст Обращения:</span>
                <textarea 
                  id="memo-text" 
                  name="text" 
                  value={formData.text}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  className="form-control" 
                  placeholder="Введите основной текст служебной записки..."
                  rows="6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-paperclip"></i>
            Прикрепленные файлы
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Файлы:</span>
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
                
                {uploadedFiles.length > 0 && (
                  <div className="table-container">
                    <table className="payment-table">
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
                            <td>
                              <div className="file-info">
                                <i className="fas fa-file file-icon"></i>
                                <span className="filename-text" title={file.name}>{file.name}</span>
                              </div>
                            </td>
                            <td>{formatFileSize(file.size)}</td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm"
                                onClick={() => removeFile(file.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="action-buttons">
          <button 
            type="button" 
            id="close-memo-button" 
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            <i className="fas fa-times"></i> Закрыть
          </button>
          <button 
            type="submit" 
            id="save-memo-button" 
            className="btn btn-primary"
          >
            <i className="fas fa-save"></i> Сохранить
          </button>
        </div>
      </form>

      {/* Universal Selection Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {modalType === 'cfo' ? 'Выбрать ЦФО' : 
               modalType === 'project' ? 'Выбрать Проект' : 'Выбрать элемент'}
            </h3>
            <button 
              type="button" 
              className="modal-close-button"
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
          <input 
            type="text" 
            className="modal-search-input" 
            placeholder="Поиск..."
            value={modalSearchTerm}
            onChange={(e) => handleModalSearch(e.target.value)}
          />
          <div className="modal-results-list">
            {getFilteredModalData().map(item => (
              <div 
                key={item.guid || item.id}
                onClick={() => handleModalSelect(item)}
                className="modal-result-item"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoForm;