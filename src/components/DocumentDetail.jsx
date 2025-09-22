import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { 
  fetchDocumentDetailsByType, 
  declineDocument, 
  deleteDocument,
  fetchDocumentRoutes,
  getSigningTemplate,
  saveSignedDocument,
  saveSignedDocumentAndApprove,
  sendDocumentToRoute,
  checkAccessToApproveDecline,
  getUsersList,
  getRouteTitles,
  sendToFreeRoute,
  getDocumentRouteType
} from '../services/fetchManager';
import { showCustomMessage } from '../utils';
import { t } from '../utils/messages';
import { sanitizeInput } from '../utils/inputSanitization';
import { mergeDocumentData, needsDetailedData, standardizeDocumentType, parseDateString, formatDate } from '../utils/documentUtils';
import ConfirmModal from './ConfirmModal';
import SigexQRModal from './SigexQRModal';
import Attachments from './Attachments';
import RouteSteps from './RouteSteps';
import DocumentSpecificFields from './DocumentSpecificFields';

const DocumentDetail = ({ document, onBack, onDelete, onEdit, theme }) => {
  console.log('DocumentDetail: Component rendered with document prop:', document);
  
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
  
  // Send to route state
  const [sendingToRoute, setSendingToRoute] = useState(false);
  const [routeSent, setRouteSent] = useState(false);
  
  // Free route state
  const [routeTitles, setRouteTitles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [loadingRouteTitles, setLoadingRouteTitles] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});
  
  // Route type state
  const [routeType, setRouteType] = useState(null);
  const [loadingRouteType, setLoadingRouteType] = useState(false);
  const [routeTypeRetryCount, setRouteTypeRetryCount] = useState(0);

  // Reset fetchAttempted when document changes
  useEffect(() => {
    setFetchAttempted(false);
  }, [document?.id, document?.documentType]);

  // Parse date strings in format "dd.mm.yyyy hh:mm:ss"
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // Handle format "dd.mm.yyyy" (date only)
    if (dateString.includes('.') && !dateString.includes(':')) {
      const [day, month, year] = dateString.split('.');
      // Check if we have valid date components
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }
    
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
    // Fix the typo in documentType using standardizeDocumentType
    const correctedType = standardizeDocumentType(type);
    
    switch (correctedType) {
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
        return correctedType;
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

  // Fetch detailed document data when component mounts or when document prop changes
  useEffect(() => {
    console.log('DocumentDetail: useEffect triggered with document:', document);
    
    const fetchDocumentDetail = async () => {
      // Always fetch detailed data when opening document detail from anywhere
      // This ensures we get the most up-to-date information regardless of how we got here
      if (document && document.documentType && document.id) {
        console.log('DocumentDetail: Always fetching detailed document data for ID:', document.id);
        
        // Fix the typo in documentType
        const correctedDocumentType = standardizeDocumentType(document.documentType);
        
        setDocumentDetail(document); // Set initial document data
        setFetchAttempted(true); // Mark that we've attempted to fetch
        setLoading(true);
        try {
          const token = (() => {
            try {
              return sessionStorage.getItem('authToken');
            } catch (e) {
              return null;
            }
          })();
          if (!token) {
            showCustomMessage('No authentication token found', 'danger');
            return;
          }
          
          console.log('DocumentDetail: Calling fetchDocumentDetailsByType with:', {
            token: token ? 'present' : 'missing',
            documentType: correctedDocumentType, // Use corrected document type
            documentId: document.id
          });
          
          // Fetch document details based on document type and ID
          const detailData = await fetchDocumentDetailsByType(
            token, 
            correctedDocumentType, // Use corrected document type
            document.id
          );
          console.log('DocumentDetail: Received detailData from backend:', detailData);
          // console.log('Detail Data:', detailData);
          if (detailData && detailData.data) {
            // Transform the fetched data to match our Document type
            const transformedData = {
              ...document,
              ...detailData.data,
              // Ensure we keep existing properties that might not be in the response
              id: document.id,
              documentType: correctedDocumentType, // Use corrected document type
              title: detailData.data.title || document.title,
              amount: detailData.data.amount !== undefined ? 
                parseFloat(detailData.data.amount) : document.amount,
              currency: detailData.data.currency || document.currency,
              uploadDate: detailData.data.date || document.uploadDate,
              // Use documentState if available (English key), otherwise fallback to status
              status: detailData.data.documentState || detailData.data.status || document.status,
              // Include paymentLines for payment documents
              paymentLines: detailData.data.hasOwnProperty('paymentLines') 
                ? (detailData.data.paymentLines && Array.isArray(detailData.data.paymentLines) 
                   ? detailData.data.paymentLines 
                   : [])
                : (document.paymentLines && Array.isArray(document.paymentLines) ? document.paymentLines : []),
              
              // For expenditure documents, ensure we have the date field properly mapped
              date: correctedDocumentType === 'expenditure' ? 
                (detailData.data.expenseDate || detailData.data.date || document.date) : 
                (detailData.data.date || document.date),
              
              // Save GUIDs for all selectable fields to ensure they're available in edit form
              organizationGuid: detailData.data.organizationGuid || detailData.data.organization?.guid || document.organizationGuid || '',
              projectGuid: detailData.data.projectGuid || detailData.data.project?.guid || document.projectGuid || '',
              cfoGuid: detailData.data.cfoGuid || detailData.data.cfo?.guid || document.cfoGuid || '',
              documentTypeGuid: detailData.data.documentTypeGuid || detailData.data.documentTypeValue?.guid || document.documentTypeGuid || '',
              ddsArticleGuid: detailData.data.ddsArticleGuid || detailData.data.ddsArticle?.guid || document.ddsArticleGuid || '',
              budgetArticleGuid: detailData.data.budgetArticleGuid || detailData.data.budgetArticle?.guid || document.budgetArticleGuid || '',
              counterpartyGuid: detailData.data.counterpartyGuid || detailData.data.counterparty?.guid || document.counterpartyGuid || '',
              contractGuid: detailData.data.contractGuid || detailData.data.contract?.guid || document.contractGuid || '',
              
              // Access control fields - use values from detailData if available, otherwise default to false
              canApprove: detailData.data.canApprove !== undefined ? detailData.data.canApprove : false,
              canReject: detailData.data.canReject !== undefined ? detailData.data.canReject : false
            };
            
            // Log paymentLines to console when fetched, regardless of content
            // console.log('Document type:', document.documentType);
            // console.log('paymentLines fetched:', transformedData.paymentLines);
            
            console.log('DocumentDetail: Setting documentDetail state with transformedData:', transformedData);
            setDocumentDetail(transformedData);
          } else {
            console.log('DocumentDetail: No detailData received from backend');
            showCustomMessage('Failed to load document details', 'danger');
          }
        } catch (err) {
          // Only show one alert per error case
          console.error('DocumentDetail: Error fetching document details:', err);
          showCustomMessage('Failed to load document details: ' + (err.message || 'Unknown error'), 'danger');
          // Reset fetchAttempted so we can retry if needed
          setFetchAttempted(false);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('DocumentDetail: No valid document provided for fetching');
        // If we have a document but don't need to fetch details, just update the state
        if (document) {
          // Update the documentType in the documentDetail state if needed
          const correctedDocumentType = standardizeDocumentType(document.documentType);
          setDocumentDetail(prev => ({
            ...prev,
            documentType: correctedDocumentType
          }));
          
          setLoading(false);
        } else {
          console.log('DocumentDetail: No document provided');
          setLoading(false);
        }
      }
    };

    // Always reset fetchAttempted when document changes to ensure we fetch fresh data
    setFetchAttempted(false);
    fetchDocumentDetail();
  }, [document?.id, document?.documentType]); // Removed fetchAttempted from dependency array to prevent infinite loops

  // Clear route data when document status changes to 'prepared' or 'declined'
  useEffect(() => {
    console.log('Clear route data useEffect triggered with:', { 
      documentStatus: documentDetail?.status, 
      routeType, 
      routeStepsLength: routeSteps.length,
      routeTitlesLength: routeTitles.length
    });
    
    if (documentDetail && (documentDetail.status === 'prepared' || documentDetail.status === 'declined')) {
      // Clear route steps if they exist
      if (routeSteps.length > 0) {
        console.log('Clearing route steps');
        setRouteSteps([]);
      }
      
      // Don't clear route titles for free routes as they will be fetched automatically
      // Clear route titles only for fixed routes
      if (routeType === 'fixed' && routeTitles.length > 0) {
        console.log('Clearing route titles for fixed route');
        setRouteTitles([]);
      }
      
      // Reset selected users only for fixed routes
      if (routeType === 'fixed' && Object.keys(selectedUsers).length > 0) {
        console.log('Clearing selected users for fixed route');
        setSelectedUsers({});
      }
      
      // Reset route sent status
      if (routeSent) {
        console.log('Resetting route sent status');
        setRouteSent(false);
      }
    }
  }, [documentDetail?.status, routeType]);

  // Fetch route type when document detail changes with retry logic for newly created documents
  useEffect(() => {
    const fetchRouteType = async () => {
      // Only fetch if we have document details
      if (!documentDetail || !documentDetail.documentType || !documentDetail.id) return;
      
      // Fix the typo in documentType
      const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
      
      // Skip if we already have routeType and haven't exceeded retry limit
      if (routeType !== null && routeTypeRetryCount < 3) return;
      
      try {
        setLoadingRouteType(true);
        const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
        if (!token) {
          console.warn('No authentication token found, skipping route type fetch');
          setLoadingRouteType(false);
          return;
        }
        
        const response = await getDocumentRouteType(token, correctedDocumentType, documentDetail.id);
        
        if (response && response.success === 1) {
          setRouteType(response.routeType);
          setRouteTypeRetryCount(0); // Reset retry count on success
          // Update document detail with route type ONLY if it doesn't already exist
          setDocumentDetail(prev => {
            if (!prev.routeType) {
              return {
                ...prev,
                routeType: response.routeType,
                documentType: correctedDocumentType // Also update the documentType if it was corrected
              };
            }
            return prev;
          });
        } else {
          // Show error as alert instead of blocking the document view
          showCustomMessage(response?.message || 'Failed to fetch route type', 'warning');
          // Increment retry count
          setRouteTypeRetryCount(prev => prev + 1);
        }
      } catch (err) {
        // Only log error and show one alert
        console.error('Error fetching route type:', err);
        // Show error as alert instead of blocking the document view
        showCustomMessage(err.message || 'Failed to fetch route type', 'danger');
        // Increment retry count
        setRouteTypeRetryCount(prev => prev + 1);
      } finally {
        setLoadingRouteType(false);
      }
    };

    // For newly created documents, we may need to retry fetching route type
    // Add a small delay before fetching to allow backend to initialize routing metadata
    const timer = setTimeout(() => {
      fetchRouteType();
    }, 500); // 500ms delay for newly created documents

    // Cleanup timer on unmount or when dependencies change
    return () => clearTimeout(timer);
  }, [documentDetail?.id, documentDetail?.documentType, routeType, routeTypeRetryCount]); // Add routeType and retry count to dependencies

  // Fetch route steps data with retry logic for newly created documents
  useEffect(() => {
    const fetchRouteSteps = async () => {
      // Only fetch if we have document details
      if (!documentDetail || !documentDetail.documentType || !documentDetail.id) return;
      
      // Fix the typo in documentType
      const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
      
      try {
        const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
        if (!token) {
          console.warn('No authentication token found, skipping route steps fetch');
          return;
        }
        
        // For documents with status "on_approving", "approved", "declined" - fetch routeSteps
        // No need to check routeType because all steps are filled
        const relevantStatuses = ['on_approving', 'approved', 'declined'];
        if (relevantStatuses.includes(documentDetail.status)) {
          // Fetch document routes based on document type and ID
          const routeData = await fetchDocumentRoutes(token, correctedDocumentType, documentDetail.id);
          // console.log('Document routes fetched from 1C backend:', routeData);
          
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
                  users = route.users.flatMap(user => {
                    // Check if user is not null or undefined before splitting
                    if (user && typeof user === 'string') {
                      return user.split('\n').filter(line => line.trim() !== '');
                    }
                    return []; // Return empty array for null/undefined/invalid users
                  });
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
          } else {
            // Show error as alert instead of setting error state
            showCustomMessage(routeData?.message || 'Failed to fetch document routes', 'warning');
          }
          return; // Exit early for these statuses
        }
        
        // For fixed routes - fetch fixed routes in all statuses including "prepared"
        if (routeType === 'fixed') {
          // Fetch document routes based on document type and ID
          const routeData = await fetchDocumentRoutes(token, correctedDocumentType, documentDetail.id);
          // console.log('Document routes fetched from 1C backend:', routeData);
          
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
                  users = route.users.flatMap(user => {
                    // Check if user is not null or undefined before splitting
                    if (user && typeof user === 'string') {
                      return user.split('\n').filter(line => line.trim() !== '');
                    }
                    return []; // Return empty array for null/undefined/invalid users
                  });
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
          } else {
            // Show error as alert instead of setting error state
            showCustomMessage(routeData?.message || 'Failed to fetch document routes', 'warning');
          }
        }
        // For free routes with status "prepared" or "declined" - clear route steps if they exist
        else if (routeType === 'free' && 
                 (documentDetail.status === 'prepared' || documentDetail.status === 'declined')) {
          // Clear route steps for free routes in prepared/declined status
          if (routeSteps.length > 0) {
            setRouteSteps([]);
          }
        }
      } catch (err) {
        // Only log error and show one alert
        console.error('Error fetching document routes:', err);
        // Show error as alert instead of setting error state
        showCustomMessage(err.message || 'Failed to fetch document routes', 'danger');
      }
    };

    // For newly created documents, we may need to retry fetching route steps
    // Add a small delay before fetching to allow backend to initialize routing metadata
    const timer = setTimeout(() => {
      fetchRouteSteps();
    }, 500); // 500ms delay for newly created documents

    // Cleanup timer on unmount or when dependencies change
    return () => clearTimeout(timer);
  }, [documentDetail?.id, documentDetail?.documentType, documentDetail?.status, routeType]);

  // Fetch route titles for free route type
  const fetchRouteTitles = async () => {
    // Remove the check for routeTitles.length > 0 to ensure we can re-fetch if needed
    // Also remove the restriction to only payment documents
    if (!documentDetail || !documentDetail.documentType || !documentDetail.id || routeType !== 'free') return;
    
    try {
      setLoadingRouteTitles(true);
      const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
      if (!token) {
        console.warn('No authentication token found, skipping route titles fetch');
        setLoadingRouteTitles(false);
        return;
      }
      
      // Fix the typo in documentType
      const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
      
      const response = await getRouteTitles(token, correctedDocumentType, documentDetail.id);
      console.log('Route titles fetched:', response); // Add logging to see what we get
      if (response && response.data && Array.isArray(response.data)) {
        setRouteTitles(response.data);
        // Always initialize selectedUsers state when we fetch new route titles
        const initialSelectedUsers = {};
        
        response.data.forEach((title, index) => {
          // For the first step (index 0), set a default value since it's the current user's step
          if (index === 0) {
            initialSelectedUsers[title.guid] = 'current_user'; // Special value to indicate current user's step
          } else {
            initialSelectedUsers[title.guid] = '';
          }
        });
        
        setSelectedUsers(initialSelectedUsers);
        console.log('Selected users initialized:', initialSelectedUsers); // Add logging
      } else {
        // Show error as alert instead of setting error state
        showCustomMessage(response?.message || 'Failed to fetch route titles', 'warning');
      }
    } catch (err) {
      // Only log error and show one alert
      console.error('Error fetching route titles:', err);
      // Show error as alert instead of setting error state
      showCustomMessage(err.message || 'Failed to fetch route titles', 'danger');
    } finally {
      setLoadingRouteTitles(false);
    }
  };

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
        if (!token) {
          console.warn('No authentication token found, skipping users list fetch');
          return;
        }
        
        const response = await getUsersList(token);
        if (response && response.data && Array.isArray(response.data)) {
          setUsersList(response.data);
        } else {
          // Show error as alert instead of setting error state
          showCustomMessage(response?.message || 'Failed to fetch users list', 'warning');
        }
      } catch (err) {
        // Only log error and show one alert
        console.error('Error fetching users list:', err);
        // Show error as alert instead of setting error state
        showCustomMessage(err.message || 'Failed to fetch users list', 'danger');
      }
    };

    fetchUsers();
  }, []);

  // Fetch route titles when documentDetail changes and routeType is 'free'
  useEffect(() => {
    // For free routes, fetch route titles when:
    // 1. Document status is 'prepared' or 'declined'
    // 2. Route type is 'free'
    if (documentDetail && documentDetail.documentType && documentDetail.id && 
        documentDetail.routeType === 'free' && 
        (documentDetail.status === 'prepared' || documentDetail.status === 'declined')) {
      // For newly created documents, we may need to retry fetching route titles
      // Add a small delay before fetching to allow backend to initialize routing metadata
      const timer = setTimeout(() => {
        fetchRouteTitles();
      }, 500); // 500ms delay for newly created documents

      // Cleanup timer on unmount or when dependencies change
      return () => clearTimeout(timer);
    }
  }, [documentDetail?.id, documentDetail?.documentType, documentDetail?.status, documentDetail?.routeType, routeType]);

  // Enhanced useEffect for route information after document details are fully fetched
  useEffect(() => {
    // This useEffect is now enhanced to handle newly created documents properly
    if (documentDetail && documentDetail.id) {
      // Reset retry counters when document changes
      setRouteTypeRetryCount(0);
    }
  }, [documentDetail?.id]);

  // Render specific fields based on document type
 const renderDocumentSpecificFields = () => {
    return (
      <DocumentSpecificFields 
        documentDetail={documentDetail}
        theme={theme}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    );
  };

  // Function to copy a route step
  const copyRouteStep = (stepGuid) => {
    // Find the route title to copy
    const routeTitle = routeTitles.find(title => title.guid === stepGuid);
    if (!routeTitle) return;
    
    // Create a new route title with a unique guid
    const newGuid = `${stepGuid}_copy_${Date.now()}`;
    const newTitle = {
      ...routeTitle,
      guid: newGuid,
      name: `${routeTitle.name} (копия)`
    };
    
    // Add the new route title to the list
    setRouteTitles(prevTitles => [...prevTitles, newTitle]);
    
    // Initialize selected user for the new step
    setSelectedUsers(prev => ({
      ...prev,
      [newGuid]: ''
    }));
    
    // Initialize search term for the new step
    setSearchTerms(prev => ({
      ...prev,
      [newGuid]: ''
    }));
  };

  // Function to delete a route step
  const deleteRouteStep = (stepGuid) => {
    // Confirm deletion
    if (!window.confirm('Вы уверены, что хотите удалить этот шаг?')) {
      return;
    }
    
    // Remove the route title from the list
    setRouteTitles(prevTitles => 
      prevTitles.filter(title => title.guid !== stepGuid)
    );
    
    // Remove the selected user for this step
    setSelectedUsers(prev => {
      const newSelectedUsers = { ...prev };
      delete newSelectedUsers[stepGuid];
      return newSelectedUsers;
    });
    
    // Remove the search term for this step
    setSearchTerms(prev => {
      const newSearchTerms = { ...prev };
      delete newSearchTerms[stepGuid];
      return newSearchTerms;
    });
  };

  // Function to handle search term change for a route step
  const handleSearchTermChange = (stepGuid, searchTerm) => {
    setSearchTerms(prev => ({
      ...prev,
      [stepGuid]: searchTerm
    }));
  };

  // Render route steps component
  const renderRouteSteps = () => {
    return (
      <RouteSteps
        routeSteps={routeSteps}
        routeType={routeType}
        routeTitles={routeTitles}
        usersList={usersList}
        selectedUsers={selectedUsers}
        searchTerms={searchTerms}
        theme={theme}
        onCopyRouteStep={copyRouteStep}
        onDeleteRouteStep={deleteRouteStep}
        onUserSelection={handleUserSelection}
        onSearchTermChange={handleSearchTermChange}
      />
    );
  };

  // Render attachments component
  const renderAttachments = () => {
    // Fix the typo in documentType using standardizeDocumentType
    const correctedDocumentType = standardizeDocumentType(documentDetail?.documentType);
    
    return (
      <Attachments 
        documentId={documentDetail?.id} 
        documentType={correctedDocumentType} // Use corrected document type
        theme={theme} 
        onDownload={(attachment) => console.log(`Downloading ${attachment.fileName}`)}
      />
    );
  };

  // Function to handle document decline
  const handleDeclineDocument = async () => {
    if (!documentDetail) return;
    
    // Check access control - if canReject is false, prevent declining
    if (documentDetail.canReject === false) {
      showCustomMessage('У вас нет прав для отклонения этого документа', 'warning');
      return;
    }
    
    // Fix the typo in documentType using standardizeDocumentType
    const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
    
    try {
      setDeclining(true);
      
      const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
      if (!token) {
        showCustomMessage('No authentication token found', 'danger');
        setDeclining(false);
        return;
      }
      
      // Send the decline request to the backend
      const response = await declineDocument(
        token,
        correctedDocumentType, // Use corrected document type
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
        showCustomMessage('Document declined successfully', 'success');
      } else {
        showCustomMessage('Failed to decline document: ' + (response?.message || 'Unknown error'), 'danger');
      }
    } catch (err) {
      console.error('Error declining document:', err);
      showCustomMessage('Failed to decline document: ' + (err.message || 'Unknown error'), 'danger');
    } finally {
      setDeclining(false);
      setShowDeclineConfirmModal(false);
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async () => {
    if (!documentDetail) return;
    
    // Fix the typo in documentType using standardizeDocumentType
    const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
    
    try {
      setDeleting(true);
      
      const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
      if (!token) {
        showCustomMessage('No authentication token found', 'danger');
        setDeleting(false);
        return;
      }
      
      // Send the delete request to the backend
      const response = await deleteDocument(
        token,
        correctedDocumentType, // Use corrected document type
        documentDetail.id
      );
      
      //console.log('Document deleted:', response);
      
      // Check if response has success flag
      if (response && response.success === 1) {
        // Show success message and notify parent component
        showCustomMessage('Документ успешно удален', 'success');
        if (onDelete) {
          onDelete(documentDetail.id);
        }
        onBack();
      } else {
        showCustomMessage('Failed to delete document: ' + (response?.message || 'Unknown error'), 'danger');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      showCustomMessage('Failed to delete document: ' + (err.message || 'Unknown error'), 'danger');
    } finally {
      setDeleting(false);
      setShowDeleteConfirmModal(false);
    }
  };

  // Action button click handlers
  const handleActionButtonClick = (action) => {
    switch (action) {
      case 'send-to-route':
        handleSendToRoute();
        break;
      case 'decline':
        setShowDeclineConfirmModal(true);
        break;
      case 'delete':
        setShowDeleteConfirmModal(true);
        break;
      case 'edit':
        // Call the onEdit callback to switch to edit mode in the parent component
        // Pass the detailed document data
        if (onEdit) {
          onEdit(documentDetail);
        }
        break;
      default:
        showCustomMessage(`Clicked button: ${action}`, 'info');
    }
  };

  if (loading) {
    return (
      <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <div className='card-header'>
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

  // Function to handle approval with signing
  const handleApproveWithSigning = async () => {
    if (!documentDetail) return;
    
    // Check access control - if canApprove is false, prevent approving
    if (documentDetail.canApprove === false) {
      showCustomMessage('У вас нет прав для согласования этого документа', 'warning');
      return;
    }
    
    // Fix the typo in documentType using standardizeDocumentType
    const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
    
    try {
      setSigningLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 30000); // 30 seconds timeout
      });
      
      const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
      if (!token) {
        showCustomMessage('No authentication token found', 'danger');
        setSigningLoading(false);
        return;
      }
      
      console.log('Fetching signing template for document:', {
        documentType: correctedDocumentType, // Use corrected document type
        documentId: documentDetail.id
      });
      
      // Get signing template with timeout
      const templateResponse = await Promise.race([
        getSigningTemplate(
          token,
          correctedDocumentType, // Use corrected document type
          documentDetail.id
        ),
        timeoutPromise
      ]);
      
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
          // Show custom alert message instead of throwing error
          showCustomMessage('Не удалось получить данные документа для подписания', 'danger');
          setSigningLoading(false);
          return;
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
        showCustomMessage('Failed to get signing template for approve', 'danger');
        setSigningLoading(false); // Add this to prevent hanging loading state
      }
    } catch (err) {
      console.error('Error getting signing template for approve:', err);
      // Handle timeout error specifically
      if (err.message === 'Request timeout') {
        showCustomMessage('Request timed out. Please try again.', 'danger');
      } 
      // Only show error in UI if it's not the binary data error (which is handled with alert)
      else if (err.message !== 'Не удалось получить данные документа для подписания') {
        showCustomMessage('Failed to get signing template for approve: ' + (err.message || 'Unknown error'), 'danger');
      }
      setSigningLoading(false); // Ensure loading state is reset on error
    } finally {
      // Ensure loading state is reset in all cases
      if (!showSigningModal) {
        setSigningLoading(false);
      }
    }
  };

  // Function to send document to route
  const handleSendToRoute = async () => {
    console.log('handleSendToRoute called with:', { 
      documentDetail, 
      routeType, 
      routeTitlesLength: routeTitles.length,
      selectedUsers
    });
    
    // Pre-send validation
    if (!documentDetail) return;
    
    // Fix the typo in documentType
    const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
    
    // Check document state - only allow sending when document is prepared, declined
    if (documentDetail.status !== 'prepared' && documentDetail.status !== 'declined')  {
      showCustomMessage('Document is not in a state that allows sending to route', 'warning');
      return;
    }
    
    // Check if routeType is free
    if (routeType === "free") {
      // If we don't have route titles yet, fetch them first and return
      // The user will need to click the button again after selecting users
      if (routeTitles.length === 0) {
        console.log('Fetching route titles for free route');
        await fetchRouteTitles();
        showCustomMessage('Пожалуйста, выберите пользователей для всех шагов', 'info');
        return;
      }
      
      // Check if all users are selected (excluding the first step which is the current user's step)
      // Get all route title GUIDs except the first one (which is the current user's step)
      const routeTitleGuids = routeTitles.map(title => title.guid);
      if (routeTitleGuids.length > 1) {
        // Skip the first step (index 0) as it's the current user's step
        const usersToCheck = routeTitleGuids.slice(1);
        const allUsersSelected = usersToCheck.every(guid => {
          const userGuid = selectedUsers[guid];
          return userGuid && userGuid.trim() !== '';
        });
        
        if (!allUsersSelected) {
          showCustomMessage('Пожалуйста, выберите пользователей для всех шагов', 'warning');
          return;
        }
      }
    }
    
    // Disable button after successful send
    if (routeSent) return;
    
    try {
      setSendingToRoute(true);
      
      const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
      if (!token) {
        showCustomMessage('No authentication token found', 'danger');
        setSendingToRoute(false);
        return;
      }
      
      let response;
      
      // Check if routeType is free
      if (routeType === "free") {
        // Build routeSteps array (excluding the first step which is the current user's step)
        const routeStepsArray = [];
        const routeTitleGuids = routeTitles.map(title => title.guid);
        routeTitleGuids.forEach((stepGuid, index) => {
          // Skip the first step (index 0) as it's the current user's step
          if (index > 0) {
            const userGuid = selectedUsers[stepGuid];
            if (userGuid && userGuid.trim() !== '') {
              routeStepsArray.push({
                step_guid: stepGuid,
                user_guid: userGuid
              });
            }
          }
        });
        
        // API Request for free route
        response = await sendToFreeRoute(
          token,
          correctedDocumentType, // Use corrected document type
          documentDetail.id,
          routeStepsArray
        );
      } else {
        // API Request for fixed route
        response = await sendDocumentToRoute(
          token, 
          correctedDocumentType, // Use corrected document type
          documentDetail.id, 
          "fixed"
        );
      }

      // Response handling
      if (response && response.success === 1) {
        // Success - update document status to on_approving
        setRouteSent(true);
        // Update document status in state
        if (documentDetail) {
          const updatedDocument = {
            ...documentDetail,
            status: 'on_approving',
            documentType: correctedDocumentType, // Also update the documentType if it was corrected
            // Reset access control fields as they may have changed
            canApprove: false,
            canReject: false
          };
          setDocumentDetail(updatedDocument);
          
          // Check access to approve/decline
          try {
            const accessResponse = await checkAccessToApproveDecline(
              token,
              correctedDocumentType, // Use corrected document type
              documentDetail.id
            );
            
            if (accessResponse && accessResponse.success === 1) {
              // Update the document with access information
              setDocumentDetail(prev => ({
                ...prev,
                canApprove: accessResponse.canApprove !== undefined ? accessResponse.canApprove : false,
                canReject: accessResponse.canReject !== undefined ? accessResponse.canReject : false,
                status: 'on_approving',
                documentType: correctedDocumentType // Also update the documentType if it was corrected
              }));
            } else {
              // Set default access values if check fails or returns no data
              setDocumentDetail(prev => ({
                ...prev,
                canApprove: false,
                canReject: false,
                status: 'on_approving',
                documentType: correctedDocumentType // Also update the documentType if it was corrected
              }));
            }
          } catch (accessError) {
            // Only log error and show one alert
            console.error('Error checking access to approve/decline:', accessError);
            showCustomMessage('Error checking access to approve/decline: ' + (accessError.message || 'Unknown error'), 'warning');
            // Continue even if access check fails
            // Set default access values if check fails
            setDocumentDetail(prev => ({
              ...prev,
              canApprove: false,
              canReject: false,
              status: 'on_approving',
              documentType: correctedDocumentType // Also update the documentType if it was corrected
            }));
          }
        }
        
        // After success: fetch and re-render route steps
        try {
          // Add a small delay to ensure the document status update is processed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // For free routes, we should refetch the route titles, not the fixed route steps
          if (routeType === 'free') {
            // Refetch route titles for free routes
            await fetchRouteTitles();
          } else {
            // For fixed routes, fetch the route steps
            const routeData = await fetchDocumentRoutes(token, correctedDocumentType, documentDetail.id);
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
                    users = route.users.flatMap(user => {
                      // Check if user is not null or undefined before splitting
                      if (user && typeof user === 'string') {
                        return user.split('\n').filter(line => line.trim() !== '');
                      }
                      return []; // Return empty array for null/undefined/invalid users
                    });
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
          }
        } catch (routeError) {
          // Only log error and show one alert
          console.error('Error refetching document routes:', routeError);
          showCustomMessage('Error refetching document routes: ' + (routeError.message || 'Unknown error'), 'warning');
          // Continue even if route fetch fails
        }
        
        // Show success message
        showCustomMessage('Document sent to route successfully', 'success');
      } else {
        // Error - only show one alert
        showCustomMessage('Failed to send document to route: ' + (response?.message || 'Unknown error'), 'danger');
      }
    } catch (err) {
      // Only log error and show one alert
      console.error('Error sending document to route:', err);
      showCustomMessage('Failed to send document to route: ' + (err.message || 'Unknown error'), 'danger');
    } finally {
      setSendingToRoute(false);
    }
  };

  // Function to handle SIGEX signing completion
  const handleSigningComplete = (signedDocuments) => {
    console.log('SIGEX signing completed with documents:', signedDocuments);
    if (!documentDetail || !signingAction) {
      setSigningLoading(false);
      return;
    }
    
    // Fix the typo in documentType
    const correctedDocumentType = standardizeDocumentType(documentDetail.documentType);
    
    try {
      // Close the SIGEX modal
      setShowSigningModal(false);
      
      // Send the signed document to the backend for approval
      const sendSignedDocument = async () => {
        try {
          // Add a timeout to prevent infinite loading
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Request timeout'));
            }, 30000); // 30 seconds timeout
          });
          
          const token = (() => {
              try {
                return sessionStorage.getItem('authToken');
              } catch (e) {
                return null;
              }
            })();
          if (!token) {
            showCustomMessage('No authentication token found', 'danger');
            setSigningLoading(false);
            return;
          }
          
          // First, save the signed document data with timeout
          let saveResponse;
          if (documentDetail.signingTemplate?.metadata) {
            saveResponse = await Promise.race([
              saveSignedDocument(
                token,
                documentDetail.id,
                correctedDocumentType, // Use corrected document type
                signedDocuments[0]?.data || '', // Pass the signed document data
                documentDetail.signingTemplate.metadata // Pass the metadata
              ),
              timeoutPromise
            ]);
            
            console.log('Signed document saved:', saveResponse);
            
            // Check if response has success flag (handle both 'success' and 'Success')
            const isSuccess = saveResponse && (saveResponse.success === 1 || saveResponse.Success === 1);
            if (!isSuccess) {
              showCustomMessage(saveResponse?.message || 'Failed to save signed document', 'danger');
              setSigningLoading(false);
              return;
            }
          }
          
          // Then, send the signed document to the backend for approval with timeout
          const response = await Promise.race([
            saveSignedDocumentAndApprove(
              token,
              correctedDocumentType, // Use corrected document type
              documentDetail.id,
              signedDocuments[0]?.data || '' // Pass the signed document data
            ),
            timeoutPromise
          ]);
          
          console.log('Signed document saved and approved:', response);
          
          // Check if response has success flag (handle both 'success' and 'Success')
          const isResponseSuccess = response && (response.success === 1 || response.Success === 1);
          if (isResponseSuccess) {
            // Update document status to approved
            setDocumentDetail({
              ...documentDetail,
              status: 'approved'
            });
            
            // Refetch routes to update the route steps
            try {
              const routeData = await fetchDocumentRoutes(token, correctedDocumentType, documentDetail.id);
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
                      users = route.users.flatMap(user => {
                        // Check if user is not null or undefined before splitting
                        if (user && typeof user === 'string') {
                          return user.split('\n').filter(line => line.trim() !== '');
                        }
                        return []; // Return empty array for null/undefined/invalid users
                      });
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
              showCustomMessage('Error refetching document routes: ' + (routeError.message || 'Unknown error'), 'warning');
              // Continue even if route fetch fails
            }
          } else {
            showCustomMessage(response?.message || 'Failed to approve document', 'danger');
            setSigningLoading(false);
            return;
          }
          
          // Show success message
          showCustomMessage('Document approved successfully', 'success');
        } catch (err) {
          // Handle timeout error specifically
          if (err.message === 'Request timeout') {
            showCustomMessage('Request timed out. Please try again.', 'danger');
          } else {
            // Only log error and show one alert
            console.error('Error saving signed document:', err);
            showCustomMessage('Failed to approve document: ' + (err.message || 'Unknown error'), 'danger');
          }
        } finally {
          // Ensure loading state is reset
          setSigningLoading(false);
        }
      };
      
      // Execute the function
      sendSignedDocument();
    } catch (err) {
      // Only log error and show one alert
      console.error('Error handling signed document:', err);
      showCustomMessage('Failed to process signed document: ' + (err.message || 'Unknown error'), 'danger');
      // Ensure loading state is reset
      setSigningLoading(false);
    }
  };

  // Function to handle user selection for a route step
  const handleUserSelection = (stepGuid, userGuid) => {
    // Prevent selection for the first step (index 0) as it's the current user's step
    const stepIndex = routeTitles.findIndex(title => title.guid === stepGuid);
    if (stepIndex === 0) {
      // Don't allow changing the first step selection
      return;
    }
    
    setSelectedUsers(prev => ({
      ...prev,
      [stepGuid]: userGuid
    }));
  };

  // Render attachments - fix the typo in documentType
  {documentDetail?.documentType !== 'payment' && documentDetail?.documentType !== 'paymemnt' && renderAttachments()}

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className='card-header'>
          <h2>Детали документа</h2>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
        
        <div className="document-detail">
          {/* Document Header with Title, Type Badge, Status, Number, Date */}
          <div className={`document-detail-header mb-6 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className='flex justify-between items-center'>
              <h1 className={`text-2xl font-bold text-gray-900 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                {documentDetail?.title || 'Без названия'}
              </h1>
              {/* Fix the typo in documentType */}
              {(() => {
                const correctedDocumentType = documentDetail?.documentType === 'paymemnt' ? 'payment' : documentDetail?.documentType;
                return (
                  <span className={`document-type-badge badge-${correctedDocumentType}`}>
                    {getDocumentTypeText(correctedDocumentType)}
                  </span>
                );
              })()}
            </div>
            <div className='mt-2 flex items-center'>
              <span className={`status-badge ${getStatusBadgeClass(documentDetail?.status)}`}>
                {getStatusText(documentDetail?.status)}
              </span>
              <span className={`ml-3 text-sm text-gray-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                № {documentDetail?.number || 'Не указан'} от {formatDate(documentDetail?.uploadDate)}
              </span>
            </div>
          </div>
          
          {/* Document Action Buttons */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="action-buttons">
              <button 
                type="button" 
                className={`btn ${routeSent ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => handleActionButtonClick('send-to-route')}
                disabled={
                  sendingToRoute || 
                  routeSent || 
                  !documentDetail || 
                  (documentDetail.status !== 'prepared' && documentDetail.status !== 'declined')
                }
              >
                {sendingToRoute ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Отправка...
                  </>
                ) : routeSent ? (
                  <>
                    <i className="fas fa-check"></i> Отправлено
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Отправить на маршрут
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleApproveWithSigning}
                disabled={
                  !documentDetail || 
                  documentDetail.status !== 'on_approving' ||
                  signingLoading ||
                  (documentDetail.canApprove === false) // Disable if user doesn't have approve rights
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
                  documentDetail.status !== 'on_approving' ||
                  (documentDetail.canReject === false) // Disable if user doesn't have reject rights
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
                onClick={() => {
                  
                  handleActionButtonClick('edit');
                }}
                disabled={
                  !documentDetail || 
                  (standardizeDocumentType(documentDetail.documentType) === 'payment' 
                    ? (documentDetail.status !== 'on_approving' && 
                       documentDetail.status !== 'declined' && 
                       documentDetail.status !== 'prepared')
                    : (standardizeDocumentType(documentDetail.documentType) === 'memo' || 
                       standardizeDocumentType(documentDetail.documentType) === 'expenditure')
                      ? (documentDetail.status !== 'prepared' && 
                         documentDetail.status !== 'declined')
                      : true) // Disable for other document types
                }
              >
                <i className="fas fa-edit"></i>
                Редактировать
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                 
                  setShowDeleteConfirmModal(true);
                }}
                disabled={
                  deleting ||
                  !documentDetail || 
                  (standardizeDocumentType(documentDetail.documentType) === 'payment' 
                    ? (documentDetail.status !== 'on_approving' && 
                       documentDetail.status !== 'declined' && 
                       documentDetail.status !== 'prepared')
                    : (standardizeDocumentType(documentDetail.documentType) === 'memo' || 
                       standardizeDocumentType(documentDetail.documentType) === 'expenditure')
                      ? (documentDetail.status !== 'prepared' && 
                         documentDetail.status !== 'declined')
                      : true) // Disable for other document types
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
          {/* Fix the typo in documentType */}
          {(() => {
            const correctedDocumentType = standardizeDocumentType(documentDetail?.documentType);
            return correctedDocumentType !== 'payment' && renderAttachments();
          })()}

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
        onClose={() => {
          setShowSigningModal(false);
          setSigningLoading(false);
        }}
        onSigningComplete={handleSigningComplete}
        documentData={documentDetail?.signingTemplate?.binaryData}
        documentInfo={documentDetail?.signingTemplate?.documentInfo}
      />
    </div>
  );
};

export default DocumentDetail;