import React, { useState } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';

const ExpenditureForm = ({ currentUser, onBack, onSave, theme }) => {
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
        break;
    }
    
    return data.filter(item => 
      item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
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
    
    if (!formData.counterparty) {
      showCustomMessage('Пожалуйста, выберите контрагента', 'danger');
      return;
    }
    
    // In a real app, this would save to the backend
    showCustomMessage('Заявка на расходы успешно создана!', 'success');
    
    // Call onSave with the form data
    if (onSave) {
      onSave({ ...formData, files: uploadedFiles });
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
          <h2>Создать Заявку на Расходы</h2>
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expenditure-date">Дата Создания:</label>
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
              <label htmlFor="expenditure-currency">Валюта:</label>
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
              <label htmlFor="expenditure-amount">Сумма:</label>
              <input 
                type="number" 
                id="expenditure-amount" 
                name="amount" 
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="form-control" 
                placeholder="Введите сумму..."
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="expenditure-payment-form">Форма Оплаты:</label>
            <select 
              id="expenditure-payment-form" 
              name="paymentForm" 
              value={formData.paymentForm}
              onChange={(e) => handleInputChange('paymentForm', e.target.value)}
              className="form-control"
            >
              <option value="Наличные">Наличные</option>
              <option value="Безналичный расчет">Безналичный расчет</option>
              <option value="Электронные деньги">Электронные деньги</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expenditure-operation-type">Тип Операции:</label>
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
            <label htmlFor="expenditure-organization">Организация:</label>
            <div className="input-with-button">
              <input 
                type="text" 
                id="expenditure-organization" 
                name="organization" 
                value={formData.organization}
                readOnly
                className="form-control" 
                placeholder="Выберите Организацию..."
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

          <div className="form-group">
            <label htmlFor="expenditure-purpose-text">Назначение Платежа:</label>
            <textarea 
              id="expenditure-purpose-text" 
              name="purposeText" 
              value={formData.purposeText}
              onChange={(e) => handleInputChange('purposeText', e.target.value)}
              className="form-control" 
              placeholder="Введите назначение платежа..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expenditure-dds-article">Статья ДДС:</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  id="expenditure-dds-article" 
                  name="ddsArticle" 
                  value={formData.ddsArticle}
                  readOnly
                  className="form-control" 
                  placeholder="Выберите Статью ДДС..."
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
              <label htmlFor="expenditure-budget-article">Статья Бюджета:</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  id="expenditure-budget-article" 
                  name="budgetArticle" 
                  value={formData.budgetArticle}
                  readOnly
                  className="form-control" 
                  placeholder="Выберите Статью Бюджета..."
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
          </div>

          <div className="form-group">
            <label htmlFor="expenditure-project">Проект:</label>
            <div className="input-with-button">
              <input 
                type="text" 
                id="expenditure-project" 
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
              id="expenditure-project-guid" 
              name="projectGuid" 
              value={formData.projectGuid}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expenditure-cfo">ЦФО (Центр Финансовой Ответственности):</label>
            <div className="input-with-button">
              <input 
                type="text" 
                id="expenditure-cfo" 
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
              id="expenditure-cfo-guid" 
              name="cfoGuid" 
              value={formData.cfoGuid}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expenditure-counterparty">Контрагент:</label>
            <div className="input-with-button">
              <input 
                type="text" 
                id="expenditure-counterparty" 
                name="counterparty" 
                value={formData.counterparty}
                readOnly
                className="form-control" 
                placeholder="Выберите Контрагента..."
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
            <label htmlFor="expenditure-contract">Договор:</label>
            <div className="input-with-button">
              <input 
                type="text" 
                id="expenditure-contract" 
                name="contract" 
                value={formData.contract}
                readOnly
                className="form-control" 
                placeholder="Выберите Договор..."
                disabled={!formData.counterparty}
              />
              <button 
                type="button" 
                id="open-contract-modal" 
                className="search-button"
                onClick={() => openModal('contract')}
                disabled={!formData.counterparty}
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

          {/* File Upload Section */}
          <div className="form-group">
            <label>Прикрепленные файлы:</label>
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
              <div className="uploaded-files-table">
                <table className="table table-bordered">
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
                {modalType === 'organization' ? 'Выбрать Организацию' :
                 modalType === 'ddsArticle' ? 'Выбрать Статью ДДС' :
                 modalType === 'budgetArticle' ? 'Выбрать Статью Бюджета' :
                 modalType === 'project' ? 'Выбрать Проект' :
                 modalType === 'cfo' ? 'Выбрать ЦФО' :
                 modalType === 'counterparty' ? 'Выбрать Контрагента' :
                 modalType === 'contract' ? 'Выбрать Договор' : 'Выбрать элемент'}
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