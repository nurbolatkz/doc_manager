import React, { useState } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';

const ExpenditureForm = ({ currentUser, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    currency: 'KZT',
    amount: '',
    paymentForm: 'Наличные',
    operationType: 'Возврат денежных средств покупателю',
    organization: '',
    organizationGuid: '',
    purposeText: '',
    ddsArticle: '',
    ddsArticleGuid: '',
    budgetArticle: '',
    budgetArticleGuid: '',
    project: '',
    projectGuid: '',
    cfo: '',
    cfoGuid: '',
    counterparty: '',
    counterpartyGuid: '',
    contract: '',
    contractGuid: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // Dummy data for demonstration
  const dummyOrganizations = [
    { id: 1, guid: 'org-001', name: 'ООО "Рога и копыта"' },
    { id: 2, guid: 'org-002', name: 'ПАО "Газпром"' },
    { id: 3, guid: 'org-003', name: 'АО "Российские железные дороги"' },
    { id: 4, guid: 'org-004', name: 'ПАО "Сбербанк"' },
    { id: 5, guid: 'org-005', name: 'ОАО "НК "Роснефть"' }
  ];

  const dummyDdsArticles = [
    { id: 1, guid: 'dds-001', name: 'Статья ДДС 1' },
    { id: 2, guid: 'dds-002', name: 'Статья ДДС 2' },
    { id: 3, guid: 'dds-003', name: 'Статья ДДС 3' }
  ];

  const dummyBudgetArticles = [
    { id: 1, guid: 'budget-001', name: 'Статья Бюджета 1' },
    { id: 2, guid: 'budget-002', name: 'Статья Бюджета 2' },
    { id: 3, guid: 'budget-003', name: 'Статья Бюджета 3' }
  ];

  const dummyProjects = [
    { id: 1, guid: 'proj-001', name: 'Проект "Альфа"' },
    { id: 2, guid: 'proj-002', name: 'Проект "Бета"' },
    { id: 3, guid: 'proj-003', name: 'Проект "Гамма"' }
  ];

  const dummyCfos = [
    { id: 1, guid: 'cfo-001', name: 'ЦФО-001 - Центральный офис' },
    { id: 2, guid: 'cfo-002', name: 'ЦФО-002 - Отдел продаж' },
    { id: 3, guid: 'cfo-003', name: 'ЦФО-003 - Производственный отдел' }
  ];

  const dummyCounterparties = [
    { id: 1, guid: 'counter-001', name: 'Контрагент 1' },
    { id: 2, guid: 'counter-002', name: 'Контрагент 2' },
    { id: 3, guid: 'counter-003', name: 'Контрагент 3' }
  ];

  const dummyContracts = [
    { id: 1, guid: 'contract-001', name: 'Договор 1' },
    { id: 2, guid: 'contract-002', name: 'Договор 2' },
    { id: 3, guid: 'contract-003', name: 'Договор 3' }
  ];

  const operationTypes = [
    'Возврат денежных средств покупателю',
    'Выдача денежных средств подотчетнику',
    'Перечисление заработной платы',
    'Перечисление налога',
    'Перечисление НДС с изменённым сроком уплаты',
    'Перечисление пенсионных взносов',
    'Перечисление по исполнительным листам',
    'Перечисление социальных отчислений',
    'Прочие расчёты с контрагентами',
    'Расчёты по кредитам и займам с работниками',
    'Прочий расход денежных средств',
    'Расчёты по кредитам и займам с контрагентами',
    'Расчёты по доходу от разовых выплат с контрагентами',
    'Оплата структурному подразделению',
    'Перевод на другой счёт',
    'Оплата поставщику'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Enable contract field when counterparty is selected
    if (field === 'counterparty' && value) {
      const contractField = document.getElementById('expenditure-contract');
      const contractButton = document.getElementById('open-contract-modal');
      if (contractField && contractButton) {
        contractField.disabled = false;
        contractButton.disabled = false;
      }
    } else if (field === 'counterparty' && !value) {
      // Disable contract field when counterparty is cleared
      setFormData(prev => ({ ...prev, contract: '', contractGuid: '' }));
      const contractField = document.getElementById('expenditure-contract');
      const contractButton = document.getElementById('open-contract-modal');
      if (contractField && contractButton) {
        contractField.disabled = true;
        contractButton.disabled = true;
      }
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
    switch (modalType) {
      case 'organization':
        setFormData(prev => ({
          ...prev,
          organization: item.name,
          organizationGuid: item.guid
        }));
        break;
      case 'ddsArticle':
        setFormData(prev => ({
          ...prev,
          ddsArticle: item.name,
          ddsArticleGuid: item.guid
        }));
        break;
      case 'budgetArticle':
        setFormData(prev => ({
          ...prev,
          budgetArticle: item.name,
          budgetArticleGuid: item.guid
        }));
        break;
      case 'project':
        setFormData(prev => ({
          ...prev,
          project: item.name,
          projectGuid: item.guid
        }));
        break;
      case 'cfo':
        setFormData(prev => ({
          ...prev,
          cfo: item.name,
          cfoGuid: item.guid
        }));
        break;
      case 'counterparty':
        setFormData(prev => ({
          ...prev,
          counterparty: item.name,
          counterpartyGuid: item.guid
        }));
        break;
      case 'contract':
        setFormData(prev => ({
          ...prev,
          contract: item.name,
          contractGuid: item.guid
        }));
        break;
      default:
        break;
    }
    closeModal();
  };

  const getFilteredModalData = () => {
    let data = [];
    switch (modalType) {
      case 'organization':
        data = dummyOrganizations;
        break;
      case 'ddsArticle':
        data = dummyDdsArticles;
        break;
      case 'budgetArticle':
        data = dummyBudgetArticles;
        break;
      case 'project':
        data = dummyProjects;
        break;
      case 'cfo':
        data = dummyCfos;
        break;
      case 'counterparty':
        data = dummyCounterparties;
        break;
      case 'contract':
        data = dummyContracts;
        break;
      default:
        data = [];
    }
    
    return data.filter(item => 
      item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date().toLocaleDateString('ru-RU'),
      file: file // Store the actual file object
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.amount) {
      showCustomMessage('Пожалуйста, укажите сумму', 'danger');
      return;
    }
    
    if (!formData.organization) {
      showCustomMessage('Пожалуйста, выберите организацию', 'danger');
      return;
    }
    
    // In a real app, this would save to the backend
    showCustomMessage('Заявка на расходы успешно создана!', 'success');
    
    // Call onSave with the form data
    if (onSave) {
      onSave({ ...formData, attachments: uploadedFiles });
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
          <div>
            <h2>Создать Заявку на Расходы</h2>
            <p className="text-muted">Форма для оформления заявки на расход денежных средств</p>
          </div>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-section-title">Основные данные</div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="expenditure-date">Дата Расхода</label>
                <input 
                  type="date" 
                  id="expenditure-date" 
                  name="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-currency">Валюта</label>
                <select 
                  id="expenditure-currency" 
                  name="currency" 
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="form-control"
                >
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-amount">Сумма</label>
                <input 
                  type="number" 
                  id="expenditure-amount" 
                  name="amount" 
                  placeholder="0.00" 
                  step="0.01" 
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-payment-form">Форма Оплаты</label>
                <select 
                  id="expenditure-payment-form" 
                  name="paymentForm" 
                  value={formData.paymentForm}
                  onChange={(e) => handleInputChange('paymentForm', e.target.value)}
                  className="form-control"
                >
                  <option value="Наличные">Наличные</option>
                  <option value="Безналичные">Безналичные</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-operation-type">Вид Операции</label>
                <select 
                  id="expenditure-operation-type" 
                  name="operationType" 
                  value={formData.operationType}
                  onChange={(e) => handleInputChange('operationType', e.target.value)}
                  className="form-control"
                >
                  {operationTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-organization">Организация</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-organization" 
                    name="organization" 
                    placeholder="Выберите организацию" 
                    readOnly
                    value={formData.organization}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    id="open-organization-modal" 
                    className="search-button"
                    onClick={() => openModal('organization')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="expenditure-organization-guid" 
                  name="organizationGuid" 
                  value={formData.organizationGuid}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="expenditure-purpose-text">Назначение Расхода</label>
              <textarea 
                id="expenditure-purpose-text" 
                name="purposeText" 
                placeholder="Подробное описание назначения расхода..."
                value={formData.purposeText}
                onChange={(e) => handleInputChange('purposeText', e.target.value)}
                className="form-control"
                rows="4"
              />
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="form-section">
            <div className="form-section-title">Финансовые реквизиты</div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="expenditure-dds-article">Статья ДДС</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-dds-article" 
                    name="ddsArticle" 
                    placeholder="Выберите статью ДДС" 
                    readOnly
                    value={formData.ddsArticle}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    id="open-dds-article-modal" 
                    className="search-button"
                    onClick={() => openModal('ddsArticle')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="expenditure-dds-article-guid" 
                  name="ddsArticleGuid" 
                  value={formData.ddsArticleGuid}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-budget-article">Статья Бюджета</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-budget-article" 
                    name="budgetArticle" 
                    placeholder="Выберите статью бюджета" 
                    readOnly
                    value={formData.budgetArticle}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    id="open-budget-article-modal" 
                    className="search-button"
                    onClick={() => openModal('budgetArticle')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="expenditure-budget-article-guid" 
                  name="budgetArticleGuid" 
                  value={formData.budgetArticleGuid}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-project">Проект</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-project" 
                    name="project" 
                    placeholder="Выберите проект" 
                    readOnly
                    value={formData.project}
                    className="form-control"
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
                  id="expenditure-project-guid" 
                  name="projectGuid" 
                  value={formData.projectGuid}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-cfo">ЦФО</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-cfo" 
                    name="cfo" 
                    placeholder="Выберите ЦФО" 
                    readOnly
                    value={formData.cfo}
                    className="form-control"
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
                  id="expenditure-cfo-guid" 
                  name="cfoGuid" 
                  value={formData.cfoGuid}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-counterparty">Контрагент</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-counterparty" 
                    name="counterparty" 
                    placeholder="Выберите контрагента" 
                    readOnly
                    value={formData.counterparty}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    id="open-counterparty-modal" 
                    className="search-button"
                    onClick={() => openModal('counterparty')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="expenditure-counterparty-guid" 
                  name="counterpartyGuid" 
                  value={formData.counterpartyGuid}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expenditure-contract">Договор</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-contract" 
                    name="contract" 
                    placeholder="Выберите договор" 
                    readOnly
                    disabled={!formData.counterparty}
                    value={formData.contract}
                    className="form-control"
                  />
                  <button 
                    type="button" 
                    id="open-contract-modal" 
                    className="search-button"
                    disabled={!formData.counterparty}
                    onClick={() => openModal('contract')}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="expenditure-contract-guid" 
                  name="contractGuid" 
                  value={formData.contractGuid}
                />
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="form-section">
            <div className="form-section-title">Прикрепленные документы</div>
            <div className="file-upload-section">
              <input 
                type="file" 
                id="file-input" 
                multiple 
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-input" className="btn btn-secondary">
                <i className="fas fa-upload"></i> Выбрать файлы
              </label>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Поддерживаемые форматы: PDF, JPG, PNG, DOC, XLS (макс. 10MB)
              </p>
              <div className="uploaded-files-table-container mt-4">
                <table className="uploaded-files-table">
                  <thead>
                    <tr>
                      <th>Имя файла</th>
                      <th>Размер</th>
                      <th>Дата загрузки</th>
                      <th style={{ width: '160px' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody id="uploaded-files-table-body">
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.map(file => (
                        <tr key={file.id}>
                          <td>{file.name}</td>
                          <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                          <td>{file.date}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-600)' }}>
                          Нет прикрепленных файлов
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="action-buttons">
            <button 
              type="button" 
              id="close-expenditure-button" 
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i> Закрыть
            </button>
            <button 
              type="submit" 
              id="save-expenditure-button" 
              className="btn btn-primary"
            >
              <i className="fas fa-save"></i> Сохранить заявку
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
                {modalType === 'organization' ? 'Выбрать организацию' :
                 modalType === 'ddsArticle' ? 'Выбрать статью ДДС' :
                 modalType === 'budgetArticle' ? 'Выбрать статью бюджета' :
                 modalType === 'project' ? 'Выбрать проект' :
                 modalType === 'cfo' ? 'Выбрать ЦФО' :
                 modalType === 'counterparty' ? 'Выбрать контрагента' :
                 modalType === 'contract' ? 'Выбрать договор' : 'Выбрать элемент'}
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

export default ExpenditureForm;