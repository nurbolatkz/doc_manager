import React from 'react';
import './Dashboard_Restructured.css';

const ExpenditureEdit = ({ 
  formData, 
  handleInputChange, 
  theme, 
  cfos, 
  projects, 
  ddsArticles, 
  budgetArticles, 
  counterparties, 
  contracts, 
  openModal,
  handleFileUpload,
  uploadedFiles,
  removeFile,
  formatFileSize
}) => {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expenditure-date">Дата Создания:</label>
          <input 
            type="date" 
            id="expenditure-date" 
            name="date" 
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expenditure-currency">Валюта:</label>
          <select 
            id="expenditure-currency" 
            name="currency" 
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
          >
            <option value="KZT">KZT</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="expenditure-amount">Сумма:</label>
          <input 
            type="number" 
            id="expenditure-amount" 
            name="amount" 
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Введите сумму..."
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-payment-form">Форма Оплаты:</label>
        <select 
          id="expenditure-payment-form" 
          name="paymentForm" 
          value={formData.paymentForm}
          onChange={(e) => handleInputChange('paymentForm', e.target.value)}
          className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
        >
          <option value="Наличные">Наличные</option>
          <option value="Безналичный расчет">Безналичные</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-operation-type">Тип Операции:</label>
        <select 
          id="expenditure-operation-type" 
          name="operationType" 
          value={formData.operationType}
          onChange={(e) => handleInputChange('operationType', e.target.value)}
          className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`}
        >
          <option value="Возврат денежных средств покупателю">Возврат денежных средств покупателю</option>
          <option value="Выдача денежных средств подотчетнику">Выдача денежных средств подотчетнику</option>
          <option value="Перечисление заработной платы">Перечисление заработной платы</option>
          <option value="Перечисление налога">Перечисление налога</option>
          <option value="Перечисление НДС с изменённым сроком уплаты">Перечисление НДС с изменённым сроком уплаты</option>
          <option value="Перечисление пенсионных взносов">Перечисление пенсионных взносов</option>
          <option value="Перечисление по исполнительным листам">Перечисление по исполнительным листам</option>
          <option value="Перечисление социальных отчислений">Перечисление социальных отчислений</option>
          <option value="Прочие расчёты с контрагентами">Прочие расчёты с контрагентами</option>
          <option value="Расчёты по кредитам и займам с работниками">Расчёты по кредитам и займам с работниками</option>
          <option value="Прочий расход денежных средств">Прочий расход денежных средств</option>
          <option value="Расчёты по кредитам и займам с контрагентами">Расчёты по кредитам и займам с контрагентами</option>
          <option value="Расчёты по доходу от разовых выплат с контрагентами">Расчёты по доходу от разовых выплат с контрагентами</option>
          <option value="Оплата структурному подразделению">Оплата структурному подразделению</option>
          <option value="Перевод на другой счёт">Перевод на другой счёт</option>
          <option value="Оплата поставщику">Оплата поставщику</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-organization">Организация:</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id="expenditure-organization" 
            name="organization" 
            value={formData.organization || ''}
            readOnly
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Выберите Организацию..."
          />
          <button 
            type="button" 
            id="open-organization-modal" 
            className="search-button"
            onClick={() => openModal('organization')}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
        <input 
          type="hidden" 
          id="expenditure-organization-guid" 
          name="organizationGuid" 
          value={formData.organizationGuid}
        />
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-purpose-text">Назначение Платежа:</label>
        <textarea 
          id="expenditure-purpose-text" 
          name="purposeText" 
          value={formData.purposeText}
          onChange={(e) => handleInputChange('purposeText', e.target.value)}
          className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
          placeholder="Введите назначение платежа..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expenditure-dds-article">Статья ДДС:</label>
          <div className="input-with-button">
            <input 
              type="text" 
              id="expenditure-dds-article" 
              name="ddsArticle" 
              value={formData.ddsArticle}
              readOnly
              className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
              placeholder="Выберите Статью ДДС..."
            />
            <button 
              type="button" 
              id="open-dds-article-modal" 
              className="search-button"
              onClick={() => openModal('ddsArticle')}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          <input 
            type="hidden" 
            id="expenditure-dds-article-guid" 
            name="ddsArticleGuid" 
            value={formData.ddsArticleGuid}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expenditure-budget-article">Статья Бюджета:</label>
          <div className="input-with-button">
            <input 
              type="text" 
              id="expenditure-budget-article" 
              name="budgetArticle" 
              value={formData.budgetArticle}
              readOnly
              className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
              placeholder="Выберите Статью Бюджета..."
            />
            <button 
              type="button" 
              id="open-budget-article-modal" 
              className="search-button"
              onClick={() => openModal('budgetArticle')}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          <input 
            type="hidden" 
            id="expenditure-budget-article-guid" 
            name="budgetArticleGuid" 
            value={formData.budgetArticleGuid}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-project">Проект:</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id="expenditure-project" 
            name="project" 
            value={formData.project}
            readOnly
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Выберите Проект..."
          />
          <button 
            type="button" 
            id="open-project-modal" 
            className="search-button"
            onClick={() => openModal('project')}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
        <input 
          type="hidden" 
          id="expenditure-project-guid" 
          name="projectGuid" 
          value={formData.projectGuid}
        />
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-cfo">ЦФО (Центр Финансовой Ответственности):</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id="expenditure-cfo" 
            name="cfo" 
            value={formData.cfo}
            readOnly
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Выберите ЦФО..."
          />
          <button 
            type="button" 
            id="open-cfo-modal" 
            className="search-button"
            onClick={() => openModal('cfo')}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
        <input 
          type="hidden" 
          id="expenditure-cfo-guid" 
          name="cfoGuid" 
          value={formData.cfoGuid}
        />
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-counterparty">Контрагент:</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id="expenditure-counterparty" 
            name="counterparty" 
            value={formData.counterparty}
            readOnly
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Выберите Контрагента..."
          />
          <button 
            type="button" 
            id="open-counterparty-modal" 
            className="search-button"
            onClick={() => openModal('counterparty')}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
        <input 
          type="hidden" 
          id="expenditure-counterparty-guid" 
          name="counterpartyGuid" 
          value={formData.counterpartyGuid}
        />
      </div>

      <div className="form-group">
        <label htmlFor="expenditure-contract">Договор:</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id="expenditure-contract" 
            name="contract" 
            value={formData.contract}
            readOnly
            className={`form-control ${theme?.mode === 'dark' ? 'dark' : 'light'}`} 
            placeholder="Выберите Договор..."
            disabled={!formData.counterparty}
          />
          <button 
            type="button" 
            id="open-contract-modal" 
            className="search-button"
            onClick={() => openModal('contract')}
            disabled={!formData.counterparty}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
        <input 
          type="hidden" 
          id="expenditure-contract-guid" 
          name="contractGuid" 
          value={formData.contractGuid}
        />
      </div>

      {/* File Upload Section */}
      <div className="form-group">
        <label>Прикрепленные файлы:</label>
        <div className="file-upload-container">
          <input 
            type="file" 
            id="file-upload" 
            className="file-input"
            onChange={handleFileUpload}
            multiple
          />
          <label htmlFor="file-upload" className="file-upload-label">
            <i className="fas fa-cloud-upload-alt"></i> Выберите файлы или перетащите их сюда
          </label>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-table">
            <table className={`table table-bordered ${theme?.mode === 'dark' ? 'dark' : ''}`}>
              <thead>
                <tr>
                  <th>Имя файла</th>
                  <th>Размер</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ExpenditureEdit;