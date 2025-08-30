// Import config
import config from '../config';
import { mockDocuments } from '../data/mockData';

// Helper function to properly encode UTF-8 strings for Basic Auth
function utf8ToBase64(str) {
  const encodedStr = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return btoa(encodedStr);
}

// Helper function to get a cookie value by name
function getCookie(name) {
  const cookieValue = document.cookie.split(';').find(cookie => cookie.trim().startsWith(name + '='));
  if (cookieValue) {
    return decodeURIComponent(cookieValue.split('=')[1]);
  }
  return null;
}

// Function to fetch CSRF token
async function fetchCsrfToken() {
  try {
    // Make a GET request to fetch the CSRF token
    await fetch(config.backend_1c_url, {
      method: 'GET',
      credentials: 'include',
    });

    // After the request, the browser's cookie jar should have the token.
    // We read it from the document's cookies.
    const token = getCookie('csrftoken');
    if (token) {
      console.log("CSRF token fetched successfully.");
      return token;
    } else {
      console.error("CSRF token not found in cookies.");
      return null;
    }
  } catch (err) {
    console.error("Failed to fetch CSRF token:", err);
    return null;
  }
}

// Generic function to make API requests to 1C backend
export async function apiRequest(endpoint, requestBody, token) {
  try {
    // Fetch CSRF token
    const csrfToken = await fetchCsrfToken();
    
    // Create the full request body with method, address and payload
    const fullRequestBody = {
      "Метод": "POST",
      "Адрес": `http://localhost/Ag_Tech_Mobile/hs/MobileExchange/${endpoint}`,
      "ТелоЗапроса": {
        ...requestBody,
        token: token
      }
    };

    // Create the Basic Auth header with UTF-8 safe encoding
    const userpass = `${config.username_admin}:${config.username_admin_password}`;
    const basicAuth = utf8ToBase64(userpass);

    // Configure fetch with proper headers
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        // Include the CSRF token in the headers if available
        ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      },
      body: JSON.stringify(fullRequestBody),
      // Crucial for sending and receiving cookies
      credentials: 'include',
    };

    console.log("Sending request to 1C backend with request body:", fullRequestBody);
    console.log("Backend URL:", config.backend_1c_url);

    // Use the full URL with endpoint
    const response = await fetch(config.backend_1c_url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from 1C backend:", data);

    // Check if the response indicates success
    if (data.hasOwnProperty('success') && data.success === 0) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (err) {
    console.error("API request error:", err);
    throw err;
  }
}

// Function to fetch document list
export async function fetchDocuments(token) {
  const requestBody = {
    username: "Администратор"
  };

  return apiRequest("documents", requestBody, token);
}

// Function to fetch document counts
export async function fetchDocumentCounts(token) {
  const requestBody = {
    username: "Администратор"
  };

  return apiRequest("counts", requestBody, token);
}

// Function to fetch document details by type
export async function fetchDocumentDetailsByType(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    type: documentType,
    documentId: documentId
  };

  return apiRequest("detail", requestBody, token);
}

// Function to fetch document details (legacy)
export async function fetchDocumentDetails(token, documentId) {
  const requestBody = {
    username: "Администратор",
    id: documentId
  };

  return apiRequest("document_details", requestBody, token);
}

// Function to fetch document routes/steps
export async function fetchDocumentRoutes(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    type: documentType,
    documentId: documentId
  };

  return apiRequest("routes", requestBody, token);
}

// Function to send document to route
export async function sendDocumentToRoute(token, documentType, documentId, routeType = "fixed") {
  const requestBody = {
    username: "Администратор",
    action: "send_to_route",
    type: documentType,
    typeOfRoute: routeType,
    documentId: documentId
  };

  return apiRequest("register_document_action", requestBody, token);
}

// Function to get signing template
export async function getSigningTemplate(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    type: documentType,
    documentId: documentId
  };

  try {
    const response = await apiRequest("get_template_to_sign", requestBody, token);
    console.log("Signing template response:", response);
    return response;
  } catch (error) {
    console.error("Error in getSigningTemplate:", error);
    throw error;
  }
}

// Function to check access to approve/decline
export async function checkAccessToApproveDecline(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    action: "check_access_to_appove_decline", // Note: keeping the typo as it appears in the spec
    type: documentType,
    typeOfRoute: "fixed",
    documentId: documentId
  };

  return apiRequest("register_document_action", requestBody, token);
}

// Function to approve a document
export async function approveDocument(token, documentId) {
  const requestBody = {
    username: "Администратор",
    id: documentId
  };

  return apiRequest("approve", requestBody, token);
}

// Function to reject a document
export async function rejectDocument(token, documentId) {
  const requestBody = {
    username: "Администратор",
    id: documentId
  };

  return apiRequest("reject", requestBody, token);
}

// Function to edit a document
export async function editDocument(token, documentId) {
  const requestBody = {
    username: "Администратор",
    id: documentId
  };

  return apiRequest("edit", requestBody, token);
}

// Function to save signed document and approve it
export async function saveSignedDocumentAndApprove(token, documentType, documentId, signedDocumentData) {
  const requestBody = {
    username: "Администратор",
    token: token,
    action: "approve_document",
    type: documentType,
    typeOfRoute: "fixed",
    documentId: documentId
  };

  try {
    const response = await apiRequest("register_document_action", requestBody, token);
    console.log("Save signed document and approve response:", response);
    return response;
  } catch (error) {
    console.error("Error in saveSignedDocumentAndApprove:", error);
    throw error;
  }
}

// Function to decline a document
export async function declineDocument(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    token: token,
    action: "decline_document",
    type: documentType,
    typeOfRoute: "fixed",
    documentId: documentId
  };

  try {
    const response = await apiRequest("register_document_action", requestBody, token);
    console.log("Decline document response:", response);
    return response;
  } catch (error) {
    console.error("Error in declineDocument:", error);
    throw error;
  }
}

// Function to delete a document
export async function deleteDocument(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    token: token,
    action: "delete",
    type: documentType,
    typeOfRoute: "fixed",
    documentId: documentId
  };

  try {
    const response = await apiRequest("register_document_action", requestBody, token);
    console.log("Delete document response:", response);
    return response;
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    throw error;
  }
}

// Function to save signed document data
export async function saveSignedDocument(token, documentId, documentType, signedDocumentData, metadata) {
  // Create the endpoint URL with document ID and document type
  const endpoint = `save_signed_document/${documentId}/${documentType}`;
  
  const requestBody = {
    username: "Администратор",
    token: token,
    Данные: signedDocumentData,
    ДанныеДляРС: metadata
  };

  try {
    const response = await apiRequest(endpoint, requestBody, token);
    console.log("Save signed document response:", response);
    return response;
  } catch (error) {
    console.error("Error in saveSignedDocument:", error);
    throw error;
  }
}

export default apiRequest;