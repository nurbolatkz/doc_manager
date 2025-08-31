import React, { useState } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';

const PaymentCreationForm = ({ currentUser, onBack, onSave, theme }) => {
  // Initialize with today's date
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

  const [documentInfo, setDocumentInfo] = useState({
    number: '00000000009',
    date: formattedDate
  });

  const [payments, setPayments] = useState([
    {
      id: 1,
      description: 'Расходы на проезд',
      details: 'Командировочные расходы',
      project: 'СТС Астана ПОО',
      ersNumber: '00000000007',
      counterparty: 'СТС Астана ПОО',
      paymentType: 'Запланированный',
      amount: 150000.00
    },
    {
      id: 2,
      description: 'Сервисное обслуживание системы кондиционирования',
      details: 'Техническое обслуживание',
      project: 'СТС Астана ПОО',
      ersNumber: '00000000007',
      counterparty: 'ТД Электрокомплект ТОО Филиал в г. Астана',
      paymentType: 'Запланированный',
      amount: 85000.00
    },
    {
      id: 3,
      description: 'Офисные расходы',
      details: 'Канцелярские товары',
      project: 'СТС Астана ПОО',
      ersNumber: '00000000007',
      counterparty: 'ОфисМаркет ТОО',
      paymentType: 'Запланированный',
      amount: 45000.00
    }
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    
    if (payments.length === 0) {
      showCustomMessage('Добавьте хотя бы один платеж', 'danger');
      return;
    }
    
    // Calculate total amount
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const paymentData = {
      documentInfo,
      payments,
      totalAmount
    };
    
    showCustomMessage('Платежный документ успешно сохранен', 'success');
    
    if (onSave) {
      onSave(paymentData);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`document-detail-container ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {/* Header - matching your HTML structure */}
      <header className="corporate-header">
        <div className="container header-inner">
          <div className="logo">
            <div className="logo-text">CORPORATE PORTAL</div>
          </div>
          <div className="user-menu">
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}><i className="fas fa-bell"></i></a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}><i className="fas fa-cog"></i></a>
            <div className="user-avatar">IP</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`main-content ${theme?.mode === 'dark' ? 'dark' : 'light'}`}>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Создание Платежного Документа</h1>
            <div className="page-subtitle">Данные согласовываемого документа</div>
          </div>

          <div className="form-container">
            {/* Document Information */}
            <div className="document-info">
              <div className="info-item">
                <span className="info-label">Номер:</span>
                <span className="info-value">{documentInfo.number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Дата:</span>
                <span className="info-value">{documentInfo.date}</span>
              </div>
            </div>

            {/* Payment Table */}
            <div className="table-header">
              <h2 className="table-title">Платежи</h2>
              <button type="button" className="btn btn-success">
                <i className="fas fa-plus"></i> Заполнить
              </button>
            </div>

            <div className="payment-table-container">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Проект</th>
                    <th>Номер ЭРС</th>
                    <th>Контрагент</th>
                    <th>Тип платежа</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <div className="payment-description">{payment.description}</div>
                        <div className="payment-details">{payment.details}</div>
                      </td>
                      <td>{payment.project}</td>
                      <td>{payment.ersNumber}</td>
                      <td>{payment.counterparty}</td>
                      <td>{payment.paymentType}</td>
                      <td className="payment-amount">{formatCurrency(payment.amount)} ₸</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Amount */}
            <div className="total-section">
              <span className="total-label">Общая сумма:</span>
              <span className="total-amount">
                {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))} ₸
              </span>
            </div>

            {/* Form Actions */}
            <div className="action-buttons mt-4">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onBack}
              >
                <i className="fas fa-times"></i> Отмена
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSave}
              >
                <i className="fas fa-save"></i> Сохранить документ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCreationForm;