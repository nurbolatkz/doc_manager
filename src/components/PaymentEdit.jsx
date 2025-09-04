import React from 'react';
import './Dashboard_Restructured.css';

const PaymentEdit = ({ 
  formData, 
  handleInputChange, 
  theme, 
  fetchPaymentLines, 
  loadingPaymentLines,
  handlePaymentSelection,
  toggleSelectAllPayments,
  updatePaymentAmount,
  updatePaymentDate
}) => {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="payment-number">Номер документа:</label>
          <input 
            type="text" 
            id="payment-number" 
            name="documentNumber" 
            value={formData.documentNumber}
            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
            placeholder="Введите номер документа..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment-date">Дата документа:</label>
          <input 
            type="date" 
            id="payment-date" 
            name="documentDate" 
            value={formData.documentDate}
            onChange={(e) => handleInputChange('documentDate', e.target.value)}
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="form-group">
        <div className="flex justify-between items-center mb-2">
          <label>Платежи:</label>
          <button 
            type="button"
            onClick={fetchPaymentLines}
            disabled={loadingPaymentLines}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loadingPaymentLines ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <i className="fas fa-sync-alt"></i>
            )}
            <span>Заполнить</span>
          </button>
        </div>
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
                      checked={formData.selectedPayments.length > 0 && formData.selectedPayments.length === formData.payments.length}
                      onChange={toggleSelectAllPayments}
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
                {formData.payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`px-6 py-8 text-center ${
                      theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Нет платежей для редактирования. Нажмите "Заполнить" для загрузки платежей.
                    </td>
                  </tr>
                ) : (
                  formData.payments.map((payment, index) => (
                    <tr 
                      key={index}
                      onClick={() => handlePaymentSelection(payment.id)}
                      className={`transition-colors duration-150 cursor-pointer ${
                        theme?.mode === 'dark' 
                          ? 'hover:bg-gray-700/30' 
                          : 'hover:bg-gray-50'
                      } ${formData.selectedPayments.includes(payment.id) ? (theme?.mode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                    >
                      <td className="px-6 py-4">
                        {formData.selectedPayments.includes(payment.id) ? (
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
                            {payment.description || payment.Наименование || 'Не указано'}
                          </div>
                          <div className={`text-sm ${theme?.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {payment.details || payment.НазначениеПлатежа || ''}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                          <i className="fas fa-building mr-2 text-blue-500"></i>
                          {payment.project || payment.Проект || ''}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-mono ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {payment.ersNumber || payment.НомерЗрс || ''}
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {payment.counterparty || payment.Контрагент || ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (payment.paymentType || payment.ВидОперации) === 'Запланированный'
                            ? theme?.mode === 'dark'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-800'
                            : theme?.mode === 'dark'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.paymentType || payment.ВидОперации || 'Не указано'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme?.mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="date"
                          value={new Date(payment.paymentDate || payment.ДатаПлатежа || new Date()).toISOString().split('T')[0]}
                          onChange={(e) => updatePaymentDate(index, e.target.value)}
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
                          value={payment.amount || payment.Сумма || 0}
                          onChange={(e) => updatePaymentAmount(index, e.target.value)}
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
    </>
  );
};

export default PaymentEdit;