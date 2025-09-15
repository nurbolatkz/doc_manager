import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { fetchDocuments, fetchDocumentCounts } from '../services/fetchManager';
import DocumentList from './DocumentList';
import DocumentDetail from './DocumentDetail';
import DocumentEdit from './DocumentEdit'; // Add this import
import MemoForm from './MemoForm';
import ExpenditureForm from './ExpenditureForm';
import PaymentCreationForm from './PaymentCreationForm';
import { showCustomMessage } from '../utils';

// Define the document counts interface
const initialDocumentCounts = {
  incomingToSign: 0,
  incomingPayment: 0,
  incomingPaymentSchedule: 0,
  incomingMemo: 0,
  outgoingPending: 0,
  outgoingSigned: 0,
  outgoingRejected: 0
};

const Dashboard = ({ currentUser, onLogout, theme, onThemeToggle }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentCounts, setDocumentCounts] = useState({});
  const [filter, setFilter] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(null);
  const [isEditingDocument, setIsEditingDocument] = useState(false); // Add this state
  const [openDropdown, setOpenDropdown] = useState(null); // Add this state for dropdowns

  // Fetch documents and counts from 1C backend on component mount
  useEffect(() => {
    loadDashboardData("all");
  }, []);

  const loadDashboardData = async (selectedFilter = "all") => {
    try {
      setLoading(true);
      // Use robust storage approach for token retrieval
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

      // Fetch documents and counts in parallel
      const [documentsResponse, countsResponse] = await Promise.all([
        fetchDocuments(token, { SelectedFilter: selectedFilter }),
        fetchDocumentCounts(token)
      ]);

      // console.log('Documents fetched from 1C backend:', documentsResponse);
      // console.log('Document counts fetched from 1C backend:', countsResponse);

      // Transform the documents data to match our Document type
      if (documentsResponse.documents && Array.isArray(documentsResponse.documents)) {
        const transformedDocuments = documentsResponse.documents.map((doc) => ({
          id: doc.id || doc.Id || '',
          number: doc.number || doc.Number || '',
          title: doc.title || doc.Title || doc.Название || 'Без названия',
          description: doc.description || doc.Description || doc.Описание || '',
          documentType: doc.documentType || doc.DocumentType || doc.Type || 'payment',
          amount: doc.amount !== undefined ? doc.amount : (doc.Amount || 0),
          currency: doc.currency || doc.Currency || 'KZT',
          uploadDate: doc.Date || doc.date || doc.UploadDate || new Date().toISOString(),
          lastModified: doc.lastModified || doc.LastModified || doc.Date || doc.date || new Date().toISOString(),
          uploadedBy: {
            id: doc.uploadedBy?.id || doc.AuthorId || 'user',
            username: doc.uploadedBy?.username || doc.Author || 'Неизвестный автор',
            name: doc.uploadedBy?.name || doc.Author || 'Неизвестный автор',
            email: doc.uploadedBy?.email || `${doc.Author || 'unknown'}@company.kz`,
            canApprove: doc.uploadedBy?.canApprove || doc.canApprove || false,
            canReject: doc.uploadedBy?.canReject || doc.canReject || false,
            canEdit: doc.uploadedBy?.canEdit || doc.CanEdit || false,
            avatar: doc.uploadedBy?.avatar || 'https://via.placeholder.com/40'
          },
          status: doc.status || doc.Status || 'on_approving',
          // Properly map organization and counterparty fields
          organization: doc.organization || doc.Organization || doc.Организация || '',
          counterparty: doc.counterparty || doc.Counterparty || doc.Контрагент || '',
          contract: doc.contract || doc.Contract || doc.Договор || '',
          attachments: doc.attachments || doc.Attachments || [],
          routeSteps: doc.routeSteps || doc.RouteSteps || [],
          // Additional fields that might be in the response
          date: doc.date || doc.Date || '',
          author: doc.author || doc.Author || '',
          responsible: doc.responsible || doc.Responsible || '',
          comment: doc.comment || doc.Comment || ''
        }));

        setDocuments(transformedDocuments);
      }

      // Update document counts
      if (countsResponse.counts) {
        setDocumentCounts({
          incomingToSign: countsResponse.counts.incomingToSign || 0,
          incomingPayment: countsResponse.counts.incomingPayment || 0,
          incomingPaymentSchedule: countsResponse.counts.incomingPaymentSchedule || 0,
          incomingMemo: countsResponse.counts.incomingMemo || 0,
          outgoingPending: countsResponse.counts.outgoingPending || 0,
          outgoingSigned: countsResponse.counts.outgoingSigned || 0,
          outgoingRejected: countsResponse.counts.outgoingRejected || 0
        });
      }

      setLoading(false);
    } catch (err) {
      // console.error('Error fetching dashboard data:', err);
      // Fallback to mock data in case of error
      setDocuments([
        { id: '1', title: 'Sample Document 1', status: 'on_approving' },
        { id: '2', title: 'Sample Document 2', status: 'approved' },
        { id: '3', title: 'Sample Document 3', status: 'rejected' }
      ]);
      
      setDocumentCounts({
        incomingToSign: 3,
        incomingPayment: 2,
        incomingPaymentSchedule: 1,
        incomingMemo: 1,
        outgoingPending: 4,
        outgoingSigned: 8,
        outgoingRejected: 2
      });
      setLoading(false);
    }
  };


  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleCreateDocument = (documentType) => {
    setShowCreateForm(documentType);
    setSelectedDocument(null);
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
    setShowCreateForm(null);
    // Refresh the document list after returning from detail view
    loadDashboardData("all");
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleFilterChange = (newFilter) => {
    // Clear selected document first to ensure we switch to list view immediately
    setSelectedDocument(null);
    setFilter(newFilter);
    
    // Fetch documents with the selected filter
    if (newFilter.SelectedFilter) {
      loadDashboardData(newFilter.SelectedFilter);
    } else {
      loadDashboardData("all");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x mb-4"></i>
          <p>Загрузка документов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      
      {/* Mobile Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button
          className={`mobile-sidebar-toggle ${theme.mode === 'dark' ? 'dark' : 'light'}`}
          onClick={() => setSidebarOpen(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className={`mobile-sidebar-overlay ${theme.mode === 'dark' ? 'dark' : 'light'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar sidebar-transition ${sidebarOpen ? 'sidebar-open' : ''} ${theme.mode === 'dark' ? 'dark' : 'light'}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            {sidebarOpen && (
              <>
                <i className="fas fa-file-contract mr-2"></i>
                ДокМенеджер
              </>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle-btn"
          >
            <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {/* Navigation Section */}
          <div className="nav-section">
            {sidebarOpen && <div className="nav-section-title">Навигация</div>}
            <div className="space-y-1">
              <div className="nav-item">
                <button 
                  className="nav-button"
                  onClick={() => toggleDropdown('documents')}
                >
                  <i className="fas fa-folder nav-item-icon"></i>
                  {sidebarOpen && <span className="nav-item-text">Все документы</span>}
                  {sidebarOpen && (
                    <i className={`fas fa-chevron-down nav-caret ${openDropdown === 'documents' ? 'rotated' : ''}`}></i>
                  )}
                </button>
                {openDropdown === 'documents' && sidebarOpen && (
                  <div className="nav-submenu">
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "all" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-list nav-item-icon"></i>
                      <span className="nav-item-text">Все</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_outgoing_signed" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-history nav-item-icon"></i>
                      <span className="nav-item-text">История</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="nav-item">
                <button 
                  className="nav-button"
                  onClick={() => toggleDropdown('incoming')}
                >
                  <i className="fas fa-inbox nav-item-icon"></i>
                  {sidebarOpen && <span className="nav-item-text">Входящие</span>}
                  {sidebarOpen && (
                    <i className={`fas fa-chevron-down nav-caret ${openDropdown === 'incoming' ? 'rotated' : ''}`}></i>
                  )}
                </button>
                {openDropdown === 'incoming' && sidebarOpen && (
                  <div className="nav-submenu">
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_incoming_to_sign" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-pen-alt nav-item-icon"></i>
                      <span className="nav-item-text">Подписать</span>
                      <span className="count-badge">{documentCounts.incomingToSign}</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_incoming_payment" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-file-invoice-dollar nav-item-icon"></i>
                      <span className="nav-item-text">План платежей</span>
                      <span className="count-badge">{documentCounts.incomingPaymentSchedule}</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_incoming_expenditure" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-file-invoice-dollar nav-item-icon"></i>
                      <span className="nav-item-text">Заявки на  расходование</span>
                      <span className="count-badge">{documentCounts.incomingPayment}</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_incoming_memo" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-file-invoice-dollar nav-item-icon"></i>
                      <span className="nav-item-text">Служебная записка</span>
                      <span className="count-badge">{documentCounts.incomingMemo}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="nav-item">
                <button 
                  className="nav-button"
                  onClick={() => toggleDropdown('outgoing')}
                >
                  <i className="fas fa-paper-plane nav-item-icon"></i>
                  {sidebarOpen && <span className="nav-item-text">Исходящие</span>}
                  {sidebarOpen && (
                    <i className={`fas fa-chevron-down nav-caret ${openDropdown === 'outgoing' ? 'rotated' : ''}`}></i>
                  )}
                </button>
                {openDropdown === 'outgoing' && sidebarOpen && (
                  <div className="nav-submenu">
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_outgoing_pending" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-hourglass-half nav-item-icon"></i>
                      <span className="nav-item-text">В ожидании</span>
                      <span className="count-badge">{documentCounts.outgoingPending}</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_outgoing_signed" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-check-circle nav-item-icon"></i>
                      <span className="nav-item-text">Подписано</span>
                      <span className="count-badge">{documentCounts.outgoingSigned}</span>
                    </button>
                    <button 
                      className="nav-button"
                      onClick={() => {
                        handleFilterChange({ SelectedFilter: "get_outgoing_rejected" });
                        setOpenDropdown(null);
                      }}
                    >
                      <i className="fas fa-times-circle nav-item-icon"></i>
                      <span className="nav-item-text">Отклонено</span>
                      <span className="count-badge">{documentCounts.outgoingRejected}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create Section */}
          <div className="nav-section">
            {sidebarOpen && <div className="nav-section-title">Создать</div>}
            <div className="nav-item">
              <button 
                className="nav-button"
                onClick={() => toggleDropdown('create')}
              >
                <i className="fas fa-plus-circle nav-item-icon"></i>
                {sidebarOpen && <span className="nav-item-text">Создать документ</span>}
                {sidebarOpen && (
                  <i className={`fas fa-chevron-down nav-caret ${openDropdown === 'create' ? 'rotated' : ''}`}></i>
                )}
              </button>
              {openDropdown === 'create' && sidebarOpen && (
                <div className="nav-submenu">
                  <button 
                    className="nav-button"
                    onClick={() => {
                      handleCreateDocument('payment');
                      setOpenDropdown(null);
                    }}
                  >
                    <i className="fas fa-money-bill-wave nav-item-icon"></i>
                    <span className="nav-item-text">План Платежей</span>
                  </button>
          
                  <button 
                    className="nav-button"
                    onClick={() => {
                      handleCreateDocument('memo');
                      setOpenDropdown(null);
                    }}
                  >
                    <i className="fas fa-sticky-note nav-item-icon"></i>
                    <span className="nav-item-text">Служебная записка</span>
                  </button>
                  <button 
                    className="nav-button"
                    onClick={() => {
                      handleCreateDocument('expenditure');
                      setOpenDropdown(null);
                    }}
                  >
                    <i className="fas fa-hand-holding-usd nav-item-icon"></i>
                    <span className="nav-item-text">Заявка на расходы</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', color: 'white'}}>
              <i className="fas fa-user"></i>
            </div>
            {sidebarOpen ? (
              // When sidebar is open, show user details and logout button separately
              <>
                <div className="user-details">
                  <div className="user-name">{currentUser.name}</div>
                  <div className="user-email">{currentUser.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="logout-btn"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            ) : (
              // When sidebar is closed, show only user avatar and logout button
              <button
                onClick={onLogout}
                className="logout-btn"
                title="Выйти"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            )}
          </div>
        </div>

        {/* Theme Toggle Button - Moved to bottom after user section */}
        <div className="theme-toggle-section">
          <button 
            className="theme-toggle-btn"
            onClick={onThemeToggle}
          >
            <i className={`fas ${theme.mode === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            {sidebarOpen && (
              <span className="theme-toggle-text">
                {theme.mode === 'light' ? 'Темная тема' : 'Светлая тема'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${theme.mode === 'dark' ? 'dark' : 'light'}`} style={{ marginLeft: sidebarOpen ? undefined : '0' }}>
        {isEditingDocument && selectedDocument ? (
          // DocumentEdit component
          <DocumentEdit 
            document={selectedDocument}
            onBack={() => {
              setIsEditingDocument(false);
              // Reload document data to reflect changes
              loadDashboardData();
            }}
            onSave={(updatedDocument) => {
              setIsEditingDocument(false);
              // Update the selected document with the updated data
              setSelectedDocument(updatedDocument);
              // Reload document data to reflect changes
              loadDashboardData();
            }}
            theme={theme}
          />
        ) : selectedDocument ? (
          // DocumentDetail component
          <DocumentDetail 
            document={selectedDocument}
            onBack={handleBackToList}
            onDelete={(documentId) => {
              // Refresh the document list after deleting a document
              loadDashboardData();
            }}
            onEdit={(detailedDocument) => {
              // Update the selectedDocument with the detailed data if provided
              if (detailedDocument) {
                setSelectedDocument(detailedDocument);
              }
              setIsEditingDocument(true);
            }}
            theme={theme}
          />
        ) : showCreateForm === 'memo' ? (
          // MemoForm component for creating memo documents
          <MemoForm
            currentUser={currentUser}
            onBack={handleBackToList}
            onSave={(formData, documentId) => {
              // Handle form submission
              // console.log('Memo form submitted:', formData);
              // In a real app, this would save to the backend
              // Select the newly created document to show its detail view
              if (documentId) {
                // Create a minimal document object to show in detail view
                const newDocument = {
                  id: documentId,
                  documentType: 'memo',
                  title: 'Новая служебная записка',
                  status: 'prepared'
                };
                setSelectedDocument(newDocument);
                setShowCreateForm(null); // Hide the form
              } else {
                handleBackToList();
              }
              // Refresh the document list after creating a document
              loadDashboardData();
            }}
            theme={theme}
          />
        ) : showCreateForm === 'expenditure' ? (
          // ExpenditureForm component for creating expenditure documents
          <ExpenditureForm
            currentUser={currentUser}
            onBack={handleBackToList}
            onSave={(formData, documentId) => {
              // Handle form submission
              // console.log('Expenditure form submitted:', formData);
              // In a real app, this would save to the backend
              // Select the newly created document to show its detail view
              if (documentId) {
                // Create a minimal document object to show in detail view
                const newDocument = {
                  id: documentId,
                  documentType: 'expenditure',
                  title: 'Новая заявка на расходы',
                  status: 'prepared'
                };
                setSelectedDocument(newDocument);
                setShowCreateForm(null); // Hide the form
              } else {
                handleBackToList();
              }
              // Refresh the document list after creating a document
              loadDashboardData();
            }}
            theme={theme}
          />
        ) : showCreateForm === 'payment' ? (
          // PaymentCreationForm component for creating payment documents
          <PaymentCreationForm
            currentUser={currentUser}
            onBack={handleBackToList}
            onSave={(formData, documentId) => {
              // Handle form submission
              // console.log('Payment form submitted:', formData);
              // In a real app, this would save to the backend
              // Select the newly created document to show its detail view
              if (documentId) {
                // Create a minimal document object to show in detail view
                const newDocument = {
                  id: documentId,
                  documentType: 'payment',
                  title: 'Новый платежный документ',
                  status: 'prepared'
                };
                setSelectedDocument(newDocument);
                setShowCreateForm(null); // Hide the form
              } else {
                handleBackToList();
              }
              // Refresh the document list after creating a document
              loadDashboardData();
            }}
            theme={theme}
          />
        ) : showCreateForm ? (
          // Empty DocumentForm component - will be implemented later
          <div className="document-form-container">
            <div className="content-card">
              <div className="card-header">
                <h2>Создание документа</h2>
                <button 
                  className="back-button"
                  onClick={handleBackToList}
                >
                  <i className="fas fa-arrow-left"></i> Назад
                </button>
              </div>
              <div className="form-content">
                <p>Форма создания документа типа "{showCreateForm}" будет отображаться здесь.</p>
                <p>Этот компонент будет реализован на следующем этапе.</p>
              </div>
            </div>
          </div>
        ) : (
          // DocumentList component - showing list of documents
          <DocumentList 
            documents={documents}
            onDocumentSelect={handleDocumentSelect}
            filter={filter}
            onFilterChange={handleFilterChange}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;