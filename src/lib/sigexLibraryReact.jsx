import React, { useState, useEffect, useRef } from 'react';

const SigexLibraryReact = ({ 
  apiUrl, 
  documentData,
  documentInfo,
  isOpen,
  onClose,
  onSuccess, 
  onError 
}) => {
  //console.log('SigexLibraryReact props:', { apiUrl, documentData: documentData ? `${documentData.substring(0, 50)}...` : null, documentInfo, isOpen });
  
  // State management
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [signUrl, setSignUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState(null);
  const [mobileLink, setMobileLink] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSigning, setIsSigning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs for intervals
  const pollingIntervalRef = useRef(null);
  const qrPollingIntervalRef = useRef(null);
  
  // Constants
  const maxRetries = 3;
  const retryInterval = 5000;
  
  // Sync internal state with external isOpen prop
  useEffect(() => {
    //console.log('Syncing internalIsOpen with isOpen prop:', isOpen);
    if (isOpen !== undefined) {
      setInternalIsOpen(isOpen);
    }
  }, [isOpen]);
  
  // Open modal automatically if documentData is provided
  useEffect(() => {
    console.log('useEffect triggered with documentData:', documentData ? `${documentData.substring(0, 50)}...` : null);
    if (documentData) {
      //console.log('Opening modal automatically because documentData is provided');
      open();
    }
  }, [documentData]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      //console.log('Cleaning up SigexLibraryReact component');
      stopPolling();
      stopQRPolling();
    };
  }, []);

  useEffect(() => {
    //console.log('useEffect triggered for signUrl:', signUrl);
    if (signUrl) {
      // Only start polling if signUrl is not null
      startPollingForSignature();
    }
    // This return function will act as a cleanup function for the effect
    // It will run when the component unmounts or before the effect runs again
    return () => {
      stopPolling();
    };
  }, [signUrl]);
  
  // Open the modal
  const open = () => {
    //console.log('Opening SigexLibraryReact modal');
    resetForm();
    setInternalIsOpen(true);
  };
  
  // Close the modal
  const close = () => {
    //console.log('Closing SigexLibraryReact modal');
    // Only close the modal when user clicks close button
    setInternalIsOpen(false);
    stopPolling();
    stopQRPolling();
    if (onClose) {
      onClose();
    }
  };
  
  // Reset form state
  const resetForm = () => {
    setCurrentFile(null);
    setDataUrl(null);
    setSignUrl(null);
    
    // Extract document name from documentInfo object
    let documentName = '';
    if (typeof documentInfo === 'string') {
      documentName = documentInfo;
    } else if (documentInfo && typeof documentInfo === 'object') {
      // Try to get the Russian name first, then Kazakh, then English
      documentName = documentInfo.nameRu || documentInfo.nameKz || documentInfo.nameEn || 
                    documentInfo.Наименование || documentInfo.НаименованиеДокумента || '';
    }
    
    setDescription(documentName || 'Документ на подписание');
    setQrCodeBase64(null);
    setMobileLink(null);
    setStatus(null);
    setProgress(0);
    setIsSigning(false);
    setRetryCount(0);
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setCurrentFile(file);
    } else {
      showError('Пожалуйста, выберите PDF файл');
    }
  };
  
  // Start the signing process
  const startSigning = async () => {
    // Use either the selected file or the provided document data
    const hasFile = currentFile || documentData;
    //console.log('Starting signing with document data:', documentData ? `${documentData.substring(0, 50)}...` : null);
    
    if (!hasFile) {
      showError('Пожалуйста, выберите файл или предоставьте данные документа');
      return;
    }
    
    if (!description.trim()) {
      showError('Пожалуйста, введите описание документа');
      return;
    }
    
    setIsSigning(true);
    showStatus('Отправка запроса на получение QR-кода...', 'info');
    
    try {
      // Step 1: Get QR Code
      const qrResponse = await getQRCode(description);
      
      if (qrResponse.eGovMobileLaunchLink && qrResponse.qrCode && qrResponse.dataURL) {
        // Store dataURL in local variable to avoid state timing issues
        const sessionDataUrl = qrResponse.dataURL;
        //console.log('QR dataURL:', sessionDataUrl);
        
        // Set state
        setDataUrl(sessionDataUrl);
        showQRCode(qrResponse.qrCode, qrResponse.eGovMobileLaunchLink);
        
        // Step 2: Show QR code to user
        showStatus('Отсканируйте QR-код с помощью eGov Mobile приложения', 'info');
        
        // Step 3: Send document immediately using the local variable
        await sendDocumentForSigning(sessionDataUrl);
      } else {
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (error) {
      //console.error('Error getting QR code:', error);
      showError(`Ошибка при получении QR-кода: ${error.message}`);
      setIsSigning(false);
    }
  };

  // Get QR code from API
  const getQRCode = async (description) => {
    console.log('Getting QR code with description:', description);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('QR code response:', data);
    return data;
  };
  
  // Show QR code
  const showQRCode = (qrCodeBase64, mobileLink) => {
    setQrCodeBase64(qrCodeBase64);
    setMobileLink(mobileLink);
  };
  
  // Start QR scan polling
  const startQRScanPolling = () => {
    //console.log('startQRScanPolling is deprecated - not used in current SIGEX flow');
  };
  
  // Stop QR polling
  const stopQRPolling = () => {
    if (qrPollingIntervalRef.current) {
      clearTimeout(qrPollingIntervalRef.current);
      qrPollingIntervalRef.current = null;
    }
  };
  
  // Send document for signing
  // Send document for signing - Updated to use signURL from response
  const sendDocumentForSigning = async (sessionDataUrl) => {
    // Use parameter first, then state
    const activeDataUrl = sessionDataUrl || dataUrl;
    //console.log('sendDocumentForSigning called with dataUrl:', activeDataUrl);
    
    showStatus('Отправка документа на подписание... Пожалуйста, отсканируйте QR-код', 'info');
    
    try {
      // Check if we have the dataUrl
      if (!activeDataUrl) {
        throw new Error('Не удалось получить данные для подписания - dataUrl отсутствует');
      }
      
      // Use either the selected file or the provided document data
      let base64Data;
      if (currentFile) {
        base64Data = await fileToBase64(currentFile);
      } else if (documentData) {
        // Convert the document data to proper PDF base64 format
        base64Data = await convertDocumentDataToPDFBase64(documentData);
      } else {
        throw new Error('Не удалось получить данные документа');
      }
      
      console.log('Sending document for signing with data length:', base64Data.length);
      
      // Extract document names from documentInfo object
      let nameRu = "Документ на подписание";
      let nameKz = "Қол қою үшін құжат";
      let nameEn = "Document to sign";
      
      if (typeof documentInfo === 'string') {
        nameRu = documentInfo;
        nameKz = documentInfo;
        nameEn = documentInfo;
      } else if (documentInfo && typeof documentInfo === 'object') {
        // Try to get the names from the documentInfo object
        nameRu = documentInfo.nameRu || documentInfo.Наименование || documentInfo.НаименованиеДокумента || nameRu;
        nameKz = documentInfo.nameKz || documentInfo.Наименование || documentInfo.НаименованиеДокумента || nameKz;
        nameEn = documentInfo.nameEn || documentInfo.Наименование || documentInfo.НаименованиеДокумента || nameEn;
      }
      
      // Extract the session ID from the activeDataUrl
      const sessionId = activeDataUrl.replace('https://sigex.kz/api/egovQr/', '');
      //console.log('Extracted session ID:', sessionId);
      
      const payload = {
        signMethod: "CMS_WITH_DATA",
        documentsToSign: [{
          id: 1,
          nameRu: nameRu,
          nameKz: nameKz,
          nameEn: nameEn,
          document: {
            file: {
              mime: "@file/pdf",
              data: base64Data
            }
          }
        }]
      };
      
      console.log('Sending payload to SIGEX API:', {
        url: `${apiUrl}/${sessionId}`,
        payloadSize: JSON.stringify(payload).length,
        documentDataLength: base64Data.length
      });
      
      // Send document to SIGEX API - this call will wait until user scans QR
      const response = await postWithRetry(`${apiUrl}/${sessionId}`, payload);
      
      //console.log('SIGEX API response after sending document:', response);
      
      // Use the signURL from the response for polling
      const pollingUrl = response.signURL || response.signURLAuto || activeDataUrl;
     // console.log('Using polling URL:', pollingUrl);
      
      // Set the signUrl for polling using the URL from the response
      setSignUrl(pollingUrl);
      
      // Start polling for signature status
      showStatus('Ожидание подписания документа...', 'info');
      showProgress(true);
      
    } catch (error) {
      console.error('Error in sendDocumentForSigning:', error);
      showError(`Ошибка при отправке документа: ${error.message}`);
      setIsSigning(false);
    }
  };
  
  // Post with retry logic
  const postWithRetry = async (url, payload, currentRetry = 0) => {
    try {
      //console.log(`Posting to SIGEX API (attempt ${currentRetry + 1}):`, { url });
      
      // Increase timeout for SIGEX to wait for QR scan (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`SIGEX API response (attempt ${currentRetry + 1}):`, {
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.status === 200) {
        const data = await response.json();
        //console.log(`SIGEX API success response (attempt ${currentRetry + 1}):`, data);
        return data;
      } else if (currentRetry < maxRetries) {
        showStatus(`Повтор отправки... (${currentRetry + 1}/${maxRetries})`, 'info');
        await delay(retryInterval);
        return await postWithRetry(url, payload, currentRetry + 1);
      } else {
        const errorText = await response.text();
        //console.error('Final error response:', errorText);
        throw new Error(`Сервис не принимает файл! Код состояния: ${response.status}`);
      }
    } catch (error) {
      //console.error(`Error in postWithRetry (attempt ${currentRetry + 1}):`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания сканирования QR-кода (30 секунд)');
      }
      
      if (currentRetry < maxRetries) {
        showStatus(`Повтор отправки... (${currentRetry + 1}/${maxRetries})`, 'info');
        await delay(retryInterval);
        return await postWithRetry(url, payload, currentRetry + 1);
      } else {
        throw error;
      }
    }
  };
  
  // Start polling for signature
  const startPollingForSignature = () => {
    showProgress(true);
    showStatus('Ожидание подписания документа пользователем...', 'info');
    let progressValue = 0;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        progressValue += 3;
        updateProgress(Math.min(progressValue, 95));
        
        const result = await checkSigningStatus();
        if (result) {
          stopPolling();
          updateProgress(100);
          showStatus('Документ успешно подписан!', 'success');
          handleSigningSuccess(result);
        }
      } catch (error) {
        if (error.message.includes('still signing')) {
          // Continue polling - document is still being signed
          return;
        } else {
          console.error('Error in signature polling:', error);
          stopPolling();
          showError(`Ошибка при получении статуса: ${error.message}`);
          setIsSigning(false);
        }
      }
    }, 10000); // Check every 10 seconds
  };
  
  // Check signing status
  const checkSigningStatus = async () => {
    if (!signUrl) {
      throw new Error('No sign URL available');
    }
    
    const signId = signUrl.replace('https://sigex.kz/api/egovQr/', '');
   // console.log('Checking signing status for session:', signId);
    
    try {
      const response = await fetch(`${apiUrl}/${signId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status check response:', response.status, response.statusText);
      
      if (response.status === 200) {
        const data = await response.json();
        //console.log('Status check data:', data);
        
        if (data.documentsToSign && data.documentsToSign.length > 0 && 
            data.documentsToSign[0].document && data.documentsToSign[0].document.file) {
          //console.log('Document is signed!');
          return data;
        } else {
          // Document is still being signed
          throw new Error('still signing');
        }
      } else if (response.status === 404) {
        // Session might be expired or not found
        throw new Error('still signing');
      } else {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        if (newRetryCount >= maxRetries) {
          throw new Error(`Сервис не возвращает статус! Код состояния: ${response.status}`);
        } else {
          throw new Error('still signing');
        }
      }
    } catch (error) {
      if (error.message === 'still signing') {
        throw error;
      } else {
        // Network or other errors
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        if (newRetryCount >= maxRetries) {
          throw new Error(`Ошибка сети: ${error.message}`);
        } else {
          throw new Error('still signing');
        }
      }
    }
  };
  
  // Handle signing success
  const handleSigningSuccess = (data) => {
    const signedDocuments = data.documentsToSign.map((doc) => ({
      name: doc.nameRu + '_Подписанный.pdf',
      data: doc.document.file.data,
      mimeType: 'application/pdf'
    }));
    
    // Download signed documents
    signedDocuments.forEach((doc) => {
      downloadFile(doc.data, doc.name, doc.mimeType);
    });
    
    onSuccess(signedDocuments);
    
    // Don't automatically close the modal - let the user close it manually
    // Only show success message and stop polling
    showStatus('Документ успешно подписан!', 'success');
    stopPolling();
    setIsSigning(false);
  };
  
  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    showProgress(false);
  };
  
  // Show status message
  const showStatus = (message, type) => {
    setStatus({ message, type });
  };
  
  // Show error message
  const showError = (message) => {
    showStatus(message, 'error');
    onError(new Error(message));
  };
  
  // Show/hide progress
  const showProgress = (show) => {
    if (!show) {
      updateProgress(0);
    }
  };
  
  // Update progress
  const updateProgress = (percentage) => {
    setProgress(percentage);
  };
  
  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64.replace(/\r?\n|\r/g, ''));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Download file
  const downloadFile = (base64Data, fileName, mimeType) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  // Delay function
  const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  // Convert document data to PDF base64 format
  const convertDocumentDataToPDFBase64 = async (documentData) => {
    try {
      // If the documentData is already a valid PDF base64 string, return it as is
      // Otherwise, we might need to process it depending on the format
      
      // For now, we'll assume the documentData from 1C is already in the correct format
      // but we'll ensure it's properly formatted for SIGEX
      //console.log('Converting document data to PDF base64, data length:', documentData.length);
      
      // Remove any whitespace/newlines that might interfere
      const cleanData = documentData.replace(/\r?\n|\r/g, '');
      
      // Validate that this looks like a PDF base64 string
      // PDF files typically start with "%PDF-" when base64 decoded
      try {
        const decodedData = atob(cleanData.substring(0, 100)); // Decode first 100 chars to check
        if (decodedData.includes('%PDF-')) {
          console.log('Document data appears to be valid PDF base64');
          return cleanData;
        } else {
          //console.warn('Document data does not appear to be PDF format, but sending as-is');
          return cleanData;
        }
      } catch (decodeError) {
        //console.warn('Could not decode document data for validation, sending as-is');
        return cleanData;
      }
    } catch (error) {
      //console.error('Error converting document data to PDF base64:', error);
      throw new Error('Не удалось преобразовать данные документа в PDF формат');
    }
  };
  
  // Render nothing if not open
  if (!internalIsOpen) {
    return null;
  }
  
  return (
    <div className="modal-overlay active">
      <div className="modal-content sigex-modal">
        <div className="modal-header">
          <h3 className="modal-title">Подписание документа через SIGEX</h3>
          <button 
            className="modal-close" 
            onClick={close}
            disabled={isSigning}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {!dataUrl ? (
            // Initial state - document selection and description
            <div className="sigex-initial">
              <div className="form-group">
                <label>Описание документа:</label>
                <input
                  type="text"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите описание документа"
                  disabled={isSigning}
                />
              </div>
              
              {currentFile && (
                <div className="file-info">
                  <i className="fas fa-file-pdf"></i>
                  <span>{currentFile.name}</span>
                </div>
              )}
              
              <div className="sigex-actions">
                <button 
                  className="btn btn-primary"
                  onClick={startSigning}
                  disabled={isSigning || (!currentFile && !documentData)}
                >
                  {isSigning ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Подготовка...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-qrcode"></i> Получить QR-код
                    </>
                  )}
                </button>
              </div>
              
              {status && (
                <div className={`alert alert-${status.type}`}>
                  {status.message}
                </div>
              )}
            </div>
          ) : (
            // QR code display state
            <div className="sigex-signing">
              <div className="qr-section">
                <h4>Отсканируйте QR-код</h4>
                <p>Используйте приложение eGov Mobile для сканирования QR-кода и подписания документа.</p>
                
                {qrCodeBase64 && (
                  <div className="qr-code">
                    <img 
                      src={`data:image/png;base64,${qrCodeBase64}`} 
                      alt="QR Code for signing" 
                    />
                  </div>
                )}
                
                {mobileLink && (
                  <div className="mobile-link">
                    <p>Или нажмите кнопку ниже для открытия в мобильном приложении:</p>
                    <a 
                      href={mobileLink} 
                      className="btn btn-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-mobile-alt"></i> Открыть в eGov Mobile
                    </a>
                  </div>
                )}
              </div>
              
              <div className="status-section">
                {status && (
                  <div className={`alert alert-${status.type}`}>
                    {status.message}
                  </div>
                )}
                
                {progress > 0 && progress < 100 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}
              </div>
              
              <div className="sigex-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={close}
                  disabled={isSigning}
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigexLibraryReact;