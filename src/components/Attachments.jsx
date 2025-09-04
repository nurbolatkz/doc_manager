import React from 'react';

const Attachments = ({ attachments = [], theme, onDownload }) => {
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
    if (!dateString) return '-';
    
    // Handle format "dd.mm.yyyy hh:mm:ss"
    if (dateString.includes('.') && dateString.includes(':')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('.');
      const [hour, minute, second] = timePart.split(':');
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

  return (
    <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      <div className='section-header'>
        <i className='fas fa-paperclip'></i>
        Вложения
      </div>
      
      {attachments.length === 0 ? (
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
                <th>Дата загрузки</th>
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
                  <td>{formatDate(attachment.uploadDate)}</td>
                  <td>
                    <div className="action-buttons inline">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onDownload ? onDownload(attachment) : console.log(`Downloading ${attachment.fileName}`)}
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