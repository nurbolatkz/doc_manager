import React, { useState, useEffect } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';
import { sanitizeInput } from '../utils/inputSanitization';

const DocumentList = ({ documents, onDocumentSelect, filter, onFilterChange, theme }) => {
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [uniqueOrganizations, setUniqueOrganizations] = useState([]);
  const [uniqueCounterparties, setUniqueCounterparties] = useState([]);

  // Extract unique organizations and counterparties from documents
  useEffect(() => {
    const orgs = new Set();
    const cps = new Set();
    
    documents.forEach(doc => {
      // Extract organizations
      if (doc.organization) {
        const orgName = typeof doc.organization === 'string' 
          ? doc.organization 
          : doc.organization?.name;
        if (orgName) orgs.add(orgName);
      }
      
      // Extract counterparties
      if (doc.counterparty) {
        const cpName = typeof doc.counterparty === 'string' 
          ? doc.counterparty 
          : doc.counterparty?.name;
        if (cpName) cps.add(cpName);
      }
    });
    
    setUniqueOrganizations(Array.from(orgs).sort());
    setUniqueCounterparties(Array.from(cps).sort());
  }, [documents]);

  // Function to parse date strings in format "dd.mm.yyyy hh:mm:ss"
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // Handle format "dd.mm.yyyy hh:mm:ss"
    if (dateString.includes('.') && dateString.includes(':')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('.');
      const [hour, minute, second] = timePart.split(':');
      return new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Handle format "dd.mm.yyyy" (date only)
    if (dateString.includes('.') && !dateString.includes(':')) {
      const [day, month, year] = dateString.split('.');
      return new Date(year, month - 1, day);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'on_approving':
        return 'status-on_approving';
      case 'declined':
        return 'status-rejected';
      case 'prepared':
        return 'status-prepared';
      default:
        return 'status-on_approving';
    }
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

  const handleSearch = () => {
    const sanitizedSearchQuery = sanitizeInput(searchQuery);
    onFilterChange({ ...filter, searchQuery: sanitizedSearchQuery });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (field, value) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    onFilterChange({ 
      ...filter, 
      [field]: sanitizedValue || undefined 
    });
  };

  const handleApplyFilters = (newFilters) => {
    // Sanitize filter values
    const sanitizedFilters = {};
    for (const key in newFilters) {
      if (newFilters.hasOwnProperty(key)) {
        sanitizedFilters[key] = typeof newFilters[key] === 'string' ? 
          sanitizeInput(newFilters[key]) : newFilters[key];
      }
    }
    onFilterChange({ ...filter, ...sanitizedFilters });
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    onFilterChange({});
    setSearchQuery('');
  };

  // Filter documents based on current filter
  const filteredDocuments = documents.filter(doc => {
    if (filter.documentType && doc.documentType !== filter.documentType) return false;
    if (filter.status && doc.status !== filter.status) return false;
    if (filter.organization) {
      const orgName = typeof doc.organization === 'string' 
        ? doc.organization 
        : doc.organization?.name;
      if (orgName && orgName !== filter.organization) return false;
    }
    if (filter.counterparty) {
      const cpName = typeof doc.counterparty === 'string' 
        ? doc.counterparty 
        : doc.counterparty?.name;
      if (cpName && cpName !== filter.counterparty) return false;
    }
    if (filter.documentNumber) {
      // Changed from exact match to partial match
      if (doc.number && !doc.number.includes(filter.documentNumber)) return false;
    }
    
    // Add date range filtering for "Дата создания" column
    if (filter.dateFrom || filter.dateTo) {
      const docDate = parseDateString(doc.uploadDate);
      if (docDate) {
        if (filter.dateFrom) {
          const fromDate = new Date(filter.dateFrom);
          // Set time to start of day for comparison
          fromDate.setHours(0, 0, 0, 0);
          if (docDate < fromDate) return false;
        }
        if (filter.dateTo) {
          const toDate = new Date(filter.dateTo);
          // Set time to end of day for comparison
          toDate.setHours(23, 59, 59, 999);
          if (docDate > toDate) return false;
        }
      } else if (filter.dateFrom || filter.dateTo) {
        // If document date can't be parsed and we have date filters, exclude it
        return false;
      }
    }
    
    if (filter.searchQuery) {
      const sanitizedQuery = sanitizeInput(filter.searchQuery);
      const query = sanitizedQuery.toLowerCase();
      const orgName = typeof doc.organization === 'string' 
        ? doc.organization 
        : doc.organization?.name || '';
      const cpName = typeof doc.counterparty === 'string' 
        ? doc.counterparty 
        : doc.counterparty?.name || '';
        
      return (
        (doc.title && doc.title.toLowerCase().includes(query)) ||
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        (doc.id && doc.id.toLowerCase().includes(query)) ||
        (doc.number && doc.number.toLowerCase().includes(query)) ||
        orgName.toLowerCase().includes(query) ||
        cpName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Document Card Component for mobile/tablet
  const DocumentCard = ({ document, index }) => {
    return (
      <div 
        className="document-card"
        onClick={() => onDocumentSelect(document)}
      >
        <div className="document-card-header">
          <h3>{document.title || 'Без названия'}</h3>
          <span className={`status-badge ${getStatusBadgeClass(document.status)}`}>
            {getStatusText(document.status)}
          </span>
        </div>
        <div className="document-card-body">
          <div className="document-card-row">
            <span className="document-card-label">Номер документа:</span>
            <span className="document-card-value">{document.number || document.id || '-'}</span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Тип:</span>
            <span className="document-card-value">{getDocumentTypeText(document.documentType)}</span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Организация:</span>
            <span className="document-card-value">{document.organization ? document.organization.name || document.organization : '-'}</span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Контрагент:</span>
            <span className="document-card-value">
              {typeof document.counterparty === 'string' 
                ? document.counterparty 
                : document.counterparty?.name || '-'}
            </span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Сумма:</span>
            <span className="document-card-value">
              {document.amount ? formatCurrency(document.amount, document.currency) : '-'}
            </span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Дата создания:</span>
            <span className="document-card-value">{formatDate(document.uploadDate)}</span>
          </div>
          <div className="document-card-row">
            <span className="document-card-label">Автор:</span>
            <span className="document-card-value">
              {document.uploadedBy ? document.uploadedBy.name : '-'}
            </span>
          </div>
          {document.description && (
            <div className="document-card-description">
              <p>{document.description}</p>
            </div>
          )}
        </div>
        <div className="document-card-footer">
          <button 
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDocumentSelect(document);
            }}
          >
            <i className="fas fa-eye"></i> Просмотреть
          </button>
        </div>
      </div>
    );
  };

  // Filter Modal Component
  const FilterModal = () => {
    const [localFilters, setLocalFilters] = useState({
      documentType: filter.documentType || '',
      status: filter.status || '',
      organization: filter.organization || '',
      counterparty: filter.counterparty || '',
      documentNumber: filter.documentNumber || '',
      dateFrom: filter.dateFrom || '',
      dateTo: filter.dateTo || ''
    });

    const handleLocalFilterChange = (field, value) => {
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
      setLocalFilters({
        ...localFilters,
        [field]: sanitizedValue
      });
    };

    return (
      <div className="modal-overlay active">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Фильтры</h3>
            <button 
              className="modal-close" 
              onClick={() => setShowFilterModal(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="filter-group">
              <h4>Тип документа</h4>
              <select
                className="form-control"
                value={localFilters.documentType}
                onChange={(e) => handleLocalFilterChange('documentType', e.target.value)}
              >
                <option value="">Все типы документов</option>
                {/* Only show 3 types of payment documents */}
                <option value="payment">План Платежей</option>
                <option value="expenditure">Заявка на расходование</option>
                <option value="memo">Служебная записка</option>
              </select>
            </div>

            <div className="filter-group">
              <h4>Статус</h4>
              <select
                className="form-control"
                value={localFilters.status}
                onChange={(e) => handleLocalFilterChange('status', e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="on_approving">На согласовании</option>
                <option value="approved">Утверждено</option>
                <option value="declined">Отклонено</option>
                <option value="prepared">Подготовлено</option>
                <option value="rejected">Отклонен</option>
              </select>
            </div>

            <div className="filter-group">
              <h4>Организация</h4>
              <select
                className="form-control"
                value={localFilters.organization}
                onChange={(e) => handleLocalFilterChange('organization', e.target.value)}
              >
                <option value="">Все организации</option>
                {uniqueOrganizations.map((org, index) => (
                  <option key={index} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4>Контрагент</h4>
              <select
                className="form-control"
                value={localFilters.counterparty}
                onChange={(e) => handleLocalFilterChange('counterparty', e.target.value)}
              >
                <option value="">Все контрагенты</option>
                {uniqueCounterparties.map((cp, index) => (
                  <option key={index} value={cp}>
                    {cp}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4>Номер документа</h4>
              <input
                type="text"
                className="form-control"
                placeholder="Введите номер документа"
                value={localFilters.documentNumber}
                onChange={(e) => handleLocalFilterChange('documentNumber', sanitizeInput(e.target.value))}
              />
            </div>

            <div className="filter-group">
              <h4>Дата создания</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>От:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleLocalFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>До:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={localFilters.dateTo}
                    onChange={(e) => handleLocalFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-secondary"
              onClick={handleClearFilters}
            >
              Очистить
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => handleApplyFilters(localFilters)}
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`document-list-container ${theme && theme.mode === 'dark' ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="content-header">
        <h2>Список документов</h2>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="d-flex gap-3 mb-3 flex-wrap filter-controls">
          {/* Search */}
          <div className="flex-1" style={{ minWidth: '250px', marginRight: '10px' }}>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
                onKeyPress={handleKeyPress}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>

          {/* Search Button */}
          <div>
            <button
              className="btn btn-primary"
              onClick={handleSearch}
            >
              <i className="fas fa-search"></i> Поиск
            </button>
          </div>

          {/* Filter Button */}
          <div>
            <button
              className="btn btn-primary"
              onClick={() => setShowFilterModal(true)}
            >
              <i className="fas fa-filter"></i> Фильтры
            </button>
          </div>

          {/* Clear Button */}
          <div>
            <button
              className="btn btn-secondary"
              onClick={handleClearFilters}
            >
              <i className="fas fa-times"></i> Очистить
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && <FilterModal />}

      {/* Responsive Document Display */}
      {/* Mobile/Tablet Cards */}
      <div className="document-cards-container">
        {filteredDocuments.length === 0 ? (
          <div className="no-documents">
            <i className="fas fa-file-alt fa-3x mb-3"></i>
            <p>Документы не найдены. Попробуйте изменить критерии поиска или фильтры.</p>
          </div>
        ) : (
          filteredDocuments.map((document, index) => (
            <DocumentCard key={document.id} document={document} index={index} />
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="documents-table-container">
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <thead className="table-light">
              <tr>
                 <th scope="col" className="w-10">№</th>
                    <th scope="col">Название документа</th>
                    <th scope="col">Номер документа</th>
                    <th scope="col">Организация</th>
                    <th scope="col">Контрагент</th>
                    <th scope="col">Сумма</th>
                    <th scope="col">Дата создания</th>
                    <th scope="col">Автор</th>
                    <th scope="col">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    Документы не найдены. Попробуйте изменить критерии поиска или фильтры.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((document, index) => (
                  <tr key={document.id} style={{ cursor: 'pointer' }} onClick={() => onDocumentSelect(document)}>
                    <td>{index + 1}</td>
                    <td>
                      <div>
                        <strong>{document.title || 'Без названия'}</strong>
                        <br />
                        {document.description && (
                          <small className="text-muted">{document.description}</small>
                        )}
                      </div>
                    </td>
                    <td>{document.number || '-'}</td>
                    <td>{document.organization ? document.organization.name || document.organization : '-'}</td>
                    <td>
                      {typeof document.counterparty === 'string' 
                        ? document.counterparty 
                        : document.counterparty?.name || '-'}
                    </td>
                    <td>{document.amount ? formatCurrency(document.amount, document.currency) : '-'}</td>
                    <td>{formatDate(document.uploadDate)}</td>
                    <td>{document.uploadedBy ? document.uploadedBy.name : '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(document.status)}`}>
                        {getStatusText(document.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;