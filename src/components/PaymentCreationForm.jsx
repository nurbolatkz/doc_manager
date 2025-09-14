import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, X, FileText, Calendar, Hash, Building2, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../services/fetchManager';
import { t } from '../utils/messages';
import './PaymentCreationForm.css';

const PaymentCreationForm = ({ currentUser, onBack, onSave, theme = { mode: 'light' } }) => {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

  const [documentInfo, setDocumentInfo] = useState({
    number: '00000000009',
    date: formattedDate
  });

  // Start with an empty payments array
  const [payments, setPayments] = useState([]);

  const [showAmounts, setShowAmounts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]); // Multiple selection

  const showCustomMessage = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Function to fetch payment lines and populate the main table
  const fetchPaymentLines = async () => {
    try {
      setIsLoading(true);
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
        
        setPayments(newPayments);
        // Initialize all payments as selected
        setSelectedPayments(newPayments.map(payment => payment.id));
      } else {
        showCustomMessage('Ошибка при загрузке данных', 'danger');
      }
    } catch (error) {
      console.error("Error fetching payment lines:", error);
      showCustomMessage('Ошибка при загрузке данных: ' + error.message, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (payments.length === 0) {
      showCustomMessage('Добавьте хотя бы один платеж', 'danger');
      return;
    }
    
    // Filter payments to only include selected ones
    const selectedPaymentsData = payments.filter(payment => selectedPayments.includes(payment.id));
    
    if (selectedPaymentsData.length === 0) {
      showCustomMessage('Выберите хотя бы один платеж', 'danger');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare the payment lines data for the request
      const paymentLines = selectedPaymentsData.map(payment => ({
        GUID: payment.guid,
        amount: payment.amount,
        paymentDate: payment.paymentDate
      }));
      
      // Prepare the request body
      const requestBody = {
        username: "Администратор",
        token: "",
        action: "save_document_payment",
        type: "payment",
        paymentLines: paymentLines
      };
      
      // Send the request using apiRequest
      const response = await apiRequest("register_document_action", requestBody, "");
      
      if (response && response.success === 1) {
        showCustomMessage('Платежный документ успешно сохранен', 'success');
        if (onSave) {
          onSave({ documentInfo, payments: selectedPaymentsData, totalAmount: selectedPaymentsData.reduce((sum, payment) => sum + payment.amount, 0) });
        }
      } else {
        const errorMessage = response && response.message ? response.message : 'Не удалось сохранить документ';
        showCustomMessage(errorMessage, 'danger');
      }
    } catch (error) {
      console.error("Error saving payment document:", error);
      showCustomMessage('Ошибка при сохранении документа: ' + error.message, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const totalAmount = payments
    .filter(payment => selectedPayments.includes(payment.id))
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Function to handle checkbox change for a payment
  const handlePaymentSelection = (id) => {
    setSelectedPayments(prev => {
      if (prev.includes(id)) {
        return prev.filter(paymentId => paymentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Function to select/deselect all payments
  const toggleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      // If all are selected, deselect all
      setSelectedPayments([]);
    } else {
      // If not all are selected, select all
      setSelectedPayments(payments.map(payment => payment.id));
    }
  };

  // Function to update payment amount
  const updatePaymentAmount = (id, amount) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id 
          ? { ...payment, amount: parseFloat(amount) || 0 } 
          : payment
      )
    );
  };

  // Function to update payment date
  const updatePaymentDate = (id, date) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id 
          ? { ...payment, paymentDate: date } 
          : payment
      )
    );
  };

  // Render payment as a card for mobile view
  const renderPaymentCard = (payment, index) => (
    <div 
      key={payment.id}
      onClick={() => handlePaymentSelection(payment.id)}
      className={`card-3d payment-card ${theme?.mode === 'dark' ? 'dark' : ''}`}
    >
      <div className="payment-card-header">
        <div>
          <div className="flex items-center">
            {selectedPayments.includes(payment.id) ? (
              <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center mr-2">
                <span className="text font-bold text-xs">✓</span>
              </div>
            ) : (
              <div className={`w-5 h-5 border rounded mr-2 ${
                theme?.mode === 'dark' ? 'border-slate-500' : 'border-slate-300'
              }`}></div>
            )}
            <div>
              <div className={`payment-card-title ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payment.description}
              </div>
              <div className="payment-card-subtitle">
                {payment.details}
              </div>
            </div>
          </div>
        </div>
        <span className={`payment-card-badge ${
          payment.paymentType === 'Запланированный'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {payment.paymentType}
        </span>
      </div>

      <div className="payment-card-content">
        <div className="payment-card-field">
          <div className="payment-card-label">Проект</div>
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-1 text-blue-500" />
            <span className="payment-card-value">{payment.project || '-'}</span>
          </div>
        </div>

        <div className="payment-card-field">
          <div className="payment-card-label">Номер ЭРС</div>
          <div className="payment-card-value font-mono">{payment.ersNumber || '-'}</div>
        </div>

        <div className="payment-card-field">
          <div className="payment-card-label">Контрагент</div>
          <div className="payment-card-value">{payment.counterparty || '-'}</div>
        </div>

        <div className="payment-card-field">
          <div className="payment-card-label">Дата платежа</div>
          <input
            type="date"
            value={new Date(payment.paymentDate).toISOString().split('T')[0]}
            onChange={(e) => updatePaymentDate(payment.id, e.target.value)}
            className="input-3d payment-card-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="payment-card-field">
          <div className="payment-card-label">Сумма</div>
          <input
            type="number"
            value={payment.amount}
            onChange={(e) => updatePaymentAmount(payment.id, e.target.value)}
            className="input-3d payment-card-input text-right font-bold"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={theme?.mode === 'dark' ? 'dark-mode' : ''}>
      {/* Notification */}
      {notification && (
        <div className={`notification-3d fixed top-5 right-5 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="content-card">
          <div className="card-header">
            <h2>Создать Платежный Документ</h2>
            <button 
              className="back-button"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Page Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-3 text-gradient">Создание Платежного Документа</h1>
            <p className={`text-lg ${theme?.mode === 'dark' ? 'text-muted' : 'text-gray-600'}`}>Данные согласовываемого документа</p>
          </div>

          {/* Document Info Card */}
          <div className={`card-3d ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg mr-3 ${theme?.mode === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <FileText className={`w-5 h-5 ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className="text-xl font-bold">Информация о документе</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`card-3d p-4 ${theme?.mode === 'dark' ? 'dark bg-slate-700' : 'bg-slate-50'}`}>
                  <div className="flex items-center mb-2">
                    <Calendar className={`w-4 h-4 mr-2 ${theme?.mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${theme?.mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Дата создания</span>
                  </div>
                  <div className={`text-lg font-bold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documentInfo.date}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Management Card */}
          <div className={`card-3d ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-3 ${theme?.mode === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <CreditCard className={`w-5 h-5 ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Управление платежами</h2>
                    <p className={`text-xs mt-1 ${theme?.mode === 'dark' ? 'text-muted' : 'text-gray-600'}`}>Всего платежей: {payments.length}</p>
                  </div>
                </div>
                
                <button 
                  onClick={fetchPaymentLines}
                  disabled={isLoading}
                  className="btn-3d btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Заполнить платежи</span>
                    </>
                  )}
                </button>
              </div>

              {/* Payments Table for Desktop and Cards for Mobile */}
              <div className="overflow-x-auto">
                {/* Desktop Table View (hidden on mobile) */}
                <div className="hidden md:block">
                  <table className={`table-3d ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedPayments.length > 0 && selectedPayments.length === payments.length}
                            onChange={toggleSelectAll}
                            className="rounded w-4 h-4"
                          />
                        </th>
                        <th>Наименование</th>
                        <th>Проект</th>
                        <th>Номер ЭРС</th>
                        <th>Контрагент</th>
                        <th>Тип платежа</th>
                        <th>Дата платежа</th>
                        <th className="text-right">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className={`px-6 py-8 text-center ${theme?.mode === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                            Нет данных. Нажмите "Заполнить платежи" для добавления платежей.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment, index) => (
                          <tr 
                            key={payment.id} 
                            onClick={() => handlePaymentSelection(payment.id)}
                            className={selectedPayments.includes(payment.id) ? (theme?.mode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''}
                          >
                           <td>
                            {selectedPayments.includes(payment.id) ? (
                              <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center shadow-sm border-2 border-emerald-600">
                                <span className="font-bold text-sm">✓</span>
                              </div>
                            ) : (
                              <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors ${
                                theme?.mode === 'dark' 
                                  ? 'border-slate-400 bg-slate-700 hover:bg-slate-600' 
                                  : 'border-slate-400 bg-white hover:bg-slate-50 shadow-sm'
                              }`}>
                                <div className={`w-2 h-2 rounded-sm ${
                                  theme?.mode === 'dark' ? 'bg-slate-500' : 'bg-slate-200'
                                }`}></div>
                              </div>
                            )}
                          </td>
                            <td>
                              <div>
                                <div className={`font-semibold text-sm ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.description}</div>
                                <div className={`text-xs mt-1 ${theme?.mode === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{payment.details}</div>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center">
                                <Building2 className="w-4 h-4 mr-1 text-blue-500" />
                                <span>{payment.project}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`px-2 py-1 rounded text-xs font-mono ${theme?.mode === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                {payment.ersNumber}
                              </span>
                            </td>
                            <td className="text-sm">{payment.counterparty}</td>
                            <td>
                              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                                payment.paymentType === 'Запланированный'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {payment.paymentType}
                              </span>
                            </td>
                            <td>
                              <input
                                type="date"
                                value={new Date(payment.paymentDate).toISOString().split('T')[0]}
                                onChange={(e) => updatePaymentDate(payment.id, e.target.value)}
                                className="input-3d w-full text-sm"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => updatePaymentAmount(payment.id, e.target.value)}
                                className={`input-3d w-full text-right font-bold text-sm ${theme?.mode === 'dark' ? 'dark' : ''}`}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (hidden on desktop) */}
                <div className="md:hidden">
                  {/* Select all checkbox */}
                  {payments.length > 0 && (
                    <div className={`select-all-container ${theme?.mode === 'dark' ? 'dark' : ''} mb-4 mt-4`}>
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectedPayments.length > 0 && selectedPayments.length === payments.length}
                        onChange={toggleSelectAll}
                        className="select-all-checkbox"
                        style={{ display: 'inline-block', verticalAlign: 'middle' }}
                      />
                      <label 
                        htmlFor="select-all" 
                        className={`text-sm cursor-pointer ${theme?.mode === 'dark' ? 'text-slate-300' : 'text-gray-700'} ml-2`}
                      >
                        Выбрать все ({selectedPayments.length}/{payments.length})
                      </label>
                    </div>
                  )}
                  
                  {payments.length === 0 ? (
                    <div className={`empty-state ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                      <p className={theme?.mode === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                        Нет данных. Нажмите "Заполнить платежи" для добавления платежей.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {payments.map((payment, index) => renderPaymentCard(payment, index))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount Summary */}
          <div className={`card-3d total-amount-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-3 ${theme?.mode === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Hash className={`w-5 h-5 ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Общая сумма документа</h3>
                    <p className={`text-xs mt-1 ${theme?.mode === 'dark' ? 'text-muted' : 'text-gray-600'}`}>Итоговая сумма всех платежей</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {showAmounts ? `${formatCurrency(totalAmount)} ₸` : '••••••••'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={onBack}
              className="btn-3d btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              <span>Отмена</span>
            </button>
            
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="btn-3d btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Сохранить документ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCreationForm;