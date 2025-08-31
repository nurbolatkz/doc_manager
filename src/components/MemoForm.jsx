import React, { useState } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';

const MemoForm = ({ currentUser, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    documentType: '',
    text: '',
    organization: '',
    organizationGuid: '',
    cfo: '',
    cfoGuid: '',
    project: '',
    projectGuid: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState('');

  // Dummy data for demonstration
  const dummyOrganizations = [
    { id: 1, guid: 'org-001', name: 'ООО "Рога и копыта"' },
    { id: 2, guid: 'org-002', name: 'ПАО "Газпром"' },
    { id: 3, guid: 'org-003', name: 'АО "Российские железные дороги"' },
    { id: 4, guid: 'org-004', name: 'ПАО "Сбербанк"' },
    { id: 5, guid: 'org-005', name: 'ОАО "НК "Роснефть"' }
  ];

  const dummyCfo = [
    { id: 1, guid: 'cfo-001', name: 'ЦФО-001 - Центральный офис' },
    { id: 2, guid: 'cfo-002', name: 'ЦФО-002 - Отдел продаж' },
    { id: 3, guid: 'cfo-003', name: 'ЦФО-003 - Производственный отдел' },
    { id: 4, guid: 'cfo-004', name: 'ЦФО-004 - IT отдел' },
    { id: 5, guid: 'cfo-005', name: 'ЦФО-005 - Маркетинг' }
  ];

  const dummyProjects = [
    { id: 1, guid: 'proj-001', name: 'Проект "Альфа" - Разработка нового продукта' },
    { id: 2, guid: 'proj-002', name: 'Проект "Бета" - Внедрение CRM системы' },
    { id: 3, guid: 'proj-003', name: 'Проект "Гамма" - Оптимизация бизнес-процессов' },
    { id: 4, guid: 'proj-004', name: 'Проект "Дельта" - Расширение на новые рынки' },
    { id: 5, guid: 'proj-005', name: 'Проект "Омега" - Повышение клиентской удовлетворенности' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationSearch = (value) => {
    setOrganizationSearchTerm(value);
    // In a real app, this would filter organizations from an API
  };

  const handleOrganizationSelect = (org) => {
    setFormData(prev => ({
      ...prev,
      organization: org.name,
      organizationGuid: org.guid
    }));
    setOrganizationSearchTerm('');
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
      data = dummyCfo;
    } else if (modalType === 'project') {
      data = dummyProjects;
    }
    
    return data.filter(item => 
      item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  };

  const getFilteredOrganizations = () => {
    return dummyOrganizations.filter(org => 
      org.name.toLowerCase().includes(organizationSearchTerm.toLowerCase())
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.documentType) {
      showCustomMessage('Пожалуйста, выберите тип документа', 'danger');
      return;
    }
    
    // In a real app, this would save to the backend
    showCustomMessage('Служебная записка успешно создана!', 'success');
    
    // Call onSave with the form data
    if (onSave) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Вы уверены, что хотите закрыть форму? Все несохраненные данные будут потеряны.')) {
      onBack();
    }
  };

  return (
    <div className="document-detail-container">
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
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="memo-date">Дата Создания:</label>
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
          <div className="form-group">
            <label htmlFor="memo-document-type">Тип Документа:</label>
            <select 
              id="memo-document-type" 
              name="documentType" 
              value={formData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              className="form-control"
            >
              <option value="">-- Выберите тип документа --</option>
              <option value="internal">Внутренний</option>
              <option value="external">Внешний</option>
              <option value="official">Официальное письмо</option>
              <option value="memo">Служебная записка</option>
              <option value="order">Приказ</option>
              <option value="contract">Договор</option>
              <option value="report">Отчёт</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="memo-text">Текст Обращения:</label>
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

          {/* Organization Field with Autocomplete */}
          <div className="form-group">
            <label htmlFor="memo-organization">Организация:</label>
            <div className="autocomplete-container">
              <input 
                type="text" 
                id="memo-organization" 
                name="organization" 
                value={formData.organization}
                onChange={(e) => {
                  handleInputChange('organization', e.target.value);
                  handleOrganizationSearch(e.target.value);
                }}
                className="form-control" 
                placeholder="Начните вводить название организации..."
              />
              {organizationSearchTerm && (
                <div className="autocomplete-suggestions">
                  {getFilteredOrganizations().map(org => (
                    <div 
                      key={org.guid}
                      onClick={() => handleOrganizationSelect(org)}
                      className="autocomplete-item"
                    >
                      {org.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input 
              type="hidden" 
              id="memo-organization-guid" 
              name="organizationGuid" 
              value={formData.organizationGuid}
            />
          </div>

          {/* CFO Field with Modal */}
          <div className="form-group">
            <label htmlFor="memo-cfo">ЦФО (Центр Финансовой Ответственности):</label>
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

          {/* Project Field with Modal */}
          <div className="form-group">
            <label htmlFor="memo-project">Проект:</label>
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
      </div>

      {/* Universal Selection Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
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
                  key={item.guid}
                  onClick={() => handleModalSelect(item)}
                  className="modal-result-item"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoForm;