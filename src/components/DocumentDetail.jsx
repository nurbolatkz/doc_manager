import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { 
  fetchDocumentDetailsByType, 
  declineDocument, 
  deleteDocument,
  fetchDocumentRoutes,
  getSigningTemplate,
  saveSignedDocument,
  saveSignedDocumentAndApprove
} from '../services/fetchManager';
import ConfirmModal from './ConfirmModal';
import SigexQRModal from './SigexQRModal';

const DocumentDetail = ({ document, onBack, onDelete }) => {
  const [documentDetail, setDocumentDetail] = useState(document);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false); // Track if we've attempted to fetch details
  const [deleting, setDeleting] = useState(false); // Track if we're deleting
  const [declining, setDeclining] = useState(false); // Track if we're declining
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // State for delete confirmation modal
  const [showDeclineConfirmModal, setShowDeclineConfirmModal] = useState(false); // State for decline confirmation modal
  const [routeSteps, setRouteSteps] = useState([]); // State for route steps
  
  // Sigex signing state
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [signingAction, setSigningAction] = useState(null);
  const [signingLoading, setSigningLoading] = useState(false);

  // Parse date strings in format "dd.mm.yyyy hh:mm:ss"
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // Handle format "dd.mm.yyyy hh:mm:ss"
    if (dateString.includes('.') && dateString.includes(':')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('.');
      const [hour, minute, second] = timePart.split(':');
      return new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Try to parse as standard date string
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    
    const parsedDate = parseDateString(date);
    if (!parsedDate) return '-';
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(parsedDate);
  };

  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'payment':
        return 'Заявка на оплату';
      case 'memo':
        return 'Служебная записка';
      case 'invoice':
        return 'Счет-фактура';
      case 'expenditure':
        return 'Заявка На Расходы';
      case 'leave':
        return 'Заявление на отпуск';
      case 'payment_request':
        return 'Запрос на оплату';
      default:
        return type;
    }
  };

  const formatCurrency = (amount = 0, currency = 'KZT') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on_approving':
        return 'На согласовании';
      case 'declined':
        return 'Отклонено';
      case 'approved':
        return 'Утверждено';
      case 'prepared':
        return 'Подготовлено';
      case 'rejected':
        return 'Отклонен';
      default:
        return 'На согласовании';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'on_approving':
        return 'status-on_approving';
      case 'declined':
      case 'rejected':
        return 'status-rejected';
      case 'prepared':
        return 'status-prepared';
      default:
        return 'status-on_approving';
    }
  };

  // Fetch detailed document data when component mounts
  useEffect(() => {
    const fetchDocumentDetail = async () => {
      // If we already have detailed data, no need to fetch
      if (documentDetail && documentDetail.documentType && documentDetail.id && !fetchAttempted) {
        // Check if we have basic info but not detailed info
        const hasBasicInfo = (documentDetail.title || documentDetail.number) && documentDetail.uploadDate;
        const hasDetailedFields = documentDetail.hasOwnProperty('payments') || 
                                  documentDetail.hasOwnProperty('project') || 
                                  documentDetail.hasOwnProperty('expenseDate') ||
                                  documentDetail.hasOwnProperty('author');
        
        // Only fetch if we don't have detailed fields yet
        if (hasBasicInfo && !hasDetailedFields) {
          setFetchAttempted(true); // Mark that we've attempted to fetch
          setLoading(true);
          try {
            const token = localStorage.getItem('authToken');
            if (!token) {
              throw new Error('No authentication token found');
            }
            
            // Fetch document details based on document type and ID
            const detailData = await fetchDocumentDetailsByType(
              token, 
              documentDetail.documentType, 
              documentDetail.id
            );
            
            if (detailData && detailData.data) {
              // Transform the fetched data to match our Document type
              const transformedData = {
                ...documentDetail,
                ...detailData.data,
                // Ensure we keep existing properties that might not be in the response
                id: documentDetail.id,
                documentType: documentDetail.documentType,
                title: detailData.data.title || documentDetail.title,
                amount: detailData.data.amount !== undefined ? 
                  parseFloat(detailData.data.amount) : documentDetail.amount,
                currency: detailData.data.currency || documentDetail.currency,
                uploadDate: detailData.data.date || documentDetail.uploadDate,
                status: detailData.data.status || documentDetail.status
              };
              
              setDocumentDetail(transformedData);
            }
          } catch (err) {
            setError('Failed to load document details');
            console.error('Error fetching document details:', err);
          } finally {
            setLoading(false);
          }
        } else if (hasDetailedFields) {
          // If we already have detailed fields, mark fetch as attempted to prevent future attempts
          setFetchAttempted(true);
        }
      }
    };

    fetchDocumentDetail();
  }, []); // Empty dependency array to run only once on mount

  // Fetch route steps data
  useEffect(() => {
    const fetchRouteSteps = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Fetch document routes based on document type and ID
        const routeData = await fetchDocumentRoutes(token, documentDetail.documentType, documentDetail.id);
        console.log('Document routes fetched from 1C backend:', routeData);
        
        if (routeData && routeData.data && Array.isArray(routeData.data)) {
          // Transform the fetched route data to match our route steps structure
          const transformedRoutes = routeData.data
            .map((route, index) => {
              // Find the current step based on status
              let status = 'pending';
              if (route.status === 'approved') {
                status = 'approved';
              } else if (route.status === 'rejected') {
                status = 'rejected';
              }
              
              // Extract users from the route data
              let users = [''];
              if (route.users && Array.isArray(route.users)) {
                // Split each user by newlines and flatten into a single array
                users = route.users.flatMap(user => 
                  user.split('\n').filter(line => line.trim() !== '')
                );
                // If no valid users after splitting, use a default
                if (users.length === 0) users = [''];
              }
              
              return {
                id: route.id || `step-${index}`,
                stepNumber: route.order !== undefined ? route.order + 1 : index + 1,
                title: route.step_title || `Шаг ${index + 1}`,
                users: users,
                status: status,
                comment: route.info || ''
              };
            })
            .sort((a, b) => a.stepNumber - b.stepNumber); // Sort by step number to ensure correct order
          
          setRouteSteps(transformedRoutes);
        }
      } catch (err) {
        console.error('Error fetching document routes:', err);
        // Continue even if route fetch fails
      }
    };

    // Only fetch routes if we have document details
    if (documentDetail && documentDetail.documentType && documentDetail.id) {
      fetchRouteSteps();
    }
  }, [documentDetail]);

  // Render specific fields based on document type
  const renderDocumentSpecificFields = () => {
    if (!documentDetail) return null;

    switch (documentDetail.documentType) {
      case 'payment':
        return (
          <>
            <div className="content-card">
              <div className="section-header">
                <i className="fas fa-info-circle"></i>
                Информация о документе
              </div>
              
              <div className="info-grid">
                <div className="detail-card">
                  <div className="detail-item">
                    <span className="detail-label">Номер:</span>
                    <span className="detail-value">{documentDetail.number || 'Не указано'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Дата:</span>
                    <span className="detail-value">{formatDate(documentDetail.date) || 'Не указано'}</span>
                  </div>
                </div>
                
                <div className="detail-card">
                  <div className="detail-item">
                    <span className="detail-label">Ответственный:</span>
                    <span className="detail-value">{documentDetail.responsible || 'Не указано'}</span>
                  </div>
                </div>
                
                <div className="detail-card">
                  <div className="detail-item">
                    <span className="detail-label">Комментарий:</span>
                    <span className="detail-value">{documentDetail.comment || 'Не указано'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="content-card">
              <div className="table-section">
                <div className="section-header">
                  <i className="fas fa-table"></i>
                  Запланированные платежи
                </div>
                
                <div className="table-container">
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Заявка</th>
                        <th>Организация</th>
                        <th>Проект</th>
                        <th>Вид операции</th>
                        <th>Контрагент</th>
                        <th>Форма оплаты</th>
                        <th>Валюта</th>
                        <th>Дата по заявке</th>
                        <th>Сумма по заявке</th>
                        <th>Дата платежа</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentDetail.payments && documentDetail.payments.length > 0 ? (
                        documentDetail.payments.map((payment, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{payment.request || 'Не указано'}</td>
                            <td>{payment.organization || 'Не указано'}</td>
                            <td>{payment.project || 'Не указано'}</td>
                            <td>{payment.operationType || 'Не указано'}</td>
                            <td>{payment.counterparty || 'Не указано'}</td>
                            <td>{payment.paymentForm || 'Не указано'}</td>
                            <td>{payment.currency || 'Не указано'}</td>
                            <td>{formatDate(payment.requestDate) || 'Не указано'}</td>
                            <td>{payment.requestAmount?.toString() || 'Не указано'}</td>
                            <td>{formatDate(payment.paymentDate) || 'Не указано'}</td>
                            <td>{payment.amount?.toString() || 'Не указано'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={12} className="text-center">
                            Нет запланированных платежей
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'memo':
        return (
          <div className="content-card">
            <div className="section-header">
              <i className="fas fa-info-circle"></i>
              Информация о документе
            </div>
            
            <div className="info-grid">
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Дата:</span>
                  <span className="detail-value">{formatDate(documentDetail.date) || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Автор:</span>
                  <span className="detail-value">{documentDetail.author || 'Не указано'}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Ответственный:</span>
                  <span className="detail-value">{documentDetail.responsible || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Проект:</span>
                  <span className="detail-value">{documentDetail.project || 'Не указано'}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Сообщение:</span>
                  <span className="detail-value">{documentDetail.message || 'Не указано'}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item hidden">
                  <span className="detail-label">Тип документа:</span>
                  <span className="detail-value">{documentDetail.documentType || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ЦФО:</span>
                  <span className="detail-value">{documentDetail.cfo || 'Не указано'}</span>
                </div>
              </div>

              <div className="detail-card" style={{ gridColumn: 'span 3' }}>
                <div className="detail-item">
                  <span className="detail-label">Заголовок:</span>
                  <span className="detail-value">{documentDetail.title || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'expenditure':
      case 'payment_request':
        return (
          <div className="content-card">
            <div className="section-header">
              <i className="fas fa-info-circle"></i>
              Информация о документе
            </div>
            
            <div className="info-grid">
              {/* Group 1: Дата Дата Расхода Вид Операции */}
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Дата:</span>
                  <span className="detail-value">{formatDate(documentDetail.date) || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Дата Расхода:</span>
                  <span className="detail-value">{formatDate(documentDetail.expenseDate) || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Вид Операции:</span>
                  <span className="detail-value">{documentDetail.operationType || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Group 2: Контрагент Договор Контрагента */}
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Контрагент:</span>
                  <span className="detail-value">{documentDetail.counterparty || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Договор Контрагента:</span>
                  <span className="detail-value">{documentDetail.contract || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Group 3: Проект ЦФО */}
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Проект:</span>
                  <span className="detail-value">{documentDetail.project || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ЦФО:</span>
                  <span className="detail-value">{documentDetail.cfo || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Group 4: Валюта Документа Форма Оплаты Сумма Взаиморасчетов Сумма Документа Ставка НДС */}
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Валюта Документа:</span>
                  <span className="detail-value">{documentDetail.currency || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Форма Оплаты:</span>
                  <span className="detail-value">{documentDetail.paymentForm || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Сумма Взаиморасчетов:</span>
                  <span className="detail-value">{documentDetail.amountOfSettlements || 'Не указано'}</span>
                </div>
                <div className="detail-item hidden">
                  <span className="detail-label">Сумма Документа:</span>
                  <span className="detail-value">
                    {documentDetail.amount ? formatCurrency(documentDetail.amount) : 'Не указано'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ставка НДС:</span>
                  <span className="detail-value">{documentDetail.VATRate || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Group 5: Организационная Структура Статья Движения Денежных Средств Статья Бюджет */}
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Организационная Структура:</span>
                  <span className="detail-value">{documentDetail.orgStructure || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Статья Движения Денежных Средств:</span>
                  <span className="detail-value">{documentDetail.ddsArticle || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Статья Бюджет:</span>
                  <span className="detail-value">{documentDetail.budgetArticle || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Group 6: Комментарий Ответственный Автор */}
              <div className="detail-card" style={{ gridColumn: 'span 3' }}>
                <div className="detail-item">
                  <span className="detail-label">Комментарий:</span>
                  <span className="detail-value">{documentDetail.comment || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ответственный:</span>
                  <span className="detail-value">{documentDetail.responsible || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Автор:</span>
                  <span className="detail-value">{documentDetail.author || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="content-card">
            <div className="section-header">
              <i className="fas fa-info-circle"></i>
              Информация о документе
            </div>
            
            <div className="info-grid">
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Дата:</span>
                  <span className="detail-value">{formatDate(documentDetail.date) || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Автор:</span>
                  <span className="detail-value">{documentDetail.author || 'Не указано'}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Ответственный:</span>
                  <span className="detail-value">{documentDetail.responsible || 'Не указано'}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Комментарий:</span>
                  <span className="detail-value">{documentDetail.comment || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Render route steps component
  const renderRouteSteps = () => {
    if (!routeSteps || routeSteps.length === 0) {
      return (
        <div className="content-card">
          <div className="section-header">
            <i className="fas fa-route"></i>
            Маршрут документа
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            <i className="fas fa-route text-3xl mb-2"></i>
            <p>Маршрут документа не настроен</p>
          </div>
        </div>
      );
    }

    const getStepStatusClass = (index, status) => {
      if (status === 'approved') return 'approved';
      if (status === 'rejected') return 'rejected';
      // We don't have currentStep info in our current implementation, so we'll just use pending for all other cases
      return 'pending';
    };

    const getStepStatusIcon = (status) => {
      switch (status) {
        case 'approved': return 'fas fa-check';
        case 'rejected': return 'fas fa-times';
        default: return 'fas fa-hourglass-half';
      }
    };

    return (
      <div className="content-card">
        <div className="section-header">
          <i className="fas fa-route"></i>
          Маршрут документа
        </div>
        
        <div className="route-flow-container space-y-4">
          <div className="route-start-icon flex items-center text-green-500">
            <i className="fas fa-play-circle mr-3 text-xl"></i>
            <span className="text-sm font-medium">Начало маршрута</span>
          </div>
          
          <div className="route-steps-container space-y-4 ml-8">
            {routeSteps.map((step, index) => {
              const statusClass = getStepStatusClass(index, step.status);
              const statusIcon = getStepStatusIcon(step.status);
              
              // Get users for this step and flatten any multi-line users into separate users
              let users = [''];
              if (step.users && step.users.length > 0) {
                // Split each user by newlines and flatten into a single array
                users = step.users.flatMap(user => 
                  user.split('\n').filter(line => line.trim() !== '')
                );
                // If no valid users after splitting, use a default
                if (users.length === 0) users = [''];
              }
              
              return (
                <div 
                  key={step.id} 
                  className={`route-step ${statusClass}`}
                  data-index={index}
                >
                  <div className="icon">
                    <i className={statusIcon}></i>
                  </div>
                  <div className="route-step-info">
                    <strong>{step.title || `Шаг ${index + 1}`}</strong>
                    <ul className="user-list">
                      {users.map((user, userIndex) => (
                        <li key={userIndex}>
                          <i className="far fa-user mr-1"></i>
                          {user}
                        </li>
                      ))}
                    </ul>
                    {step.comment && <span>{step.comment}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="route-finish-icon flex items-center text-blue-500">
            <i className="fas fa-flag-checkered mr-3 text-xl"></i>
            <span className="text-sm font-medium">Завершение маршрута</span>
          </div>
        </div>
      </div>
    );
  };

  // Render attachments component
  const renderAttachments = () => {
    const attachments = documentDetail?.attachments || [];
    
    return (
      <div className="content-card">
        <div className="section-header">
          <i className="fas fa-paperclip"></i>
          Вложения
        </div>
        
        {attachments.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            <i className="fas fa-paperclip text-3xl mb-2"></i>
            <p>Нет вложений</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Файл</th>
                  <th>Размер</th>
                  <th>Дата загрузки</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map(attachment => {
                  const getFileIcon = (fileType) => {
                    if (fileType?.includes('pdf')) return 'fas fa-file-pdf';
                    if (fileType?.includes('image')) return 'fas fa-file-image';
                    if (fileType?.includes('word')) return 'fas fa-file-word';
                    if (fileType?.includes('excel')) return 'fas fa-file-excel';
                    if (fileType?.includes('zip')) return 'fas fa-file-archive';
                    return 'fas fa-file';
                  };

                  const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                  };

                  return (
                    <tr key={attachment.id}>
                      <td>
                        <div className="file-info">
                          <i className={`${getFileIcon(attachment.mimeType)} file-icon`}></i>
                          <span>{attachment.fileName}</span>
                        </div>
                      </td>
                      <td>{formatFileSize(attachment.fileSize)}</td>
                      <td>{formatDate(attachment.uploadDate)}</td>
                      <td>
                        <div className="action-buttons inline">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => console.log(`Downloading ${attachment.fileName}`)}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Function to handle document decline
  const handleDeclineDocument = async () => {
    if (!documentDetail) return;
    
    try {
      setDeclining(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Send the decline request to the backend
      const response = await declineDocument(
        token,
        documentDetail.documentType,
        documentDetail.id
      );
      
      console.log('Document declined:', response);
      
      // Check if response has success flag
      if (response && response.success === 1) {
        // Update document status to declined
        setDocumentDetail({
          ...documentDetail,
          status: 'declined'
        });
        
        // Show success message
        // Replace alert with a more elegant solution if needed
        // For now, we'll use a simple alert as requested
        alert('Document declined successfully');
      } else {
        throw new Error(response?.message || 'Failed to decline document');
      }
    } catch (err) {
      console.error('Error declining document:', err);
      setError(err.message || 'Failed to decline document');
      alert('Failed to decline document: ' + (err.message || 'Unknown error'));
    } finally {
      setDeclining(false);
      setShowDeclineConfirmModal(false);
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async () => {
    if (!documentDetail) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Send the delete request to the backend
      const response = await deleteDocument(
        token,
        documentDetail.documentType,
        documentDetail.id
      );
      
      console.log('Document deleted:', response);
      
      // Check if response has success flag
      if (response && response.success === 1) {
        // Show success message and notify parent component
        alert('Document deleted successfully');
        if (onDelete) {
          onDelete(documentDetail.id);
        }
        onBack();
      } else {
        throw new Error(response?.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
      alert('Failed to delete document: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
      setShowDeleteConfirmModal(false);
    }
  };

  // Action button click handlers
  const handleActionButtonClick = (action) => {
    switch (action) {
      case 'decline':
        setShowDeclineConfirmModal(true);
        break;
      case 'delete':
        setShowDeleteConfirmModal(true);
        break;
      default:
        alert(`Clicked button: ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="document-detail-container">
        <div className="content-card">
          <div className="card-header">
            <h2>Детали документа</h2>
            <button 
              className="back-button"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left"></i> Назад
            </button>
          </div>
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-3x"></i>
            <p>Загрузка деталей документа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-detail-container">
        <div className="content-card">
          <div className="card-header">
            <h2>Детали документа</h2>
            <button 
              className="back-button"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left"></i> Назад
            </button>
          </div>
          <div className="error-container">
            <i className="fas fa-exclamation-triangle fa-3x"></i>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle approval with signing
  const handleApproveWithSigning = async () => {
    if (!documentDetail) return;
    
    try {
      setSigningLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching signing template for document:', {
        documentType: documentDetail.documentType,
        documentId: documentDetail.id
      });
      
      // Get signing template
      const templateResponse = await getSigningTemplate(
        token,
        documentDetail.documentType,
        documentDetail.id
      );
      
      console.log('Template response received:', templateResponse);
      
      // Always try to process the response, even if success flag is missing
      if (templateResponse) {
        // Extract document info from response - handling both possible structures
        let documentInfo, binaryData, metadata;
        
        // Check if response has ПараметрыПодчФормы structure
        if (templateResponse.hasOwnProperty('ПараметрыПодчФормы')) {
          documentInfo = templateResponse.ПараметрыПодчФормы?.ДанныеПодисываемогоДокумента;
          binaryData = templateResponse.ПараметрыПодчФормы?.ДвоичДанные;
          metadata = templateResponse.ПараметрыПодчФормы?.ДанныеДляРС;
        } 
        // Check if response has data structure
        else if (templateResponse.hasOwnProperty('data')) {
          documentInfo = templateResponse.data?.ДанныеПодчФормы?.ДанныеПодисываемогоДокумента;
          binaryData = templateResponse.data?.ДвоичДанные;
          metadata = templateResponse.data?.ДанныеДляРС;
        }
        // Check if response has direct structure
        else {
          documentInfo = templateResponse?.ДанныеПодчФормы?.ДанныеПодисываемогоДокумента;
          binaryData = templateResponse?.ДвоичДанные;
          metadata = templateResponse?.ДанныеДляРС;
        }
        
        console.log('Extracted template data:', {
          documentInfo,
          binaryData: binaryData ? `${binaryData.substring(0, 50)}...` : null,
          metadata
        });
        
        // Log the size of the template data
        if (binaryData) {
          console.log('Template size:', binaryData.length, 'characters');
        }
        
        // Check if we have the required data
        if (!binaryData) {
          throw new Error('Не удалось получить данные документа для подписания');
        }
        
        // Store template data in document state
        const updatedDocument = {
          ...documentDetail,
          signingTemplate: {
            binaryData,
            documentInfo,
            metadata
          }
        };
        
        console.log('Setting document detail with signing template');
        setDocumentDetail(updatedDocument);
        console.log('Setting signing action to: approve');
        setSigningAction('approve');
        console.log('Setting showSigningModal to true');
        setShowSigningModal(true);
        console.log('State update completed');
      } else {
        throw new Error('Failed to get signing template for approve');
      }
    } catch (err) {
      console.error('Error getting signing template for approve:', err);
      const errorMessage = err.message || 'Failed to get signing template for approve';
      setError(errorMessage);
    } finally {
      setSigningLoading(false);
    }
  };

  // Function to handle SIGEX signing completion
  const handleSigningComplete = (signedDocuments) => {
    console.log('SIGEX signing completed with documents:', signedDocuments);
    if (!documentDetail || !signingAction) return;
    
    try {
      // Close the SIGEX modal
      setShowSigningModal(false);
      
      // Send the signed document to the backend for approval
      const sendSignedDocument = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          // First, save the signed document data
          
          if (documentDetail.signingTemplate?.metadata) {
            const saveResponse = await saveSignedDocument(
              token,
              documentDetail.id,
              documentDetail.documentType,
              signedDocuments[0]?.data || '', // Pass the signed document data
              documentDetail.signingTemplate.metadata // Pass the metadata
            );
            
            console.log('Signed document saved:', saveResponse);
            
            if (saveResponse && saveResponse.success !== 1) {
              throw new Error(saveResponse?.message || 'Failed to save signed document');
            }
          }
          
          // Then, send the signed document to the backend for approval
          const response = await saveSignedDocumentAndApprove(
            token,
            documentDetail.documentType,
            documentDetail.id,
            signedDocuments[0]?.data || '' // Pass the signed document data
          );
          
          console.log('Signed document saved and approved:', response);
          
          // Check if response has success flag
          if (response && response.success === 1) {
            // Update document status to approved
            setDocumentDetail({
              ...documentDetail,
              status: 'approved'
            });
            
            // Refetch routes to update the route steps
            try {
              const routeData = await fetchDocumentRoutes(token, documentDetail.documentType, documentDetail.id);
              console.log('Document routes refetched from 1C backend:', routeData);
              
              if (routeData && routeData.data && Array.isArray(routeData.data)) {
                // Transform the fetched route data to match our route steps structure
                const transformedRoutes = routeData.data
                  .map((route, index) => {
                    // Find the current step based on status
                    let status = 'pending';
                    if (route.status === 'approved') {
                      status = 'approved';
                    } else if (route.status === 'rejected') {
                      status = 'rejected';
                    }
                    
                    // Extract users from the route data
                    let users = [''];
                    if (route.users && Array.isArray(route.users)) {
                      // Split each user by newlines and flatten into a single array
                      users = route.users.flatMap(user => 
                        user.split('\n').filter(line => line.trim() !== '')
                      );
                      // If no valid users after splitting, use a default
                      if (users.length === 0) users = [''];
                    }
                    
                    return {
                      id: route.id || `step-${index}`,
                      stepNumber: route.order !== undefined ? route.order + 1 : index + 1,
                      title: route.step_title || `Шаг ${index + 1}`,
                      users: users,
                      status: status,
                      comment: route.info || ''
                    };
                  })
                  .sort((a, b) => a.stepNumber - b.stepNumber); // Sort by step number to ensure correct order
              
                setRouteSteps(transformedRoutes);
              }
            } catch (routeError) {
              console.error('Error refetching document routes:', routeError);
              // Continue even if route fetch fails
            }
          }
          
          // Show success message
          alert('Document approved successfully');
        } catch (err) {
          console.error('Error saving signed document:', err);
          setError(err.message || 'Failed to save signed document');
          alert('Failed to approve document: ' + (err.message || 'Unknown error'));
        }
      };
      
      // Execute the function
      sendSignedDocument();
    } catch (err) {
      console.error('Error handling signed document:', err);
      setError(err.message || 'Failed to process signed document');
    }
  };

  return (
    <div className="document-detail-container">
      <div className="content-card">
        <div className="card-header">
          <h2>Детали документа</h2>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
        
        <div className="document-detail">
          {/* Common Document Information */}
          <div className="content-card">
            <div className="section-header">
              <i className="fas fa-file-alt"></i>
              Основная информация
            </div>
            
            <div className="info-grid">
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Название</span>
                  <span className="detail-value">{documentDetail?.title || 'Без названия'}</span>
                </div>
                <div className="detail-item hidden">
                  <span className="detail-label">ID</span>
                  <span className="detail-value">{documentDetail?.id || 'Не указан'}</span>
                </div>
                <div className="detail-item hidden">
                  <span className="detail-label">Тип документа</span>
                  <span className="detail-value">{getDocumentTypeText(documentDetail?.documentType)}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Сумма</span>
                  <span className="detail-value">
                    {documentDetail?.amount ? formatCurrency(documentDetail.amount, documentDetail.currency) : '-'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Дата создания</span>
                  <span className="detail-value">{formatDate(documentDetail?.uploadDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Автор</span>
                  <span className="detail-value">
                    {documentDetail?.uploadedBy ? documentDetail.uploadedBy.name : '-'}
                  </span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">Статус</span>
                  <span className="detail-value">
                    <span className={`status-badge ${getStatusBadgeClass(documentDetail?.status)}`}>
                      {getStatusText(documentDetail?.status)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {documentDetail?.description && (
              <div className="detail-card mt-3">
                <div className="detail-item">
                  <span className="detail-label">Описание</span>
                  <span className="detail-value">{documentDetail.description}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Document Action Buttons */}
          <div className="content-card">
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => handleActionButtonClick('send-to-route')}
                disabled={
                  !documentDetail || 
                  (documentDetail.status !== 'prepared' && documentDetail.status !== 'declined')
                }
              >
                <i className="fas fa-paper-plane"></i>
                Отправить на маршрут
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleApproveWithSigning}
                disabled={
                  !documentDetail || 
                  documentDetail.status !== 'on_approving' ||
                  signingLoading
                }
              >
                {signingLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Подготовка...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Согласовать
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => setShowDeclineConfirmModal(true)}
                disabled={
                  declining ||
                  !documentDetail || 
                  documentDetail.status !== 'on_approving'
                }
              >
                {declining ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Отклонение...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i>
                    Отклонить
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => handleActionButtonClick('edit')}
                disabled={
                  !documentDetail || 
                  (documentDetail.status !== 'prepared' && documentDetail.status !== 'rejected')
                }
              >
                <i className="fas fa-edit"></i>
                Редактировать
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirmModal(true)}
                disabled={
                  deleting ||
                  !documentDetail || 
                  (documentDetail.status !== 'prepared' && documentDetail.status !== 'rejected')
                }
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Удаление...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Удалить
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Document-specific fields */}
          {renderDocumentSpecificFields()}
          
          {/* Route steps */}
          {renderRouteSteps()}
          
          {/* Attachments */}
          {renderAttachments()}
        </div>
      </div>
      
      {/* Confirmation Modal for Declining Document */}
      <ConfirmModal
        isOpen={showDeclineConfirmModal}
        onClose={() => setShowDeclineConfirmModal(false)}
        onConfirm={handleDeclineDocument}
        title="Отклонить документ"
        message="Вы уверены, что хотите отклонить этот документ? Это действие нельзя отменить."
        confirmText="Отклонить"
        cancelText="Отмена"
      />
      
      {/* Confirmation Modal for Deleting Document */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeleteDocument}
        title="Удалить документ"
        message="Вы уверены, что хотите удалить этот документ? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
      
      {/* SIGEX Signing Modal */}
      <SigexQRModal
        isOpen={showSigningModal}
        onClose={() => setShowSigningModal(false)}
        onSigningComplete={handleSigningComplete}
        documentData={documentDetail?.signingTemplate?.binaryData}
        documentInfo={documentDetail?.signingTemplate?.documentInfo}
      />
    </div>
  );
};

export default DocumentDetail;