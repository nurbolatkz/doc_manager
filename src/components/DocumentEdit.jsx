import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { 
  fetchOrganizations, 
  fetchProjects, 
  fetchCFOs,
  fetchDocumentTypes,
  fetchDdsArticles,
  fetchBudgetArticles,
  fetchCounterparties,
  fetchContracts,
  apiRequest
} from '../services/fetchManager';
import { showCustomMessage } from '../utils';

const DocumentEdit = ({ document, onBack, onSave, theme }) => {
  const [formData, setFormData] = useState({
    // Common fields
    documentType: '',
    documentTypeGuid: '',
    organizationGuid: '',
    cfoGuid: '',
    projectGuid: '',
    cfo: '',
    project: '',
    
    // Memo-specific fields
    text: '',
    
    // Expenditure-specific fields
    date: new Date().toISOString().split('T')[0],
    currency: 'KZT',
    amount: '',
    paymentForm: 'Наличные',
    operationType: 'Возврат денежных средств покупателю',
    purposeText: '',
    ddsArticle: '',
    ddsArticleGuid: '',
    budgetArticle: '',
    budgetArticleGuid: '',
    counterparty: '',
    counterpartyGuid: '',
    contract: '',
    contractGuid: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  // Data for modals
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cfos, setCfos] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [ddsArticles, setDdsArticles] = useState([]);
  const [budgetArticles, setBudgetArticles] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [contracts, setContracts] = useState([]);
  
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingCfos, setLoadingCfos] = useState(false);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [loadingDdsArticles, setLoadingDdsArticles] = useState(false);
  const [loadingBudgetArticles, setLoadingBudgetArticles] = useState(false);
  const [loadingCounterparties, setLoadingCounterparties] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Initialize form data with document data
  useEffect(() => {
    if (document) {
      if (document.documentType === 'memo') {
        setFormData(prev => ({
          ...prev,
          text: document.message || '',
          organizationGuid: document.organizationGuid || '',
          cfoGuid: document.cfoGuid || '',
          projectGuid: document.projectGuid || '',
          cfo: document.cfo || '',
          project: document.project || '',
          documentType: document.documentType || '',
          documentTypeGuid: document.documentTypeGuid || ''
        }));
      } else if (document.documentType === 'expenditure') {
        setFormData(prev => ({
          ...prev,
          date: document.date || new Date().toISOString().split('T')[0],
          currency: document.currency || 'KZT',
          amount: document.amount || '',
          paymentForm: document.paymentForm || 'Наличные',
          operationType: document.operationType || 'Возврат денежных средств покупателю',
          organizationGuid: document.organizationGuid || '',
          purposeText: document.purposeText || '',
          ddsArticle: document.ddsArticle || '',
          ddsArticleGuid: document.ddsArticleGuid || '',
          budgetArticle: document.budgetArticle || '',
          budgetArticleGuid: document.budgetArticleGuid || '',
          project: document.project || '',
          projectGuid: document.projectGuid || '',
          cfo: document.cfo || '',
          cfoGuid: document.cfoGuid || '',
          counterparty: document.counterparty || '',
          counterpartyGuid: document.counterpartyGuid || '',
          contract: document.contract || '',
          contractGuid: document.contractGuid || '',
          documentType: document.documentType || '',
          documentTypeGuid: document.documentTypeGuid || ''
        }));
      }
    }
    
    // Fetch data for modals
    Promise.all([
      fetchOrganizationsForEdit(),
      fetchProjectsForEdit(),
      fetchCFOsForEdit(),
      fetchDocumentTypesForEdit(),
      fetchDdsArticlesForEdit(),
      fetchBudgetArticlesForEdit(),
      fetchCounterpartiesForEdit()
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
          { name: 'Отчёт', guid: 'report' },
          { name: 'Расход', guid: 'expenditure' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching document types:', err);
      // Fallback to default options on error
      setDocumentTypes([
    
        { name: 'План Платежей', guid: 'payment' },
        { name: 'Служебная записка', guid: 'memo' },
        { name: 'Расход', guid: 'expenditure' }
      ]);
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  // Fetch DDS articles for edit form
  const fetchDdsArticlesForEdit = async () => {
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
        setDdsArticles(response.data);
      } else {
        // Fallback to dummy data if API doesn't return expected data
        setDdsArticles([
          { id: 1, guid: 'dds-001', name: 'Статья ДДС 1' },
          { id: 2, guid: 'dds-002', name: 'Статья ДДС 2' },
          { id: 3, guid: 'dds-003', name: 'Статья ДДС 3' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching DDS articles:', err);
      // Fallback to dummy data on error
      setDdsArticles([
        { id: 1, guid: 'dds-001', name: 'Статья ДДС 1' },
        { id: 2, guid: 'dds-002', name: 'Статья ДДС 2' },
        { id: 3, guid: 'dds-003', name: 'Статья ДДС 3' }
      ]);
    } finally {
      setLoadingDdsArticles(false);
    }
  };

  // Fetch budget articles for edit form
  const fetchBudgetArticlesForEdit = async () => {
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
        setBudgetArticles(response.data);
      } else {
        // Fallback to dummy data if API doesn't return expected data
        setBudgetArticles([
          { id: 1, guid: 'budget-001', name: 'Статья Бюджета 1' },
          { id: 2, guid: 'budget-002', name: 'Статья Бюджета 2' },
          { id: 3, guid: 'budget-003', name: 'Статья Бюджета 3' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching budget articles:', err);
      // Fallback to dummy data on error
      setBudgetArticles([
        { id: 1, guid: 'budget-001', name: 'Статья Бюджета 1' },
        { id: 2, guid: 'budget-002', name: 'Статья Бюджета 2' },
        { id: 3, guid: 'budget-003', name: 'Статья Бюджета 3' }
      ]);
    } finally {
      setLoadingBudgetArticles(false);
    }
  };

  // Fetch counterparties for edit form
  const fetchCounterpartiesForEdit = async () => {
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
        setCounterparties(response.data);
      } else {
        // Fallback to dummy data if API doesn't return expected data
        setCounterparties([
          { id: 1, guid: 'counter-001', name: 'Контрагент 1' },
          { id: 2, guid: 'counter-002', name: 'Контрагент 2' },
          { id: 3, guid: 'counter-003', name: 'Контрагент 3' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching counterparties:', err);
      // Fallback to dummy data on error
      setCounterparties([
        { id: 1, guid: 'counter-001', name: 'Контрагент 1' },
        { id: 2, guid: 'counter-002', name: 'Контрагент 2' },
        { id: 3, guid: 'counter-003', name: 'Контрагент 3' }
      ]);
    } finally {
      setLoadingCounterparties(false);
    }
  };

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
            setContracts(response.data);
          } else {
            // Fallback to dummy data if API doesn't return expected data
            setContracts([
              { id: 1, guid: 'contract-001', name: 'Договор 1' },
              { id: 2, guid: 'contract-002', name: 'Договор 2' },
              { id: 3, guid: 'contract-003', name: 'Договор 3' }
            ]);
          }
        } catch (err) {
          console.error('Error fetching contracts:', err);
          // Fallback to dummy data on error
          setContracts([
            { id: 1, guid: 'contract-001', name: 'Договор 1' },
            { id: 2, guid: 'contract-002', name: 'Договор 2' },
            { id: 3, guid: 'contract-003', name: 'Договор 3' }
          ]);
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
    } else if (field === 'counterparty' && value) {
      // Enable contract field when counterparty is selected
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (field === 'counterparty' && !value) {
      // Disable contract field when counterparty is cleared
      setFormData(prev => ({ ...prev, [field]: value, contract: '', contractGuid: '' }));
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
      case 'cfo':
        setFormData(prev => ({
          ...prev,
          cfo: item.name,
          cfoGuid: item.guid
        }));
        break;
      case 'project':
        setFormData(prev => ({
          ...prev,
          project: item.name,
          projectGuid: item.guid
        }));
        break;
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
          ddsArticleGuid: item.GUID || item.guid, // This was missing
        }));
        break;
      case 'budgetArticle':
        setFormData(prev => ({
          ...prev,
          budgetArticle: item.name,
          budgetArticleGuid: item.GUID || item.guid, 
        }));
        break;
      case 'counterparty':
        setFormData(prev => ({
          ...prev,
          counterparty: item.name,
          counterpartyGuid: item.GUID || item.guid, 
        }));
        break;
      case 'contract':
        setFormData(prev => ({
          ...prev,
          contract: item.name,
          contractGuid: item.GUID || item.guid, 
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
      case 'cfo':
        data = cfos;
        break;
      case 'project':
        data = projects;
        break;
      case 'organization':
        data = organizations;
        break;
      case 'ddsArticle':
        data = ddsArticles;
        break;
      case 'budgetArticle':
        data = budgetArticles;
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
    
    // Validate based on document type
    if (document.documentType === 'memo') {
      // Validate required fields for memo
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
    } else if (document.documentType === 'expenditure') {
      // Validate required fields for expenditure
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
          documentId: document.id,
          action: "update_document_expenditure",
          type: "expenditure",
          organizationGuid: formData.organizationGuid,
          cfoGuid: formData.cfoGuid,
          projectGuid: formData.projectGuid,
          counterpartyGuid: formData.counterpartyGuid,
          date: formData.date,
          amount: formData.amount,
          currency: formData.currency,
          paymentForm: formData.paymentForm,
          budgetArticleGuid: formData.budgetArticleGuid,
          ddsArticleGuid: formData.ddsArticleGuid,
          contractGuid: formData.contractGuid
        };
        
        // Send request to backend
        const response = await apiRequest("register_document_action", requestBody, token);
        
        if (response && response.success === 1) {
          showCustomMessage('Заявка на расходы успешно обновлена!', 'success');
          // Call onSave with the updated document data
          if (onSave) {
            onSave({
              ...document,
              date: formData.date,
              currency: formData.currency,
              amount: formData.amount,
              paymentForm: formData.paymentForm,
              operationType: formData.operationType,
              organizationGuid: formData.organizationGuid,
              purposeText: formData.purposeText,
              ddsArticle: formData.ddsArticle,
              ddsArticleGuid: formData.ddsArticleGuid,
              budgetArticle: formData.budgetArticle,
              budgetArticleGuid: formData.budgetArticleGuid,
              project: formData.project,
              projectGuid: formData.projectGuid,
              cfo: formData.cfo,
              cfoGuid: formData.cfoGuid,
              counterparty: formData.counterparty,
              counterpartyGuid: formData.counterpartyGuid,
              contract: formData.contract,
              contractGuid: formData.contractGuid,
              documentType: document.documentType,
              documentTypeGuid: formData.documentTypeGuid,
              // Preserve the document ID and other important properties
              id: document.id,
              title: document.title,
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
        console.error('Error updating expenditure:', error);
        showCustomMessage('Ошибка при обновлении заявки на расходы: ' + error.message, 'danger');
      }
    }
  };

  const handleCancel = () => {
    onBack();
  };

  if (!document || (document.documentType !== 'memo' && document.documentType !== 'expenditure')) {
    console.log('Invalid document type', document);
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
          <p>Невозможно редактировать данный тип документа {document.documentType}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <h2>
            {document.documentType === 'memo' 
              ? 'Редактировать Служебную Записку' 
              : 'Редактировать Заявку на Расходы'}
          </h2>
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
          {document.documentType === 'memo' ? (
            // Memo form
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
          ) : (
            // Expenditure form
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expenditure-date">Дата Создания:</label>
                  <input 
                    type="date" 
                    id="expenditure-date" 
                    name="date" 
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expenditure-currency">Валюта:</label>
                  <select 
                    id="expenditure-currency" 
                    name="currency" 
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
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
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                  className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
                >
                  <option value="Наличные">Наличные</option>
                  <option value="Безналичный расчет">Безналичные</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expenditure-operation-type">Тип Операции:</label>
                <select 
                  id="expenditure-operation-type" 
                  name="operationType" 
                  value={formData.operationType}
                  onChange={(e) => handleInputChange('operationType', e.target.value)}
                  className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
                >
                  <option value="Возврат денежных средств покупателю">Возврат денежных средств покупателю</option>
                  <option value="Выдача денежных средств подотчетнику">Выдача денежных средств подотчетнику</option>
                  <option value="Перечисление заработной платы">Перечисление заработной платы</option>
                  <option value="Перечисление налога">Перечисление налога</option>
                  <option value="Перечисление НДС с изменённым сроком уплаты">Перечисление НДС с изменённым сроком уплаты</option>
                  <option value="Перечисление пенсионных взносов">Перечисление пенсионных взносов</option>
                  <option value="Перечисление по исполнительным листам">Перечисление по исполнительным листам</option>
                  <option value="Перечисление социальных отчислений">Перечисление социальных отчислений</option>
                  <option value="Прочие расчёты с контрагентами">Прочие расчёты с контрагентами</option>
                  <option value="Расчёты по кредитам и займам с работниками">Расчёты по кредитам и займам с работниками</option>
                  <option value="Прочий расход денежных средств">Прочий расход денежных средств</option>
                  <option value="Расчёты по кредитам и займам с контрагентами">Расчёты по кредитам и займам с контрагентами</option>
                  <option value="Расчёты по доходу от разовых выплат с контрагентами">Расчёты по доходу от разовых выплат с контрагентами</option>
                  <option value="Оплата структурному подразделению">Оплата структурному подразделению</option>
                  <option value="Перевод на другой счёт">Перевод на другой счёт</option>
                  <option value="Оплата поставщику">Оплата поставщику</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expenditure-organization">Организация:</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    id="expenditure-organization" 
                    name="organization" 
                    value={formData.organization || ''}
                    readOnly
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                  className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                      className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                      className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
                    className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
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
            </>
          )}

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
              {modalType === 'organization' ? 'Выбрать Организацию' :
               modalType === 'ddsArticle' ? 'Выбрать Статью ДДС' :
               modalType === 'budgetArticle' ? 'Выбрать Статью Бюджета' :
               modalType === 'project' ? 'Выбрать Проект' :
               modalType === 'cfo' ? 'Выбрать ЦФО' :
               modalType === 'counterparty' ? 'Выбрать Контрагента' :
               modalType === 'contract' ? 'Выбрать Договор' : 
               modalType === 'cfo' ? 'Выбрать ЦФО' : 
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