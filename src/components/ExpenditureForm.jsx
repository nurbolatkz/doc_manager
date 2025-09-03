import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';
import { apiRequest, fetchOrganizations, fetchProjects, fetchCFOs, fetchDdsArticles, fetchBudgetArticles, fetchCounterparties, fetchContracts } from '../services/fetchManager';

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
  const [operationTypes, setOperationTypes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cfos, setCfos] = useState([]);
  const [ddsArticles, setDdsArticles] = useState([]);
  const [budgetArticles, setBudgetArticles] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingOperationTypes, setLoadingOperationTypes] = useState(true);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCfos, setLoadingCfos] = useState(true);
  const [loadingDdsArticles, setLoadingDdsArticles] = useState(true);
  const [loadingBudgetArticles, setLoadingBudgetArticles] = useState(true);
  const [loadingCounterparties, setLoadingCounterparties] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Dummy data for demonstration (keeping existing dummy data)
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

  // Fetch operation types from API
  useEffect(() => {
    const loadOperationTypes = async () => {
      try {
        setLoadingOperationTypes(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const requestBody = {
          username: "Администратор",
          type: "expenditure"
        };

        // Using the apiRequest function directly with the endpoint
        const response = await apiRequest("operation-type", requestBody, token);
        
        if (response && response.data && Array.isArray(response.data)) {
          setOperationTypes(response.data.map(item => item.name));
        } else {
          // Fallback to default options if API doesn't return expected data
          setOperationTypes([
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
          ]);
        }
      } catch (err) {
        console.error('Error fetching operation types:', err);
        // Fallback to default options on error
        setOperationTypes([
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
        ]);
      } finally {
        setLoadingOperationTypes(false);
      }
    };

    loadOperationTypes();
  }, []);

  // Fetch organizations from API
  useEffect(() => {
    const loadOrganizations = async () => {
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

    loadOrganizations();
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const loadProjects = async () => {
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
          setProjects(dummyProjects);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Fallback to dummy data on error
        setProjects(dummyProjects);
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
          setCfos(dummyCfos);
        }
      } catch (err) {
        console.error('Error fetching CFOs:', err);
        // Fallback to dummy data on error
        setCfos(dummyCfos);
      } finally {
        setLoadingCfos(false);
      }
    };

    loadCFOs();
  }, []);

  // Fetch DDS articles from API
  useEffect(() => {
    const loadDdsArticles = async () => {
      try {
        setLoadingDdsArticles(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
        const response = await fetchDdsArticles(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Map the API response to match the expected format (guid -> id, GUID -> guid)
          const formattedDdsArticles = response.data.map(article => ({
            id: article.guid || article.GUID,
            guid: article.GUID || article.guid,
            name: article.name
          }));
          setDdsArticles(formattedDdsArticles);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setDdsArticles(dummyDdsArticles);
        }
      } catch (err) {
        console.error('Error fetching DDS articles:', err);
        // Fallback to dummy data on error
        setDdsArticles(dummyDdsArticles);
      } finally {
        setLoadingDdsArticles(false);
      }
    };

    loadDdsArticles();
  }, []);

  // Fetch budget articles from API
  useEffect(() => {
    const loadBudgetArticles = async () => {
      try {
        setLoadingBudgetArticles(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
        const response = await fetchBudgetArticles(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Map the API response to match the expected format (guid -> id, GUID -> guid)
          const formattedBudgetArticles = response.data.map(article => ({
            id: article.guid || article.GUID,
            guid: article.GUID || article.guid,
            name: article.name
          }));
          setBudgetArticles(formattedBudgetArticles);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setBudgetArticles(dummyBudgetArticles);
        }
      } catch (err) {
        console.error('Error fetching budget articles:', err);
        // Fallback to dummy data on error
        setBudgetArticles(dummyBudgetArticles);
      } finally {
        setLoadingBudgetArticles(false);
      }
    };

    loadBudgetArticles();
  }, []);

  // Fetch counterparties from API
  useEffect(() => {
    const loadCounterparties = async () => {
      try {
        setLoadingCounterparties(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Using a sample document ID for the request
        const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
        const response = await fetchCounterparties(token, sampleDocumentId);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Map the API response to match the expected format (guid -> id, GUID -> guid)
          const formattedCounterparties = response.data.map(counterparty => ({
            id: counterparty.guid || counterparty.GUID,
            guid: counterparty.GUID || counterparty.guid,
            name: counterparty.name
          }));
          setCounterparties(formattedCounterparties);
        } else {
          // Fallback to dummy data if API doesn't return expected data
          setCounterparties(dummyCounterparties);
        }
      } catch (err) {
        console.error('Error fetching counterparties:', err);
        // Fallback to dummy data on error
        setCounterparties(dummyCounterparties);
      } finally {
        setLoadingCounterparties(false);
      }
    };

    loadCounterparties();
  }, []);

  // Fetch contracts when counterparty is selected
  useEffect(() => {
    const loadContracts = async () => {
      // Only fetch contracts if a counterparty is selected
      if (formData.counterpartyGuid) {
        try {
          setLoadingContracts(true);
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('No authentication token found');
          }

          // Using a sample document ID for the request
          const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
          const response = await fetchContracts(token, sampleDocumentId, formData.counterpartyGuid);
          
          if (response && response.data && Array.isArray(response.data)) {
            // Map the API response to match the expected format (guid -> id, GUID -> guid)
            const formattedContracts = response.data.map(contract => ({
              id: contract.guid || contract.GUID,
              guid: contract.GUID || contract.guid,
              name: contract.name
            }));
            setContracts(formattedContracts);
          } else {
            // Fallback to dummy data if API doesn't return expected data
            setContracts(dummyContracts);
          }
        } catch (err) {
          console.error('Error fetching contracts:', err);
          // Fallback to dummy data on error
          setContracts(dummyContracts);
        } finally {
          setLoadingContracts(false);
        }
      } else {
        // Clear contracts when no counterparty is selected
        setContracts([]);
      }
    };

    loadContracts();
  }, [formData.counterpartyGuid]);

  // Debugging: Log formData changes
  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  const handleInputChange = (field, value) => {
    // Enable contract field when counterparty is selected
    if (field === 'counterparty' && value) {
      setFormData(prev => ({ ...prev, [field]: value }));
      const contractField = document.getElementById('expenditure-contract');
      const contractButton = document.getElementById('open-contract-modal');
      if (contractField && contractButton) {
        contractField.disabled = false;
        contractButton.disabled = false;
      }
    } else if (field === 'counterparty' && !value) {
      // Disable contract field when counterparty is cleared
      setFormData(prev => ({ ...prev, [field]: value, contract: '', contractGuid: '' }));
      const contractField = document.getElementById('expenditure-contract');
      const contractButton = document.getElementById('open-contract-modal');
      if (contractField && contractButton) {
        contractField.disabled = true;
        contractButton.disabled = true;
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
        data = organizations;
        break;
      case 'ddsArticle':
        data = ddsArticles;
        break;
      case 'budgetArticle':
        data = budgetArticles;
        break;
      case 'project':
        data = projects;
        break;
      case 'cfo':
        data = cfos;
        break;
      case 'counterparty':
        data = counterparties;
        break;
      case 'contract':
        data = contracts;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.amount) {
      showCustomMessage('Пожалуйста, укажите сумму', 'danger');
      return;
    }
    
    if (!formData.organizationGuid) {
      showCustomMessage('Пожалуйста, выберите организацию', 'danger');
      return;
    }
    
    if (!formData.counterpartyGuid) {
      showCustomMessage('Пожалуйста, выберите контрагента', 'danger');
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
    
    if (!formData.ddsArticleGuid) {
      showCustomMessage('Пожалуйста, выберите статью ДДС', 'danger');
      return;
    }
    
    if (!formData.budgetArticleGuid) {
      showCustomMessage('Пожалуйста, выберите статью бюджета', 'danger');
      return;
    }
    
    if (!formData.contractGuid) {
      showCustomMessage('Пожалуйста, выберите договор', 'danger');
      return;
    }
    
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Prepare request body according to specification
      const requestBody = {
        username: "Администратор",
        token: token,
        action: "save_document_expenditure",
        type: "expenditure",
        organizationGuid: formData.organizationGuid,
        cfoGuid: formData.cfoGuid,
        projectGuid: formData.projectGuid,
        counterpartyGuid: formData.counterpartyGuid,
        date: formData.date,
        amount: formData.amount,
        currency: formData.currency,
        paymentForm: formData.paymentForm,
        operationType: formData.operationType,
        purposeText: formData.purposeText,
        ddsArticleGuid: formData.ddsArticleGuid,
        budgetArticleGuid: formData.budgetArticleGuid,
        contractGuid: formData.contractGuid
      };
      
      // Send request to backend
      const response = await apiRequest("register_document_action", requestBody, token);
      
      if (response && response.success === 1) {
        showCustomMessage('Заявка на расходы успешно создана!', 'success');
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
      console.error('Error creating expenditure:', error);
      showCustomMessage('Ошибка при создании заявки на расходы: ' + error.message, 'danger');
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

      {/* Success/Error Message Box */}
      {/* This will be handled by showCustomMessage */}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-calendar-alt"></i>
            Основная информация
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Дата расхода:</span>
                <input 
                  type="date" 
                  id="expenditure-date" 
                  name="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Вид операции:</span>
                <select 
                  id="expenditure-operation-type" 
                  name="operationType" 
                  value={formData.operationType}
                  onChange={(e) => handleInputChange('operationType', e.target.value)}
                  className="form-control"
                  disabled={loadingOperationTypes}
                >
                  {operationTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {loadingOperationTypes && (
                  <div className="loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i> Загрузка видов операций...
                  </div>
                )}
              </div>
            </div>
            
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Организация:</span>
                <select 
                  id="expenditure-organization" 
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
                  id="expenditure-organization-name" 
                  name="organization" 
                  value={formData.organization}
                />
              </div>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект:</span>
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
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-dollar-sign"></i>
            Финансовая информация
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Сумма документа:</span>
                <input 
                  type="number" 
                  id="expenditure-amount" 
                  name="amount" 
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="form-control"
                  placeholder="Введите сумму"
                />
              </div>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Валюта:</span>
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
            </div>
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Форма оплаты:</span>
                <select 
                  id="expenditure-payment-form" 
                  name="paymentForm" 
                  value={formData.paymentForm}
                  onChange={(e) => handleInputChange('paymentForm', e.target.value)}
                  className="form-control"
                >
                  <option value="Наличные">Наличные</option>
                  <option value="Безналичный расчёт">Безналичный расчёт</option>
                </select>
              </div>
            </div>
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Назначение платежа:</span>
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
            </div>
          </div>
        </div>

        {/* Counterparty Information Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-handshake"></i>
            Контрагент и договоры
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Контрагент:</span>
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
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Договор:</span>
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
            </div>
          </div>
        </div>

        {/* Organizational Structure Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-sitemap"></i>
            Организационная структура
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>ЦФО (Центр Финансовой Ответственности):</span>
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
            </div>
          </div>
        </div>

        {/* Budget and Accounting Section */}
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-chart-pie"></i>
            Бюджет и учет
          </div>
          <div className="info-grid">
            <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Статья движения денежных средств:</span>
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
              <div className="detail-item">
                <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Статья бюджета:</span>
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
            <i className="fas fa-save"></i> Сохранить
          </button>
        </div>
      </form>

      {/* Universal Selection Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
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

export default ExpenditureForm;