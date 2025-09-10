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
  apiRequest,
  updateDocumentFiles as updateDocumentFilesAPI
} from '../services/fetchManager';
import { showCustomMessage } from '../utils';
import { sanitizeInput, sanitizeFormData } from '../utils/inputSanitization';
import MemoEdit from './MemoEdit';
import PaymentEdit from './PaymentEdit';
import ExpenditureEdit from './ExpenditureEdit';

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
    contractGuid: '',
    
    // Payment-specific fields
    documentNumber: '',
    documentDate: new Date().toISOString().split('T')[0],
    payments: [],
    selectedPayments: [] // For tracking selected payment lines
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [arrayToUpload, setArrayToUpload] = useState([]);
  const [arrayToRemove, setArrayToRemove] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  
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
  const [loadingPaymentLines, setLoadingPaymentLines] = useState(false); // For payment lines loading

  // Function to fetch existing attachments
  const fetchExistingAttachments = async () => {
    if (!document.id || !document.documentType) {
      return;
    }
    
    setLoadingAttachments(true);
    
    try {
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken') || '';
      } catch (e) {
        return '';
      }
    })();
      
      const requestBody = {
        username: "Администратор",
        action: "get_array_files",
        type: document.documentType,
        documentid: document.id
      };
      
      const response = await apiRequest("document_files", requestBody, token);
      
      if (response && response.success === 1 && Array.isArray(response.files)) {
        // Transform the response to match the existing attachment structure
        const transformedAttachments = response.files.map((file, index) => ({
          id: index + 1,
          name: file.name,
          guid: file.guid || file.id || `file-${index}`,
          uploadDate: file.uploadDate || new Date().toISOString()
        }));
        setExistingAttachments(transformedAttachments);
      } else {
        setExistingAttachments([]);
      }
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setExistingAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Function to fetch payment lines for payment documents
  const fetchPaymentLines = async () => {
    try {
      setLoadingPaymentLines(true);
      const requestBody = {
        username: "Администратор",
        token: "",
        type: "payment"
      };
      
      const response = await apiRequest("payment-line", requestBody, "");
      
      if (Array.isArray(response)) {
        // Convert the response to the payments format
        const newPayments = response.map((line, index) => ({
          id: index + 1,
          description: line.Наименование,
          details: line.НазначениеПлатежа || '',
          project: line.Проект || '',
          ersNumber: line.НомерЗрс || '',
          counterparty: line.Контрагент || '',
          paymentType: line.ВидОперации || '',
          amount: parseFloat(line.Сумма.toString().replace(/\s/g, '')) || 0,
          paymentDate: line.ДатаПлатежа || new Date().toISOString(), // Add payment date
          guid: line.GUID // Store GUID for reference
        }));
        
        setFormData(prev => ({
          ...prev,
          payments: newPayments
        }));
        
        // Initialize all payments as selected
        setFormData(prev => ({
          ...prev,
          selectedPayments: newPayments.map(payment => payment.id)
        }));
      } else {
        showCustomMessage('Ошибка при загрузке данных платежей', 'danger');
      }
    } catch (error) {
      console.error("Error fetching payment lines:", error);
      showCustomMessage('Ошибка при загрузке данных платежей: ' + error.message, 'danger');
    } finally {
      setLoadingPaymentLines(false);
    }
  };

  // Initialize form data with document data
  useEffect(() => {
    if (document) {
      console.log('Initializing form with', document.documentType, 'document');
      
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
      } else if (document.documentType === 'payment') {
        setFormData(prev => ({
          ...prev,
          documentNumber: document.number || '',
          documentDate: document.date || new Date().toISOString().split('T')[0],
          payments: document.paymentLines || [],
          documentType: document.documentType || '',
          documentTypeGuid: document.documentTypeGuid || '',
          // Initialize selected payments
          selectedPayments: document.paymentLines ? document.paymentLines.map((_, index) => index + 1) : []
        }));
        
        // Fetch payment lines for editing
        fetchPaymentLines();
      }
      
      // Fetch existing attachments
      fetchExistingAttachments();
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

  // Add useEffect to monitor when document ID or type changes for attachments
  useEffect(() => {
    if (document && document.id && document.documentType) {
      console.log('Document changed, fetching attachments for', document.documentType, document.id);
      fetchExistingAttachments();
    }
  }, [document?.id, document?.documentType]);

  // Fetch organizations for edit form
  const fetchOrganizationsForEdit = async () => {
    try {
      setLoadingOrganizations(true);
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
      const response = await fetchOrganizations(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedOrganizations = response.data.map(org => ({
          ...org,
          id: org.id || org.guid || org.GUID,
          guid: org.guid || org.id || org.GUID,
          name: org.name || org.Наименование || org.title
        }));
        setOrganizations(normalizedOrganizations);
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
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
      const response = await fetchProjects(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedProjects = response.data.map(project => ({
          ...project,
          id: project.id || project.guid || project.GUID,
          guid: project.guid || project.id || project.GUID,
          name: project.name || project.Наименование || project.title
        }));
        setProjects(normalizedProjects);
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
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
      const response = await fetchCFOs(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedCFOs = response.data.map(cfo => ({
          ...cfo,
          id: cfo.id || cfo.guid || cfo.GUID,
          guid: cfo.guid || cfo.id || cfo.GUID,
          name: cfo.name || cfo.Наименование || cfo.title
        }));
        setCfos(normalizedCFOs);
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
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
      const response = await fetchDocumentTypes(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedDocumentTypes = response.data.map(type => ({
          ...type,
          id: type.id || type.guid || type.GUID,
          guid: type.guid || type.id || type.GUID,
          name: type.name || type.Наименование || type.title
        }));
        setDocumentTypes(normalizedDocumentTypes);
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
          { name: 'Расход', guid: 'expenditure' },
          { name: 'Платеж', guid: 'payment' }
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
        { name: 'Отчёт', guid: 'report' },
        { name: 'Расход', guid: 'expenditure' },
        { name: 'Платеж', guid: 'payment' }
      ]);
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  // Fetch DDS articles for edit form
  const fetchDdsArticlesForEdit = async () => {
    try {
      setLoadingDdsArticles(true);
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
      const response = await fetchDdsArticles(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedDdsArticles = response.data.map(item => ({
          ...item,
          id: item.id || item.guid || item.GUID,
          guid: item.guid || item.id || item.GUID,
          name: item.name || item.Наименование || item.title
        }));
        setDdsArticles(normalizedDdsArticles);
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
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
      const response = await fetchBudgetArticles(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedBudgetArticles = response.data.map(item => ({
          ...item,
          id: item.id || item.guid || item.GUID,
          guid: item.guid || item.id || item.GUID,
          name: item.name || item.Наименование || item.title
        }));
        setBudgetArticles(normalizedBudgetArticles);
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
      const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Using a sample document ID for the request
      const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
      const response = await fetchCounterparties(token, sampleDocumentId);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Normalize the data structure to ensure we have the expected properties
        const normalizedCounterparties = response.data.map(item => ({
          ...item,
          id: item.id || item.guid || item.GUID,
          guid: item.guid || item.id || item.GUID,
          name: item.name || item.Наименование || item.title
        }));
        setCounterparties(normalizedCounterparties);
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
          const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
          if (!token) {
            throw new Error('No authentication token found');
          }

          // Using a sample document ID for the request
          const sampleDocumentId = 'f10c6dfe-84a4-11f0-8dd9-d8859d41b83b';
          const response = await fetchContracts(token, sampleDocumentId, formData.counterpartyGuid);
          
          if (response && response.data && Array.isArray(response.data)) {
            // Normalize the data structure to ensure we have the expected properties
            const normalizedContracts = response.data.map(item => ({
              ...item,
              id: item.id || item.guid || item.GUID,
              guid: item.guid || item.id || item.GUID,
              name: item.name || item.Наименование || item.title
            }));
            setContracts(normalizedContracts);
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
    // Sanitize input value
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    // Handle document type GUID when document type is selected
    if (field === 'documentType') {
      if (sanitizedValue) {
        const selectedDocType = documentTypes.find(type => type.guid === sanitizedValue);
        setFormData(prev => ({ 
          ...prev, 
          [field]: sanitizedValue,
          documentTypeGuid: selectedDocType ? selectedDocType.guid : sanitizedValue
        }));
      } else {
        // Clear document type GUID when document type is cleared
        setFormData(prev => ({ 
          ...prev, 
          [field]: sanitizedValue,
          documentTypeGuid: ''
        }));
      }
    } else if (field === 'counterparty' && sanitizedValue) {
      // Enable contract field when counterparty is selected
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    } else if (field === 'counterparty' && !sanitizedValue) {
      // Disable contract field when counterparty is cleared
      setFormData(prev => ({ ...prev, [field]: sanitizedValue, contract: '', contractGuid: '' }));
    } else {
      // Handle all other fields normally
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
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
          cfoGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'project':
        setFormData(prev => ({
          ...prev,
          project: item.name,
          projectGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'organization':
        setFormData(prev => ({
          ...prev,
          organization: item.name,
          organizationGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'ddsArticle':
        setFormData(prev => ({
          ...prev,
          ddsArticle: item.name,
          ddsArticleGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'budgetArticle':
        setFormData(prev => ({
          ...prev,
          budgetArticle: item.name,
          budgetArticleGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'counterparty':
        setFormData(prev => ({
          ...prev,
          counterparty: item.name,
          counterpartyGuid: item.guid || item.id || item.GUID
        }));
        break;
      case 'contract':
        setFormData(prev => ({
          ...prev,
          contract: item.name,
          contractGuid: item.guid || item.id || item.GUID
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

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Convert files to base64
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            fileObject: reader.result // This is the base64 string
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    try {
      const fileObjects = await Promise.all(filePromises);
      
      // Remove the data URL prefix from the base64 string
      const cleanedFileObjects = fileObjects.map(file => ({
        name: file.name,
        fileObject: file.fileObject.split(',')[1] || file.fileObject // Remove 'data:*/*;base64,' prefix
      }));
      
      setArrayToUpload(prev => {
        const newArray = [...prev, ...cleanedFileObjects];
        console.log('Added', cleanedFileObjects.length, 'files to arrayToUpload. New length:', newArray.length);
        return newArray;
      });
      
      // Also keep track of uploaded files for display
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('Added', newFiles.length, 'files to uploadedFiles');
    } catch (error) {
      console.error('Error converting files to base64:', error);
      showCustomMessage('Ошибка при загрузке файлов: ' + error.message, 'danger');
    }
  };

  const removeFile = (fileId) => {
    console.log('Removing file with ID:', fileId);
    console.log('Current arrayToUpload length:', arrayToUpload.length);
    console.log('Current arrayToRemove length:', arrayToRemove.length);
    
    // Check if it's an existing attachment or a newly uploaded file
    const existingAttachment = existingAttachments.find(attachment => attachment.id === fileId);
    
    if (existingAttachment) {
      console.log('Removing existing attachment:', existingAttachment);
      // For existing attachments, ask for confirmation before adding to arrayToRemove
      if (window.confirm(`Вы уверены, что хотите удалить файл "${existingAttachment.name}"?`)) {
        // Add to arrayToRemove
        setArrayToRemove(prev => {
          const newArray = [...prev, {
            name: existingAttachment.name,
            guid: existingAttachment.guid
          }];
          console.log('Added to arrayToRemove. New length:', newArray.length);
          return newArray;
        });
        
        // Remove from existing attachments display
        setExistingAttachments(prev => prev.filter(attachment => attachment.id !== fileId));
      }
    } else {
      // For newly uploaded files, remove from arrayToUpload and uploadedFiles
      const fileToRemove = uploadedFiles.find(file => file.id === fileId);
      if (fileToRemove) {
        console.log('Removing newly uploaded file:', fileToRemove);
        // Store a reference to the file in uploadedFiles when adding it to arrayToUpload
        // This will help us identify which file to remove later
        setArrayToUpload(prev => {
          // Find the index of the file to remove by matching the name
          // Note: This is not ideal as files can have the same name
          const fileIndex = prev.findIndex(file => file.name === fileToRemove.name);
          if (fileIndex !== -1) {
            const newArray = [...prev];
            newArray.splice(fileIndex, 1);
            console.log('Removed file from arrayToUpload. New length:', newArray.length);
            console.log('Remaining files in arrayToUpload:', newArray.map(f => f.name));
            return newArray;
          }
          console.log('File not found in arrayToUpload');
          return prev;
        });
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        console.log('File removed from uploadedFiles:', fileToRemove.name);
      }
    }
    
    // Log the updated arrays
    setTimeout(() => {
      console.log('After removal - arrayToUpload length:', arrayToUpload.length);
      console.log('After removal - arrayToRemove length:', arrayToRemove.length);
    }, 0);
  };

  // Add useEffect to monitor state changes
  useEffect(() => {
    console.log('File arrays updated - ToUpload:', arrayToUpload.length, 'ToRemove:', arrayToRemove.length);
    if (arrayToUpload.length > 0) {
      console.log('First item in arrayToUpload:', arrayToUpload[0].name);
    }
    if (arrayToRemove.length > 0) {
      console.log('First item in arrayToRemove:', arrayToRemove[0].name);
    }
  }, [arrayToUpload, arrayToRemove]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    
    // Sanitize all form data
    const sanitizedFormData = sanitizeFormData(formData);
    
    // Validate based on document type
    if (document.documentType === 'memo') {
      // Validate required fields for memo
      if (!sanitizedFormData.documentType) {
        showCustomMessage('Пожалуйста, выберите тип документа', 'danger');
        return;
      }
      
      if (!sanitizedFormData.text) {
        showCustomMessage('Пожалуйста, введите текст обращения', 'danger');
        return;
      }
      
      if (!sanitizedFormData.organizationGuid) {
        showCustomMessage('Пожалуйста, выберите организацию', 'danger');
        return;
      }
      
      if (!sanitizedFormData.cfoGuid) {
        showCustomMessage('Пожалуйста, выберите ЦФО', 'danger');
        return;
      }
      
      if (!sanitizedFormData.projectGuid) {
        showCustomMessage('Пожалуйста, выберите проект', 'danger');
        return;
      }
      
      try {
        const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
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
          documentTypeGuid: sanitizedFormData.documentTypeGuid,
          projectGuid: sanitizedFormData.projectGuid,
          organizationGuid: sanitizedFormData.organizationGuid,
          cfoGuid: sanitizedFormData.cfoGuid,
          text: sanitizedFormData.text
        };
        
        // Send request to backend
        const response = await apiRequest("register_document_action", requestBody, token);
        
        if (response && response.success === 1) {
          // Update document files if there are any changes
          if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
            const fileUpdateResponse = await updateDocumentFiles(token);
            if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
              showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
            }
          }
          
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
      if (!sanitizedFormData.amount) {
        showCustomMessage('Пожалуйста, укажите сумму', 'danger');
        return;
      }
      
      if (!sanitizedFormData.organizationGuid) {
        showCustomMessage('Пожалуйста, выберите организацию', 'danger');
        return;
      }
      
      if (!sanitizedFormData.counterpartyGuid) {
        showCustomMessage('Пожалуйста, выберите контрагента', 'danger');
        return;
      }
      
      if (!sanitizedFormData.cfoGuid) {
        showCustomMessage('Пожалуйста, выберите ЦФО', 'danger');
        return;
      }
      
      if (!sanitizedFormData.projectGuid) {
        showCustomMessage('Пожалуйста, выберите проект', 'danger');
        return;
      }
      
      if (!sanitizedFormData.ddsArticleGuid) {
        console.log('DDS Article data:', formData.ddsArticle, formData.ddsArticleGuid);
        showCustomMessage('Пожалуйста, выберите статью ДДС', 'danger');
        return;
      }
      
      if (!sanitizedFormData.budgetArticleGuid) {
        showCustomMessage('Пожалуйста, выберите статью бюджета', 'danger');
        return;
      }
      
      if (!sanitizedFormData.contractGuid) {
        showCustomMessage('Пожалуйста, выберите договор', 'danger');
        return;
      }
      
      try {
        // Get auth token
        const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
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
          organizationGuid: sanitizedFormData.organizationGuid,
          cfoGuid: sanitizedFormData.cfoGuid,
          projectGuid: sanitizedFormData.projectGuid,
          counterpartyGuid: sanitizedFormData.counterpartyGuid,
          date: sanitizedFormData.date,
          amount: sanitizedFormData.amount,
          currency: sanitizedFormData.currency,
          paymentForm: sanitizedFormData.paymentForm,
          budgetArticleGuid: sanitizedFormData.budgetArticleGuid,
          ddsArticleGuid: sanitizedFormData.ddsArticleGuid,
          contractGuid: sanitizedFormData.contractGuid
        };
        
        // Send request to backend
        const response = await apiRequest("register_document_action", requestBody, token);
        
        if (response && response.success === 1) {
          // Update document files if there are any changes
          if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
            const fileUpdateResponse = await updateDocumentFiles(token);
            if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
              showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
            }
          }
          
          showCustomMessage('Заявка на расходы успешно обновлена!', 'success');
          // Call onSave with the updated document data
          if (onSave) {
            onSave({
              ...document,
              number: formData.documentNumber,
              date: formData.documentDate,
              amount: formData.amount,
              currency: formData.currency,
              paymentForm: formData.paymentForm,
              budgetArticleGuid: formData.budgetArticleGuid,
              ddsArticleGuid: formData.ddsArticleGuid,
              contractGuid: formData.contractGuid,
              counterpartyGuid: formData.counterpartyGuid,
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
    } else if (document.documentType === 'payment') {
      // Validate required fields for payment
      if (!sanitizedFormData.selectedPayments || sanitizedFormData.selectedPayments.length === 0) {
        showCustomMessage('Пожалуйста, выберите хотя бы один платеж', 'danger');
        return;
      }
      
      try {
        // Get auth token
        const token = (() => {
      try {
        return sessionStorage.getItem('authToken');
      } catch (e) {
        return null;
      }
    })();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Filter payments to only include selected ones
        const selectedPaymentsData = sanitizedFormData.payments.filter(payment => 
          sanitizedFormData.selectedPayments.includes(payment.id)
        );
        
        // Prepare the payment lines data for the request
        const paymentLines = selectedPaymentsData.map(payment => ({
          GUID: payment.guid,
          amount: payment.amount,
          paymentDate: payment.paymentDate
        }));
        
        // Prepare request body according to specification
        const requestBody = {
          username: "Администратор",
          token: token,
          documentId: document.id,
          action: "update_document_payment",
          type: "payment",
          paymentLines: paymentLines
        };
        
        // Send request to backend
        const response = await apiRequest("register_document_action", requestBody, token);
        
        if (response && response.success === 1) {
          // Update document files if there are any changes
          if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
            const fileUpdateResponse = await updateDocumentFiles(token);
            if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
              showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
            }
          }
          
          showCustomMessage('Платежный документ успешно обновлен!', 'success');
          // Call onSave with the updated document data
          if (onSave) {
            onSave({
              ...document,
              number: formData.documentNumber,
              date: formData.documentDate,
              paymentLines: selectedPaymentsData,
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
        console.error('Error updating payment:', error);
        showCustomMessage('Ошибка при обновлении платежного документа: ' + error.message, 'danger');
      }
    }
  };

  // Function to update document files
  const updateDocumentFiles = async (token) => {
    try {
      console.log('Updating document files');
      console.log('Document ID:', document.id);
      console.log('Document type:', document.documentType);
      console.log('Array to remove:', arrayToRemove);
      console.log('Array to upload:', arrayToUpload);
      
      // Only proceed if there are files to update
      if (arrayToRemove.length === 0 && arrayToUpload.length === 0) {
        console.log('No files to update');
        return { success: 1, message: "No files to update" };
      }
      
      console.log('Sending request with arrayToRemove length:', arrayToRemove.length);
      console.log('Sending request with arrayToUpload length:', arrayToUpload.length);
      
      const response = await updateDocumentFilesAPI(token, "Администратор", arrayToRemove, arrayToUpload, document.id, document.documentType);
      console.log('File update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating document files:', error);
      showCustomMessage('Ошибка при обновлении файлов документа: ' + error.message, 'danger');
      return null;
    }
  };

  const handleCancel = () => {
    onBack();
  };

  // Function to handle payment selection
  const handlePaymentSelection = (id) => {
    setFormData(prev => {
      if (prev.selectedPayments.includes(id)) {
        return {
          ...prev,
          selectedPayments: prev.selectedPayments.filter(paymentId => paymentId !== id)
        };
      } else {
        return {
          ...prev,
          selectedPayments: [...prev.selectedPayments, id]
        };
      }
    });
  };

  // Function to select/deselect all payments
  const toggleSelectAllPayments = () => {
    setFormData(prev => {
      if (prev.selectedPayments.length === prev.payments.length) {
        // If all are selected, deselect all
        return {
          ...prev,
          selectedPayments: []
        };
      } else {
        // If not all are selected, select all
        return {
          ...prev,
          selectedPayments: prev.payments.map(payment => payment.id)
        };
      }
    });
  };

  // Function to update payment amount
  const updatePaymentAmount = (index, amount) => {
    setFormData(prev => {
      const updatedPayments = [...prev.payments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        amount: parseFloat(amount) || 0
      };
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  // Function to update payment date
  const updatePaymentDate = (index, date) => {
    setFormData(prev => {
      const updatedPayments = [...prev.payments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        paymentDate: date
      };
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  if (!document || (document.documentType !== 'memo' && document.documentType !== 'expenditure' && document.documentType !== 'payment')) {
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
          <h2>
            {document.documentType === 'memo' 
              ? 'Редактировать Служебную Записку' 
              : document.documentType === 'payment'
                ? 'Редактировать Платежный Документ'
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
        <form onSubmit={(e) => {
          console.log('Form submit event triggered');
          handleSubmit(e);
        }}>
          {document.documentType === 'memo' ? (
            // Memo form
            <MemoEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              documentTypes={documentTypes}
              loadingDocumentTypes={loadingDocumentTypes}
              organizations={organizations}
              loadingOrganizations={loadingOrganizations}
              cfos={cfos}
              projects={projects}
              openModal={openModal}
              handleFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              formatFileSize={formatFileSize}
              existingAttachments={existingAttachments}
              loadingAttachments={loadingAttachments}
            />
          ) : document.documentType === 'payment' ? (
            // Payment form
            <PaymentEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              fetchPaymentLines={fetchPaymentLines}
              loadingPaymentLines={loadingPaymentLines}
              handlePaymentSelection={handlePaymentSelection}
              toggleSelectAllPayments={toggleSelectAllPayments}
              updatePaymentAmount={updatePaymentAmount}
              updatePaymentDate={updatePaymentDate}
            />
          ) : (
            // Expenditure form
            <ExpenditureEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              cfos={cfos}
              projects={projects}
              ddsArticles={ddsArticles}
              budgetArticles={budgetArticles}
              counterparties={counterparties}
              contracts={contracts}
              openModal={openModal}
              handleFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              formatFileSize={formatFileSize}
              existingAttachments={existingAttachments}
              loadingAttachments={loadingAttachments}
            />
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