import React from 'react';
import SigexLibraryReact from '../lib/sigexLibraryReact';

const SigexQRModal = ({
  isOpen,
  onClose,
  onSigningComplete,
  documentData,
  documentInfo
}) => {
  console.log('SigexQRModal props:', { isOpen, documentData: documentData ? `${documentData.substring(0, 50)}...` : null, documentInfo });
  
  // Always render the library component, but it will control its own visibility
  return (
    <SigexLibraryReact
      apiUrl="https://sigex.kz/api/egovQr"
      documentData={documentData}
      documentInfo={documentInfo}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={(signedDocuments) => {
        console.log('SIGEX signing successful:', signedDocuments);
        onSigningComplete(signedDocuments);
        // Don't automatically close the modal - let user close it manually
        // onClose() is called only when user clicks the close button
      }}
      onError={(error) => {
        console.error('SIGEX Error:', error);
        // Don't automatically close on error either
      }}
    />
  );
};

export default SigexQRModal;