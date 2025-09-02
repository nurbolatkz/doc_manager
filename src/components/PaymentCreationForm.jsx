import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, X, FileText, Calendar, Hash, Building2, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../services/fetchManager';

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

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme?.mode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`backdrop-blur-md border-b transition-all duration-300 ${
        theme?.mode === 'dark' 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  theme?.mode === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <div className={`w-px h-8 ${theme?.mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <h1 className={`text-xl font-semibold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                План платежей
              </h1>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Создание Платежного Документа
          </h1>
          <p className={`text-lg ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Данные согласовываемого документа
          </p>
        </div>

        {/* Document Info Card */}
        <div className={`rounded-2xl shadow-xl border backdrop-blur-sm mb-8 transform hover:scale-[1.01] transition-all duration-300 ${
          theme?.mode === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <FileText className={`w-6 h-6 mr-3 ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Информация о документе
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl ${theme?.mode === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
               
             
              </div>
              <div className={`p-4 rounded-xl ${theme?.mode === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <Calendar className={`w-4 h-4 mr-2 ${theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Дата создания
                  </span>
                </div>
                <div className={`text-lg font-semibold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {documentInfo.date}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Card */}
        <div className={`rounded-2xl shadow-xl border backdrop-blur-sm mb-8 ${
          theme?.mode === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className={`w-6 h-6 mr-3 ${theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Платежи ({payments.length})
                </h2>
              </div>
              <div className="flex items-center space-x-3">
              
                <button 
                  onClick={fetchPaymentLines}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Заполнить</span>
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <div className={`rounded-xl border ${theme?.mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      theme?.mode === 'dark' 
                        ? 'bg-gray-700/50 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPayments.length > 0 && selectedPayments.length === payments.length}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Наименование</th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Проект</th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Номер ЭРС</th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Контрагент</th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Тип платежа</th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Дата платежа</th>
                      <th className={`px-6 py-4 text-right text-sm font-medium ${
                        theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className={`px-6 py-8 text-center ${
                          theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Нет данных. Нажмите "Заполнить" для добавления платежей.
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment, index) => (
                        <tr 
                          key={payment.id} 
                          onClick={() => handlePaymentSelection(payment.id)}
                          className={`transition-colors duration-150 cursor-pointer ${
                            theme?.mode === 'dark' 
                              ? 'hover:bg-gray-700/30' 
                              : 'hover:bg-gray-50'
                          } ${selectedPayments.includes(payment.id) ? (theme?.mode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                        >
                          <td className="px-6 py-4">
                            {selectedPayments.includes(payment.id) ? (
                              <span className="text-green-500 font-bold text-xl">&#x2713;</span>
                            ) : (
                              <div className={`w-4 h-4 rounded border-2 ${
                                theme?.mode === 'dark' 
                                  ? 'border-gray-400' 
                                  : 'border-gray-300'
                              }`}></div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className={`font-medium ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {payment.description}
                              </div>
                              <div className={`text-sm ${theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {payment.details}
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                              {payment.project}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm font-mono ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {payment.ersNumber}
                          </td>
                          <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {payment.counterparty}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.paymentType === 'Запланированный'
                                ? theme?.mode === 'dark'
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'bg-blue-100 text-blue-800'
                                : theme?.mode === 'dark'
                                  ? 'bg-yellow-900/30 text-yellow-400'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.paymentType}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <input
                              type="date"
                              value={new Date(payment.paymentDate).toISOString().split('T')[0]}
                              onChange={(e) => updatePaymentDate(payment.id, e.target.value)}
                              className={`w-full p-1 rounded ${
                                theme?.mode === 'dark' 
                                  ? 'bg-gray-700 text-white border-gray-600' 
                                  : 'bg-white text-gray-900 border-gray-300'
                              } border`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={payment.amount}
                              onChange={(e) => updatePaymentAmount(payment.id, e.target.value)}
                              className={`w-full p-1 rounded text-right ${
                                theme?.mode === 'dark' 
                                  ? 'bg-gray-700 text-white border-gray-600' 
                                  : 'bg-white text-gray-900 border-gray-300'
                              } border`}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount Card */}
        <div className={`rounded-2xl shadow-xl border backdrop-blur-sm mb-8 ${
          theme?.mode === 'dark' 
            ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-800' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-semibold ${theme?.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Общая сумма документа:
              </h3>
              <div className={`text-2xl font-bold ${
                theme?.mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {showAmounts ? `${formatCurrency(totalAmount)} ₸` : '••••••••'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onBack}
            className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              theme?.mode === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } shadow-lg`}
          >
            <X className="w-5 h-5" />
            <span>Отмена</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Сохранить документ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCreationForm;