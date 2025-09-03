import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { 
  fetchOrganizations, 
  fetchProjects, 
  fetchCFOs,
  fetchDocumentTypes,
  apiRequest
} from '../services/fetchManager';
import { showCustomMessage } from '../utils';

const DocumentEdit = ({ document, onBack, onSave, theme }) => {
  const [formData, setFormData] = useState({
    text: '',
    organizationGuid: '',
    cfoGuid: '',
    projectGuid: '',
    cfo: '',
    project: '',
    documentType: '',
    documentTypeGuid: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  // Data for modals
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cfos, setCfos] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingCfos, setLoadingCfos] = useState(false);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);

  // Initialize form data with document data
  useEffect(() => {
    if (document && document.documentType === 'memo') {
      setFormData({
        text: document.message || '',
        organizationGuid: document.organizationGuid || '',
        cfoGuid: document.cfoGuid || '',
        projectGuid: document.projectGuid || '',
        cfo: document.cfo || '',
        project: document.project || '',
        documentType: document.documentType || '',
        documentTypeGuid: document.documentTypeGuid || ''
      });
    }
    
    // Fetch data for modals
    Promise.all([
      fetchOrganizationsForEdit(),
      fetchProjectsForEdit(),
      fetchCFOsForEdit(),
      fetchDocumentTypesForEdit()
    ]);
  }, [document]);

  // Fetch organizations for edit form
  const fetchOrganizationsForEdit = async () => {
    try {
      setLoadingOrganizations(true);
      const token = localStorage.getItem('authToken');
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

  // Fetch projects for edit form
  const fetchProjectsForEdit = async () => {
    try {
      setLoadingProjects(true);
      const token = localStorage.getItem('authToken');
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

  // Fetch CFOs for edit form
  const fetchCFOsForEdit = async () => {
    try {
      setLoadingCfos(true);
      const token = localStorage.getItem('authToken');
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

  // Fetch document types for edit form
  const fetchDocumentTypesForEdit = async () => {
    try {
      setLoadingDocumentTypes(true);
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Prepare request body according to specification
      const requestBody = {
        username: "Администратор",
        token: token,
        documentId: document.id,
        action: "update_document_memo",
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
        showCustomMessage('Служебная записка успешно обновлена!', 'success');
        // Call onSave with the updated document data
        if (onSave) {
          onSave({
            ...document,
            message: formData.text,
            cfoGuid: formData.cfoGuid,
            projectGuid: formData.projectGuid,
            cfo: formData.cfo,
            project: formData.project,
            documentType: document.documentType,
            documentTypeValue: formData.documentType,
            documentTypeGuid: formData.documentTypeGuid,
            organizationGuid: formData.organizationGuid,
            // Preserve the document ID and other important properties
            id: document.id,
            title: document.title,
            date: document.date,
            author: document.author,
            responsible: document.responsible,
            CanEdit: document.CanEdit,
            canApprove: document.canApprove,
            canReject: document.canReject,
            CanSendToRoute: document.CanSendToRoute,
            documentState: document.documentState,
            routeType: document.routeType,
            SubDivsions: document.SubDivsions
          });
        }
        onBack();
      } else {
        const errorMessage = response && response.message ? response.message : 'Неизвестная ошибка при обновлении документа';
        showCustomMessage(errorMessage, 'danger');
      }
    } catch (error) {
      console.error('Error updating memo:', error);
      showCustomMessage('Ошибка при обновлении служебной записки: ' + error.message, 'danger');
    }
  };

  const handleCancel = () => {
    onBack();
  };

  if (!document || document.documentType !== 'memo') {
    return (
      <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className="content-card">
          <div className="card-header">
            <h2>Ошибка</h2>
            <button 
              className="back-button"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left"></i> Назад
            </button>
          </div>
          <p>Невозможно редактировать данный тип документа</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <h2>Редактировать Служебную Записку</h2>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>

      {/* Form */}
      <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Автор:</span>
                <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{document.author || 'Не указано'}</span>
              </div>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
                <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{document.responsible || 'Не указано'}</span>
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
                    const selectedOrg = organizations.find(org => org.guid === e.target.value);
                    handleInputChange('organizationGuid', e.target.value);
                    // Also update the organization name if needed
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

          {/* Form Actions */}
          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i> Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              <i className="fas fa-save"></i> Сохранить
            </button>
          </div>
        </form>
      </div>

      {/* Universal Selection Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
        <div className={`modal-content ${theme?.mode === 'dark' ? 'dark' : 'light'}`}>
          <div className={`modal-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
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
            className={`modal-search-input ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
            placeholder="Поиск..."
            value={modalSearchTerm}
            onChange={(e) => handleModalSearch(e.target.value)}
          />
          <div className="modal-results-list">
            {getFilteredModalData().map(item => (
              <div 
                key={item.guid || item.id}
                onClick={() => handleModalSelect(item)}
                className={`modal-result-item ${theme?.mode === 'dark' ? 'dark' : ''}`}
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

export default DocumentEdit;