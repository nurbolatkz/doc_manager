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
import { t } from '../utils/messages';
import { sanitizeInput, sanitizeFormData } from '../utils/inputSanitization';
import { mergeDocumentData, formatDateForInput } from '../utils/documentUtils';
import MemoEdit from './MemoEdit';
import PaymentEdit from './PaymentEdit';
import ExpenditureEdit from './ExpenditureEdit';

const DocumentEdit = ({ document, onBack, onSave, theme }) => {
  // Initial form state
  const getInitialFormData = () => ({
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
    date: '',
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
    documentDate: '',
    paymentGuid: '',
    payments: [],
    selectedPayments: [],
    paymentsInitialized: false
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [arrayToUpload, setArrayToUpload] = useState([]);
  const [arrayToRemove, setArrayToRemove] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  // Data states
  const [dataStates, setDataStates] = useState({
    organizations: [],
    projects: [],
    cfos: [],
    documentTypes: [],
    ddsArticles: [],
    budgetArticles: [],
    counterparties: [],
    contracts: []
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    attachments: false,
    organizations: false,
    projects: false,
    cfos: false,
    documentTypes: false,
    ddsArticles: false,
    budgetArticles: false,
    counterparties: false,
    contracts: false,
    paymentLines: false
  });

  // Helper function to get auth token
  const getAuthToken = () => {
    try {
      return sessionStorage.getItem('authToken') || '';
    } catch (e) {
      return '';
    }
  };

  // Generic data fetcher
  const fetchData = async (fetchFunction, dataKey) => {
    setLoadingStates(prev => ({ ...prev, [dataKey]: true }));
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const documentId = document?.id || '7c779250-11f8-11f0-8dbb-fff1bb3bb704';
      
      // Special handling for contracts - they need counterpartyGuid
      if (dataKey === 'contracts' && fetchFunction === fetchContracts) {
        if (!formData.counterpartyGuid) {
          setDataStates(prev => ({ ...prev, [dataKey]: [] }));
          return;
        }
        const response = await fetchFunction(token, documentId, formData.counterpartyGuid);
        if (response?.data && Array.isArray(response.data)) {
          const normalizedData = response.data.map(item => ({
            ...item,
            id: item.id || item.guid || item.GUID,
            guid: item.guid || item.id || item.GUID,
            name: item.name || item.Наименование || item.title
          }));
          setDataStates(prev => ({ ...prev, [dataKey]: normalizedData }));
        } else {
          // Fallback to dummy data
          setDataStates(prev => ({ ...prev, [dataKey]: getDummyData(dataKey) }));
        }
      } else {
        const response = await fetchFunction(token, documentId);
        if (response?.data && Array.isArray(response.data)) {
          const normalizedData = response.data.map(item => ({
            ...item,
            id: item.id || item.guid || item.GUID,
            guid: item.guid || item.id || item.GUID,
            name: item.name || item.Наименование || item.title
          }));
          setDataStates(prev => ({ ...prev, [dataKey]: normalizedData }));
        } else {
          // Fallback to dummy data
          setDataStates(prev => ({ ...prev, [dataKey]: getDummyData(dataKey) }));
        }
      }
    } catch (err) {
      console.error(`Error fetching ${dataKey}:`, err);
      setDataStates(prev => ({ ...prev, [dataKey]: getDummyData(dataKey) }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataKey]: false }));
    }
  };

  // Dummy data generator
  const getDummyData = (dataKey) => {
    const dummyDataMap = {
      organizations: [
        { id: 1, guid: 'org-001', name: 'ООО "Рога и копыта"' },
        { id: 2, guid: 'org-002', name: 'ПАО "Газпром"' }
      ],
      projects: [
        { id: 1, guid: 'proj-001', name: 'Проект "Альфа"' },
        { id: 2, guid: 'proj-002', name: 'Проект "Бета"' }
      ],
      cfos: [
        { id: 1, guid: 'cfo-001', name: 'ЦФО-001 - Центральный офис' },
        { id: 2, guid: 'cfo-002', name: 'ЦФО-002 - Отдел продаж' }
      ],
      documentTypes: [
        { id: 1, guid: 'doctype-001', name: 'Служебная записка' },
        { id: 2, guid: 'doctype-002', name: 'Платежное поручение' }
      ],
      ddsArticles: [
        { id: 1, guid: 'dds-001', name: 'Статья ДДС 1 - Оплата поставщикам' },
        { id: 2, guid: 'dds-002', name: 'Статья ДДС 2 - Оплата налогов' }
      ],
      budgetArticles: [
        { id: 1, guid: 'budget-001', name: 'Статья бюджета 1 - Материалы' },
        { id: 2, guid: 'budget-002', name: 'Статья бюджета 2 - Оборудование' }
      ],
      counterparties: [
        { id: 1, guid: 'counterparty-001', name: 'ООО "Поставщик №1"' },
        { id: 2, guid: 'counterparty-002', name: 'ИП "Поставщик №2"' }
      ],
      contracts: [
        { id: 1, guid: 'contract-001', name: 'Договор №1 - Поставка материалов' },
        { id: 2, guid: 'contract-002', name: 'Договор №2 - Оказание услуг' }
      ]
    };
    return dummyDataMap[dataKey] || [];
  };

  // Initialize form data based on document type
  const initializeFormData = () => {
    if (!document) return;

    const commonFields = {
      documentType: document.documentTypeGuid || document.documentTypeValue?.guid || document.documentType || '',
      documentTypeGuid: document.documentTypeGuid || document.documentTypeValue?.guid || '',
      organizationGuid: document.organizationGuid || document.organization?.guid || '',
      cfoGuid: document.cfoGuid || document.cfo?.guid || '',
      projectGuid: document.projectGuid || document.project?.guid || '',
      cfo: document.cfo || document.cfo?.name || '',
      project: document.project || document.project?.name || ''
    };

    switch (document.documentType) {
      case 'memo':
        setFormData(prev => ({
          ...prev,
          ...commonFields,
          text: document.message || document.text || '',
          organization: document.organization || document.organization?.name || ''
        }));
        break;

      case 'expenditure':
        const documentDate = document.date || document.expenseDate || '';
        const formattedDate = documentDate ? formatDateForInput(documentDate) : '';
        
        setFormData(prev => ({
          ...prev,
          ...commonFields,
          date: formattedDate,
          currency: document.currency || 'KZT',
          amount: document.amount || '',
          paymentForm: document.paymentForm || 'Наличные',
          operationType: document.operationType || 'Возврат денежных средств покупателю',
          purposeText: document.purposeText || '',
          organization: document.organization || document.organization?.name || '',
          ddsArticle: document.ddsArticle || document.ddsArticle?.name || '',
          ddsArticleGuid: document.ddsArticleGuid || document.ddsArticle?.guid || '',
          budgetArticle: document.budgetArticle || document.budgetArticle?.name || '',
          budgetArticleGuid: document.budgetArticleGuid || document.budgetArticle?.guid || '',
          counterparty: document.counterparty || document.counterparty?.name || '',
          counterpartyGuid: document.counterpartyGuid || document.counterparty?.guid || '',
          contract: document.contract || document.contract?.name || '',
          contractGuid: document.contractGuid || document.contract?.guid || ''
        }));
        
        // Fetch contracts if counterpartyGuid is available
        if (document.counterpartyGuid || (document.counterparty && document.counterparty.guid)) {
          setTimeout(() => {
            fetchData((token, documentId, counterpartyGuid) => 
              fetchContracts(token, documentId, counterpartyGuid || document.counterpartyGuid || document.counterparty?.guid), 
              'contracts');
          }, 100);
        }
        break;

      case 'payment':
        const paymentFormattedDate = document.date ? formatDateForInput(document.date) : '';
        let paymentGuid = document.paymentGuid || '';
        
        if (!paymentGuid && document.paymentLines?.length > 0) {
          paymentGuid = document.paymentLines[0].PaymentGuid || 
                       document.paymentLines[0].paymentGuid || 
                       document.paymentLines[0].guid || 
                       document.paymentLines[0].GUID || '';
        }

        // Initialize payments from document.paymentLines
        const initialPayments = (document.paymentLines || []).map((line, index) => ({
          id: index + 1,
          description: line.Заявка || line.description || '',
          details: line.НазначениеПлатежа || line.details || '',
          project: line.Проект || line.project || '',
          ersNumber: line.НомерЗрс || line.ersNumber || '',
          counterparty: line.Контрагент || line.counterparty || '',
          paymentType: line.ВидОперации || line.paymentType || 'Оплата поставщику',
          amount: parseFloat((line.Сумма || line.amount || 0).toString().replace(/\s/g, '')) || 0,
          paymentDate: line.ДатаПлатежа || line.paymentDate || new Date().toISOString(),
          guid: line.PaymentGuid || line.paymentGuid || line.guid || line.GUID || ''
        }));

        setFormData(prev => ({
          ...prev,
          ...commonFields,
          documentNumber: document.number || '',
          documentDate: paymentFormattedDate,
          paymentGuid: paymentGuid,
          payments: initialPayments,
          selectedPayments: initialPayments.map(payment => payment.id),
          organization: document.organization || document.organization?.name || ''
        }));

        // Fetch payment lines to ensure we have the latest data for this specific payment
        setTimeout(() => fetchPaymentLines(), 100);
        break;
    }
  };

  // Fetch existing attachments
  const fetchExistingAttachments = async () => {
    if (!document?.id || !document?.documentType) return;
    
    setLoadingStates(prev => ({ ...prev, attachments: true }));
    
    try {
      const token = getAuthToken();
      const requestBody = {
        username: "Администратор",
        action: "get_array_files",
        type: document.documentType,
        documentid: document.id
      };
      
      const response = await apiRequest("document_files", requestBody, token);
      
      if (response?.success === 1 && Array.isArray(response.files)) {
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
      // Don't show error to user for attachment fetching, just use empty array
      setExistingAttachments([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, attachments: false }));
    }
  };

  // Fetch payment lines
  const fetchPaymentLines = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, paymentLines: true }));
      const requestBody = {
        username: "Администратор",
        token: "",
        type: "payment"
      };
      
      const response = await apiRequest("payment-line", requestBody, "");
      
      if (Array.isArray(response)) {
        // Get the payment GUIDs for this specific document from the document's payment lines
        const documentPaymentGuids = (document.paymentLines || []).map(line => 
          line.PaymentGuid || line.paymentGuid || line.guid || line.GUID || ''
        ).filter(guid => guid);
        
        // Filter payment lines to only show those belonging to this document
        let filteredPayments = response;
        if (documentPaymentGuids.length > 0) {
          filteredPayments = response.filter(line => {
            const lineGuid = line.GUID || line.guid || '';
            return documentPaymentGuids.includes(lineGuid);
          });
        }
        
        const newPayments = filteredPayments.map((line, index) => ({
          id: index + 1,
          description: line.Наименование,
          details: line.НазначениеПлатежа || '',
          project: line.Проект || '',
          ersNumber: line.НомерЗрс || '',
          counterparty: line.Контрагент || '',
          paymentType: line.ВидОперации || '',
          amount: parseFloat(line.Сумма.toString().replace(/\s/g, '')) || 0,
          paymentDate: line.ДатаПлатежа || new Date().toISOString(),
          guid: line.GUID || line.guid
        }));
        
        setFormData(prev => ({
          ...prev,
          payments: newPayments,
          selectedPayments: newPayments.map(payment => payment.id)
        }));
      } else {
        showCustomMessage('Ошибка при загрузке данных платежей', 'danger');
      }
    } catch (error) {
      console.error("Error fetching payment lines:", error);
      showCustomMessage('Ошибка при загрузке данных платежей: ' + error.message, 'danger');
    } finally {
      setLoadingStates(prev => ({ ...prev, paymentLines: false }));
    }
  };

  // Fetch all payment lines (for fill button) - this should replace the existing one
  const fetchAllPaymentLines = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, paymentLines: true }));
      const requestBody = {
        username: "Администратор",
        token: "",
        type: "payment"
      };
      
      const response = await apiRequest("payment-line", requestBody, "");
      
      if (Array.isArray(response)) {
        // Get the payment GUIDs for this specific document from the document's payment lines
        const documentPaymentGuids = (document.paymentLines || []).map(line => 
          line.PaymentGuid || line.paymentGuid || line.guid || line.GUID || ''
        ).filter(guid => guid);
        
        // Filter out the payments that are already associated with this document
        let filteredPayments = response;
        if (documentPaymentGuids.length > 0) {
          filteredPayments = response.filter(line => {
            const lineGuid = line.GUID || line.guid || '';
            return !documentPaymentGuids.includes(lineGuid);
          });
        }
        
        const newPayments = filteredPayments.map((line, index) => ({
          id: Date.now() + index,
          description: line.Наименование,
          details: line.НазначениеПлатежа || '',
          project: line.Проект || '',
          ersNumber: line.НомерЗрс || '',
          counterparty: line.Контрагент || '',
          paymentType: line.ВидОперации || '',
          amount: parseFloat(line.Сумма.toString().replace(/\s/g, '')) || 0,
          paymentDate: line.ДатаПлатежа || new Date().toISOString(),
          guid: line.GUID || line.guid
        }));
      
        setFormData(prev => ({
          ...prev,
          payments: [...prev.payments, ...newPayments],
          selectedPayments: [...prev.selectedPayments, ...newPayments.map(payment => payment.id)]
        }));
      
        showCustomMessage('Новые платежи добавлены успешно!', 'success');
      } else {
        showCustomMessage('Ошибка при загрузке данных платежей', 'danger');
      }
    } catch (error) {
      console.error("Error fetching all payment lines:", error);
      showCustomMessage('Ошибка при загрузке данных платежей: ' + error.message, 'danger');
    } finally {
      setLoadingStates(prev => ({ ...prev, paymentLines: false }));
    }
  };

  // Initialize component
  useEffect(() => {
    if (document) {
      initializeFormData();
      fetchExistingAttachments();
      
      // Fetch all data
      Promise.all([
        fetchData(fetchOrganizations, 'organizations'),
        fetchData(fetchProjects, 'projects'),
        fetchData(fetchCFOs, 'cfos'),
        fetchData(fetchDocumentTypes, 'documentTypes'),
        fetchData(fetchDdsArticles, 'ddsArticles'),
        fetchData(fetchBudgetArticles, 'budgetArticles'),
        fetchData(fetchCounterparties, 'counterparties'),
        fetchData(fetchContracts, 'contracts')
      ]);
    }
  }, [document]);

  // Monitor document changes for attachments
  useEffect(() => {
    if (document?.id && document?.documentType) {
      fetchExistingAttachments();
    }
  }, [document?.id, document?.documentType]);

  // Fetch contracts when counterparty changes
  useEffect(() => {
    if (formData.counterpartyGuid) {
      fetchData((token, documentId, counterpartyGuid) => 
        fetchContracts(token, documentId, counterpartyGuid || formData.counterpartyGuid), 
        'contracts');
    }
  }, [formData.counterpartyGuid]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    if (field === 'documentType') {
      const selectedDocType = dataStates.documentTypes.find(type => type.guid === sanitizedValue);
      setFormData(prev => ({ 
        ...prev, 
        [field]: sanitizedValue,
        documentTypeGuid: selectedDocType ? selectedDocType.guid : sanitizedValue
      }));
    } else if (field === 'counterparty') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: sanitizedValue,
        ...(sanitizedValue ? {} : { contract: '', contractGuid: '' })
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    }
  };

  // Modal functions
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

  // Handle modal select - only compare by GUID
  const handleModalSelect = (item, type) => {
    const actualType = type || modalType;
    const fieldMap = {
      organization: { field: 'organization', guidField: 'organizationGuid' },
      project: { field: 'project', guidField: 'projectGuid' },
      cfo: { field: 'cfo', guidField: 'cfoGuid' },
      documentType: { field: 'documentType', guidField: 'documentTypeGuid' },
      ddsArticle: { field: 'ddsArticle', guidField: 'ddsArticleGuid' },
      budgetArticle: { field: 'budgetArticle', guidField: 'budgetArticleGuid' },
      counterparty: { field: 'counterparty', guidField: 'counterpartyGuid' },
      contract: { field: 'contract', guidField: 'contractGuid' }
    };

    const mapping = fieldMap[actualType];
    if (mapping) {
      setFormData(prev => ({
        ...prev,
        [mapping.field]: item.name || item.Наименование || item.title || '',
        [mapping.guidField]: item.guid || item.id || ''
      }));

      if (actualType === 'counterparty') {
        fetchData(fetchContracts, 'contracts');
      }
    }
    
    closeModal();
  };

  const getFilteredModalData = () => {
    const dataMap = {
      organization: dataStates.organizations,
      project: dataStates.projects,
      cfo: dataStates.cfos,
      documentType: dataStates.documentTypes,
      ddsArticle: dataStates.ddsArticles,
      budgetArticle: dataStates.budgetArticles,
      counterparty: dataStates.counterparties,
      contract: dataStates.contracts
    };
    
    const data = dataMap[modalType] || [];
    if (!modalSearchTerm) return data;
    
    // Filter by name (for search) but keep all items when searching
    return data.filter(item => {
      const name = item.name || item.Наименование || item.title || '';
      return name.toLowerCase().includes(modalSearchTerm.toLowerCase());
    });
  };

  // File handling
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            fileObject: reader.result.split(',')[1] || reader.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    try {
      const fileObjects = await Promise.all(filePromises);
      setArrayToUpload(prev => [...prev, ...fileObjects]);
      
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Error converting files to base64:', error);
      showCustomMessage('Ошибка при загрузке файлов: ' + error.message, 'danger');
    }
  };

  const removeFile = (fileId) => {
    const existingAttachment = existingAttachments.find(attachment => attachment.id === fileId);
    
    if (existingAttachment) {
      if (window.confirm(`Вы уверены, что хотите удалить файл "${existingAttachment.name}"?`)) {
        setArrayToRemove(prev => [...prev, {
          name: existingAttachment.name,
          guid: existingAttachment.guid
        }]);
        setExistingAttachments(prev => prev.filter(attachment => attachment.id !== fileId));
      }
    } else {
      const fileToRemove = uploadedFiles.find(file => file.id === fileId);
      if (fileToRemove) {
        setArrayToUpload(prev => {
          const fileIndex = prev.findIndex(file => file.name === fileToRemove.name);
          if (fileIndex !== -1) {
            const newArray = [...prev];
            newArray.splice(fileIndex, 1);
            return newArray;
          }
          return prev;
        });
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Payment handling functions
  const handlePaymentSelection = (id) => {
    setFormData(prev => ({
      ...prev,
      selectedPayments: prev.selectedPayments.includes(id) 
        ? prev.selectedPayments.filter(paymentId => paymentId !== id)
        : [...prev.selectedPayments, id]
    }));
  };

  const toggleSelectAllPayments = () => {
    setFormData(prev => ({
      ...prev,
      selectedPayments: prev.selectedPayments.length === prev.payments.length 
        ? [] 
        : prev.payments.map(payment => payment.id)
    }));
  };

  const updatePaymentAmount = (index, amount) => {
    setFormData(prev => {
      const updatedPayments = [...prev.payments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        amount: parseFloat(amount) || 0
      };
      return { ...prev, payments: updatedPayments };
    });
  };

  const updatePaymentDate = (index, date) => {
    setFormData(prev => {
      const updatedPayments = [...prev.payments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        paymentDate: date
      };
      return { ...prev, payments: updatedPayments };
    });
  };

  // Update document files
  const updateDocumentFiles = async (token) => {
    try {
      if (arrayToRemove.length === 0 && arrayToUpload.length === 0) {
        return { success: 1, message: "No files to update" };
      }
      
      const response = await updateDocumentFilesAPI(
        token, 
        "Администратор", 
        arrayToRemove, 
        arrayToUpload, 
        document.id, 
        document.documentType
      );
      return response;
    } catch (error) {
      console.error('Error updating document files:', error);
      showCustomMessage('Ошибка при обновлении файлов документа: ' + error.message, 'danger');
      return null;
    }
  };

  // Submit handlers for each document type
  const submitMemo = async (sanitizedFormData) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    const requestBody = {
      username: "Администратор",
      token: token,
      documentId: document.id,
      action: "update_document_memo",
      type: "memo",
      documentTypeGuid: sanitizedFormData.documentTypeGuid || document.documentTypeGuid,
      projectGuid: sanitizedFormData.projectGuid || document.projectGuid,
      organizationGuid: sanitizedFormData.organizationGuid || document.organizationGuid,
      cfoGuid: sanitizedFormData.cfoGuid || document.cfoGuid,
      text: sanitizedFormData.text || document.message
    };
    
    const response = await apiRequest("register_document_action", requestBody, token);
    
    if (response?.success === 1) {
      if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
        const fileUpdateResponse = await updateDocumentFiles(token);
        if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
          showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
        }
      }
      
      showCustomMessage('Служебная записка успешно обновлена!', 'success');
      
      if (onSave) {
        onSave({
          ...document,
          message: formData.text || document.message,
          ...(formData.documentTypeGuid && { documentTypeGuid: formData.documentTypeGuid }),
          ...(formData.projectGuid && { projectGuid: formData.projectGuid }),
          ...(formData.organizationGuid && { organizationGuid: formData.organizationGuid }),
          ...(formData.cfoGuid && { cfoGuid: formData.cfoGuid }),
          ...(formData.cfo && { cfo: formData.cfo }),
          ...(formData.project && { project: formData.project })
        });
      }
      onBack();
    } else {
      const errorMessage = response?.message || 'Неизвестная ошибка при обновлении документа';
      showCustomMessage(errorMessage, 'danger');
    }
  };

  const submitExpenditure = async (sanitizedFormData) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    const requestBody = {
      username: "Администратор",
      token: token,
      documentId: document.id,
      action: "update_document_expenditure",
      type: "expenditure",
      organizationGuid: sanitizedFormData.organizationGuid || document.organizationGuid,
      cfoGuid: sanitizedFormData.cfoGuid || document.cfoGuid,
      projectGuid: sanitizedFormData.projectGuid || document.projectGuid,
      counterpartyGuid: sanitizedFormData.counterpartyGuid || document.counterpartyGuid,
      date: sanitizedFormData.date || document.date,
      amount: sanitizedFormData.amount || document.amount,
      currency: sanitizedFormData.currency || document.currency,
      paymentForm: sanitizedFormData.paymentForm || document.paymentForm,
      operationType: sanitizedFormData.operationType || document.operationType,
      purposeText: sanitizedFormData.purposeText || document.purposeText,
      budgetArticleGuid: sanitizedFormData.budgetArticleGuid || document.budgetArticleGuid,
      ddsArticleGuid: sanitizedFormData.ddsArticleGuid || document.ddsArticleGuid,
      contractGuid: sanitizedFormData.contractGuid || document.contractGuid
    };
    
    const response = await apiRequest("register_document_action", requestBody, token);
    
    if (response?.success === 1) {
      if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
        const fileUpdateResponse = await updateDocumentFiles(token);
        if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
          showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
        }
      }
      
      showCustomMessage('Заявка на расходы успешно обновлена!', 'success');
      
      if (onSave) {
        onSave({
          ...document,
          date: formData.date || document.date,
          amount: formData.amount || document.amount,
          currency: formData.currency || document.currency,
          paymentForm: formData.paymentForm || document.paymentForm,
          operationType: formData.operationType || document.operationType,
          purposeText: formData.purposeText || document.purposeText,
          ...(formData.organizationGuid && { organizationGuid: formData.organizationGuid }),
          ...(formData.cfoGuid && { cfoGuid: formData.cfoGuid }),
          ...(formData.projectGuid && { projectGuid: formData.projectGuid }),
          ...(formData.ddsArticleGuid && { ddsArticleGuid: formData.ddsArticleGuid }),
          ...(formData.budgetArticleGuid && { budgetArticleGuid: formData.budgetArticleGuid }),
          ...(formData.counterpartyGuid && { counterpartyGuid: formData.counterpartyGuid }),
          ...(formData.contractGuid && { contractGuid: formData.contractGuid }),
          ...(formData.cfo && { cfo: formData.cfo }),
          ...(formData.project && { project: formData.project }),
          ...(formData.ddsArticle && { ddsArticle: formData.ddsArticle }),
          ...(formData.budgetArticle && { budgetArticle: formData.budgetArticle }),
          ...(formData.counterparty && { counterparty: formData.counterparty }),
          ...(formData.contract && { contract: formData.contract })
        });
      }
      onBack();
    } else {
      const errorMessage = response?.message || 'Неизвестная ошибка при обновлении документа';
      showCustomMessage(errorMessage, 'danger');
    }
  };

  const submitPayment = async (sanitizedFormData) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    // Get all selected payment lines with their current data
    const selectedPaymentLines = formData.payments.filter(payment => 
      formData.selectedPayments.includes(payment.id)
    );
    
    const requestBody = {
      username: "Администратор",
      token: token,
      documentId: document.id,
      action: "update_document_payment",
      type: "payment",
      documentNumber: sanitizedFormData.documentNumber || document.number,
      documentDate: sanitizedFormData.documentDate || document.date,
      paymentGuid: sanitizedFormData.paymentGuid || document.paymentGuid || formData.paymentGuid,
      paymentLines: selectedPaymentLines.map(payment => ({
        guid: payment.guid,
        amount: payment.amount,
        paymentDate: payment.paymentDate
      }))
    };
    
    const response = await apiRequest("register_document_action", requestBody, token);
    
    if (response?.success === 1) {
      if (arrayToUpload.length > 0 || arrayToRemove.length > 0) {
        const fileUpdateResponse = await updateDocumentFiles(token);
        if (!fileUpdateResponse || fileUpdateResponse.success !== 1) {
          showCustomMessage('Документ обновлен, но возникли проблемы с обновлением файлов', 'warning');
        }
      }
      
      showCustomMessage('Платежный документ успешно обновлен!', 'success');
      
      if (onSave) {
        const paymentLinesData = formData.payments
          .filter(payment => formData.selectedPayments.includes(payment.id))
          .map(payment => ({
            ...payment,
            guid: payment.guid || payment.GUID || payment.Заявка || '',
            amount: payment.amount !== undefined ? payment.amount : (payment.Сумма || 0),
            paymentDate: payment.paymentDate || payment.ДатаПлатежа || new Date().toISOString()
          }));
        
        const updatedDocument = mergeDocumentData(document, {
          number: formData.documentNumber || document.number,
          date: formData.documentDate || document.date,
          paymentGuid: formData.paymentGuid || document.paymentGuid,
          paymentLines: paymentLinesData,
          ...(formData.organizationGuid && { organizationGuid: formData.organizationGuid }),
          ...(formData.cfoGuid && { cfoGuid: formData.cfoGuid }),
          ...(formData.projectGuid && { projectGuid: formData.projectGuid })
        });
        
        onSave(updatedDocument);
      }
      onBack();
    } else {
      const errorMessage = response?.message || 'Неизвестная ошибка при обновлении документа';
      showCustomMessage(errorMessage, 'danger');
    }
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedFormData = sanitizeFormData(formData);
    
    if (!document.id) {
      showCustomMessage('Ошибка: отсутствует идентификатор документа', 'danger');
      return;
    }
    
    try {
      switch (document.documentType) {
        case 'memo':
          await submitMemo(sanitizedFormData);
          break;
        case 'expenditure':
          await submitExpenditure(sanitizedFormData);
          break;
        case 'payment':
          await submitPayment(sanitizedFormData);
          break;
        default:
          showCustomMessage('Неподдерживаемый тип документа', 'danger');
      }
    } catch (error) {
      console.error(`Error updating ${document.documentType}:`, error);
      showCustomMessage(`Ошибка при обновлении документа: ${error.message}`, 'danger');
    }
  };

  const handleCancel = () => {
    onBack();
  };

  // Validation check
  if (!document || !['memo', 'expenditure', 'payment'].includes(document.documentType)) {
    return (
      <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className="content-card">
          <div className="card-header">
            <h2>Ошибка</h2>
            <button className="back-button" onClick={onBack}>
              <i className="fas fa-arrow-left"></i> Назад
            </button>
          </div>
          <p>Невозможно редактировать данный тип документа</p>
        </div>
      </div>
    );
  }

  const documentTypeMap = {
    memo: 'Редактировать Служебную Записку',
    payment: 'Редактировать Платежный Документ',
    expenditure: 'Редактировать Заявку на Расходы'
  };

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <h2>{documentTypeMap[document.documentType]}</h2>
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>

      {/* Form */}
      <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <form onSubmit={handleSubmit}>
          {document.documentType === 'memo' && (
            <MemoEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              documentTypes={dataStates.documentTypes}
              loadingDocumentTypes={loadingStates.documentTypes}
              organizations={dataStates.organizations}
              loadingOrganizations={loadingStates.organizations}
              cfos={dataStates.cfos}
              projects={dataStates.projects}
              openModal={openModal}
              handleFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              formatFileSize={formatFileSize}
              existingAttachments={existingAttachments}
              loadingAttachments={loadingStates.attachments}
            />
          )}

          {document.documentType === 'payment' && (
            <PaymentEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              fetchPaymentLines={fetchPaymentLines}
              fetchAllPaymentLines={fetchAllPaymentLines}
              loadingPaymentLines={loadingStates.paymentLines}
              handlePaymentSelection={handlePaymentSelection}
              toggleSelectAllPayments={toggleSelectAllPayments}
              updatePaymentAmount={updatePaymentAmount}
              updatePaymentDate={updatePaymentDate}
            />
          )}

          {document.documentType === 'expenditure' && (
            <ExpenditureEdit
              formData={formData}
              handleInputChange={handleInputChange}
              theme={theme}
              cfos={dataStates.cfos}
              projects={dataStates.projects}
              ddsArticles={dataStates.ddsArticles}
              budgetArticles={dataStates.budgetArticles}
              counterparties={dataStates.counterparties}
              contracts={dataStates.contracts}
              openModal={openModal}
              handleFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              formatFileSize={formatFileSize}
              existingAttachments={existingAttachments}
              loadingAttachments={loadingStates.attachments}
            />
          )}

          {/* Form Actions */}
          <div className="action-buttons">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              <i className="fas fa-times"></i> Отмена
            </button>
            <button type="submit" className="btn btn-primary">
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
            <button type="button" className="modal-close-button" onClick={closeModal}>
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
            {getFilteredModalData().map(item => {
              const guidFieldMap = {
                organization: 'organizationGuid',
                project: 'projectGuid',
                cfo: 'cfoGuid',
                ddsArticle: 'ddsArticleGuid',
                budgetArticle: 'budgetArticleGuid',
                counterparty: 'counterpartyGuid',
                contract: 'contractGuid'
              };
              
              // Only compare by GUID for selection
              const isItemSelected = item.guid === formData[guidFieldMap[modalType]];
              
              return (
                <div 
                  key={item.guid || item.id}
                  onClick={() => handleModalSelect(item, modalType)}
                  className={`modal-result-item ${isItemSelected ? 'selected' : ''} ${theme?.mode === 'dark' ? 'dark' : ''}`}
                >
                  {item.name}
                  {isItemSelected && <i className="fas fa-check selected-icon"></i>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEdit;