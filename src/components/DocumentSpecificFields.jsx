import React from 'react';

const DocumentSpecificFields = ({ documentDetail, theme, formatDate, formatCurrency }) => {
  if (!documentDetail) return null;

  // Function to get document type text by GUID
  const getDocumentTypeText = (type) => {
    switch(type) {
      case 'payment': return 'Заявка на оплату';
      case 'memo': return 'Служебная записка';
      case 'expenditure': return 'Заявка на расходы';
      case 'payment_request': return 'Запрос на оплату';
      default: return 'Документ';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': return 'Утверждено';
      case 'on_approving': return 'На согласовании';
      case 'rejected': return 'Отклонено';
      case 'prepared': return 'Подготовлено';
      default: return 'На рассмотрении';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'on_approving': return 'status-on_approving';
      case 'rejected': return 'status-rejected';
      case 'prepared': return 'status-prepared';
      default: return 'status-on_approving';
    }
  };

  switch (documentDetail.documentType) {
    case 'payment':
      return (
        <>
          {/* Document Header */}
         

          {/* Basic Information Section */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <i className="fas fa-info-circle"></i>
              Основная информация
            </div>
            <div className="info-grid">
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.responsible || 'Не указано'}</span>
                </div>
              </div>
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Комментарий:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.comment || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="table-section">
              <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <i className="fas fa-table"></i>
                Запланированные платежи
              </div>
              <div className="table-container">
                <table className={`payment-table ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                  <thead>
                    <tr>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>№</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Заявка</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Организация</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Валюта</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Сумма по заявке</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Дата платежа</th>
                      <th className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentDetail.paymentLines && documentDetail.paymentLines.length > 0 ? (
                      documentDetail.paymentLines.map((payment, index) => (
                        <tr key={index}>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{index + 1}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.Заявка || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.Организация || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.Проект || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.Валюта || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.СуммаПоЗаявке?.toString() || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{formatDate(payment.ДатаПлатежа) || 'Не указано'}</td>
                          <td className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{payment.Сумма?.toString() || 'Не указано'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className={`text-center ${theme?.mode === 'dark' ? 'dark' : ''}`}>
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
        <>
          {/* Document Header */}
          
          {/* Basic Information Section */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <i className="fas fa-info-circle"></i>
              Основная информация
            </div>
            <div className="info-grid">
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Автор:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.author || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.responsible || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Document Type and Organization Section */}
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Тип документа:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.documentTypeValue  || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Организация:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.organization || 'Не указано'}</span>
                </div>
              </div>
              
              {/* CFO and Project Section */}
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.project || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>ЦФО:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.cfo || 'Не указано'}</span>
                </div>
              </div>
              
              {/* Message Section */}
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Сообщение:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.message || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    
    case 'expenditure':
    case 'payment_request':
      return (
        <>
          {/* Document Header */}
          

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
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{formatDate(documentDetail.expenseDate) || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Вид операции:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.operationType || 'Не указано'}</span>
                </div>
              </div>
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.responsible || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Проект:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.project || 'Не указано'}</span>
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
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                    {documentDetail.amount ? formatCurrency(documentDetail.amount) : 'Не указано'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Валюта:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.currency || 'Не указано'}</span>
                </div>
              </div>
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Форма оплаты:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.paymentForm || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Сумма взаиморасчетов:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.amountOfSettlements || 'Не указано'}</span>
                </div>
              </div>
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ставка НДС:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.VATRate || 'Не указано'}</span>
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
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.counterparty || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Договор контрагента:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.contract || 'Не указано'}</span>
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
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>ЦФО:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.cfo || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Организационная структура:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.orgStructure || 'Не указано'}</span>
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
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.ddsArticle || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Статья бюджета:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.budgetArticle || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <i className="fas fa-comment"></i>
              Дополнительная информация
            </div>
            <div className="info-grid">
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`} style={{ gridColumn: 'span 3' }}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Комментарий:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.comment || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    
    default:
      return (
        <>
          {/* Document Header */}
          <div className={`document-detail-header mb-6 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold text-gray-900 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                {documentDetail.title || 'Документ'}
              </h1>
            
            </div>
            <div className="mt-2 flex items-center">
              <span className={`status-badge ${getStatusBadgeClass(documentDetail.status)}`}>
                {getStatusText(documentDetail.status)}
              </span>
              <span className={`ml-3 text-sm text-gray-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                {formatDate(documentDetail.date) || 'Не указано'}
              </span>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <i className="fas fa-info-circle"></i>
              Информация о документе
            </div>
            <div className="info-grid">
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Автор:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.author || 'Не указано'}</span>
                </div>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Ответственный:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.responsible || 'Не указано'}</span>
                </div>
              </div>
              <div className={`detail-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                <div className="detail-item">
                  <span className={`detail-label ${theme?.mode === 'dark' ? 'dark' : ''}`}>Комментарий:</span>
                  <span className={`detail-value ${theme?.mode === 'dark' ? 'dark' : ''}`}>{documentDetail.comment || 'Не указано'}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
  }
};

export default DocumentSpecificFields;