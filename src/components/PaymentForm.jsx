import React, { useState } from 'react';
import './Dashboard_Restructured.css';
import { showCustomMessage } from '../utils';

const PaymentForm = ({ currentUser, onBack, onSave }) => {
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

  const [newPayment, setNewPayment] = useState({
    description: '',
    details: '',
    project: '',
    ersNumber: '',
    counterparty: '',
    paymentType: 'Запланированный',
    amount: ''
  });

  const handleAddPayment = () => {
    if (!newPayment.description || !newPayment.amount) {
      showCustomMessage('Пожалуйста, заполните обязательные поля', 'danger');
      return;
    }

    const payment = {
      id: Date.now(),
      ...newPayment,
      amount: parseFloat(newPayment.amount)
    };

    setPayments([...payments, payment]);
    setNewPayment({
      description: '',
      details: '',
      project: '',
      ersNumber: '',
      counterparty: '',
      paymentType: 'Запланированный',
      amount: ''
    });
    
    showCustomMessage('Платеж добавлен успешно', 'success');
  };

  const handleRemovePayment = (id) => {
    if (payments.length <= 1) {
      showCustomMessage('Документ должен содержать хотя бы один платеж', 'warning');
      return;
    }
    
    setPayments(payments.filter(payment => payment.id !== id));
    showCustomMessage('Платеж удален', 'success');
  };

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
    <div className="document-detail-container">
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <div>
            <h2>Создание Платежного Документа</h2>
            <p className="text-muted">Данные согласовываемого документа</p>
          </div>
          <button 
            className="back-button"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>

      <div className="content-card">
        <form onSubmit={handleSave}>
          {/* Document Information */}
          <div className="document-info mb-4">
            <div className="info-item">
              <span className="info-label">Номер:</span>
              <span className="info-value">{documentInfo.number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Дата:</span>
              <span className="info-value">{documentInfo.date}</span>
            </div>
          </div>

          {/* Add Payment Form */}
          <div className="form-section mb-4">
            <div className="form-section-title">Добавить новый платеж</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Наименование *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  placeholder="Введите наименование платежа"
                />
              </div>
              
              <div className="form-group">
                <label>Детали</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPayment.details}
                  onChange={(e) => setNewPayment({...newPayment, details: e.target.value})}
                  placeholder="Введите детали платежа"
                />
              </div>
              
              <div className="form-group">
                <label>Проект</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPayment.project}
                  onChange={(e) => setNewPayment({...newPayment, project: e.target.value})}
                  placeholder="Введите проект"
                />
              </div>
              
              <div className="form-group">
                <label>Номер ЭРС</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPayment.ersNumber}
                  onChange={(e) => setNewPayment({...newPayment, ersNumber: e.target.value})}
                  placeholder="Введите номер ЭРС"
                />
              </div>
              
              <div className="form-group">
                <label>Контрагент</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPayment.counterparty}
                  onChange={(e) => setNewPayment({...newPayment, counterparty: e.target.value})}
                  placeholder="Введите контрагента"
                />
              </div>
              
              <div className="form-group">
                <label>Тип платежа</label>
                <select
                  className="form-control"
                  value={newPayment.paymentType}
                  onChange={(e) => setNewPayment({...newPayment, paymentType: e.target.value})}
                >
                  <option value="Запланированный">Запланированный</option>
                  <option value="Срочный">Срочный</option>
                  <option value="Периодический">Периодический</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Сумма *</label>
                <input
                  type="number"
                  className="form-control"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  placeholder="Введите сумму"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleAddPayment}
              >
                <i className="fas fa-plus"></i> Добавить платеж
              </button>
            </div>
          </div>

          {/* Payment Table */}
          <div className="table-header mb-3">
            <h2 className="table-title">Платежи</h2>
          </div>

          <div className="payment-table-container mb-4">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Проект</th>
                  <th>Номер ЭРС</th>
                  <th>Контрагент</th>
                  <th>Тип платежа</th>
                  <th>Сумма</th>
                  <th>Действия</th>
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
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemovePayment(payment.id)}
                      >
                        <i className="fas fa-trash"></i> Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="total-section mb-4">
            <span className="total-label">Общая сумма:</span>
            <span className="total-amount">
              {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))} ₸
            </span>
          </div>

          {/* Form Actions */}
          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onBack}
            >
              <i className="fas fa-times"></i> Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              <i className="fas fa-save"></i> Сохранить документ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;