import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/fetchManager';

const Attachments = ({ documentId, documentType, theme, onDownload }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType?.includes('image')) return 'fas fa-file-image';
    if (fileType?.includes('word')) return 'fas fa-file-word';
    if (fileType?.includes('excel')) return 'fas fa-file-excel';
    if (fileType?.includes('zip')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '-';
    
    // Handle format "dd.mm.yyyy hh:mm:ss"
    if (dateString.includes('.') && dateString.includes(':')) {
      const parts = dateString.split(' ');
      if (parts.length < 2) return '-';
      const [datePart, timePart] = parts;
      
      const dateParts = datePart.split('.');
      const timeParts = timePart.split(':');
      
      if (dateParts.length < 3 || timeParts.length < 3) return '-';
      
      const [day, month, year] = dateParts;
      const [hour, minute, second] = timeParts;
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }
    
    // Try to parse as standard date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  // Function to download a file from base64 data
  const downloadFile = (attachment) => {
    try {
      // console.log('Downloading file:', attachment.fileName);
      // console.log('File object (first 100 chars):', attachment.fileObject?.substring(0, 100));
      
      // Check if fileObject exists and is a string
      if (!attachment.fileObject || typeof attachment.fileObject !== 'string') {
        throw new Error('Invalid file data: fileObject is missing or not a string');
      }
      
      // Remove any newlines and whitespace that might interfere with base64 decoding
      const cleanFileObject = attachment.fileObject.replace(/\s/g, '');
      // console.log('Clean file object (first 100 chars):', cleanFileObject.substring(0, 100));
      
      // Check if it's a data URI or just base64
      let base64Data, mimeString;
      if (cleanFileObject.startsWith('data:')) {
        // It's a data URI
        const parts = cleanFileObject.split(',');
        if (parts.length < 2) {
          throw new Error('Invalid data URI format');
        }
        mimeString = parts[0].split(':')[1].split(';')[0];
        base64Data = parts[1];
      } else {
        // It's just base64 data, try to determine MIME type from file name
        base64Data = cleanFileObject;
        mimeString = attachment.mimeType || 'application/octet-stream';
      }
      
      // console.log('MIME type:', mimeString);
      // console.log('Base64 data (first 100 chars):', base64Data.substring(0, 100));
      
      // Decode base64 data
      const byteString = atob(base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // console.error('Error downloading file:', err);
      // Fallback to the provided onDownload function or console log
      if (onDownload) {
        onDownload(attachment);
      } else {
        // console.log(`Downloading ${attachment.fileName}`);
      }
    }
  };

  // Function to fetch attachments from the server
  const fetchAttachments = async () => {
    if (!documentId || !documentType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || '';
      
      const requestBody = {
        username: "Администратор",
        action: "get_array_files",
        type: documentType,
        documentid: documentId
      };
      
      const response = await apiRequest("document_files", requestBody, token);
      
      if (response.success === 1 && Array.isArray(response.files)) {
        // Log the response to see its structure
        // console.log('Files response:', response.files);
        
        // Create an array to store file GUIDs
        const fileGuids = response.files.map(file => file.guid || file.id || null).filter(guid => guid !== null);
        // console.log('File GUIDs:', fileGuids);
        
        // Transform the response to match the existing attachment structure
        const transformedAttachments = response.files.map((file, index) => ({
          id: index + 1,
          fileName: file.name,
          fileObject: file.fileObject, // base64 string
          mimeType: getFileMimeType(file.name),
          fileSize: getFileSizeFromBase64(file.fileObject),
          uploadDate: file.uploadDate || new Date().toISOString(), // Use uploadDate from response or current date
          guid: file.guid || file.id // Store the GUID if available
        }));
        setAttachments(transformedAttachments);
      } else {
        setError('Failed to fetch attachments');
      }
    } catch (err) {
      // console.error('Error fetching attachments:', err);
      setError('Error fetching attachments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine file mime type from extension
  const getFileMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'zip': 'application/zip',
      'txt': 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Helper function to calculate file size from base64 string
  const getFileSizeFromBase64 = (base64String) => {
    if (!base64String) return 0;
    // Remove data URI prefix if present
    const base64 = base64String.split(',')[1] || base64String;
    // Calculate size: every 4 base64 characters represent 3 bytes
    return Math.ceil((base64.length * 3) / 4);
  };

  // Fetch attachments when component mounts or documentId/documentType changes
  useEffect(() => {
    fetchAttachments();
  }, [documentId, documentType]);

  return (
    <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      <div className='section-header'>
        <i className='fas fa-paperclip'></i>
        Вложения
      </div>
      
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
          <p>Загрузка вложений...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-8">
          <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={fetchAttachments}
          >
            Повторить попытку
          </button>
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          <i className="fas fa-paperclip text-3xl mb-2"></i>
          <p>Нет вложений</p>
        </div>
      ) : (
        <div className='table-container'>
          <table className={`payment-table ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <thead>
              <tr>
                <th>Файл</th>
                <th>Размер</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map(attachment => (
                <tr key={attachment.id}>
                  <td>
                    <div className="file-info">
                      <i className={`${getFileIcon(attachment.mimeType)} file-icon`}></i>
                      <span>{attachment.fileName}</span>
                    </div>
                  </td>
                  <td>{formatFileSize(attachment.fileSize)}</td>
                  <td>
                    <div className="action-buttons inline">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => downloadFile(attachment)}
                      >
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attachments;