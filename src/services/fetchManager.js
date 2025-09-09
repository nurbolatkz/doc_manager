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
      // console.log("CSRF token fetched successfully.");
      return token;
    } else {
      // console.error("CSRF token not found in cookies.");
      return null;
    }
  } catch (err) {
    // console.error("Failed to fetch CSRF token:", err);
    return null;
  }
}

// Generic function to make API requests to 1C backend
export async function apiRequest(endpoint, requestBody, token) {
  try {
    // Use token parameter if provided, otherwise get from sessionStorage
    const authToken = token || sessionStorage.getItem('authToken');
    
    // Fetch CSRF token
    const csrfToken = await fetchCsrfToken();
    
    // Create the full request body with method, address and payload
    const fullRequestBody = {
      "Метод": "POST",
      "Адрес": `${config.localhost_url}${endpoint}`,
      "ТелоЗапроса": {
        ...requestBody,
        token: authToken
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

    // Use the full URL with endpoint
    const response = await fetch(config.backend_1c_url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response indicates success
    if (data.hasOwnProperty('success') && data.success === 0) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (err) {
    // console.error(`API request error for endpoint ${endpoint}:`, err);
    throw err;
  }
}

// Function to fetch document list
export async function fetchDocuments(token, filter = {}) {
  const requestBody = {
    username: "Администратор",
    SelectedFilter: filter.SelectedFilter || "all"
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

// Function to get document route type
export async function getDocumentRouteType(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    token: token,
    type: documentType,
    documentId: documentId
  };

  return apiRequest("get_document_route_type", requestBody, token);
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

// Function to get users list
export async function getUsersList(token) {
  const requestBody = {
    username: "Администратор",
    token: token
  };

  return apiRequest("get_users_list", requestBody, token);
}

// Function to get route titles
export async function getRouteTitles(token, documentType, documentId) {
  const requestBody = {
    username: "Администратор",
    token: token,
    type: documentType,
    documentId: documentId
  };

  return apiRequest("get_route_title", requestBody, token);
}

// Function to send document to free route
export async function sendToFreeRoute(token, documentType, documentId, routeSteps) {
  const requestBody = {
    username: "Администратор",
    token: token,
    action: "send_to_free_route",
    type: documentType,
    typeOfRoute: "free",
    routeSteps: routeSteps,
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
    // console.log("Signing template response:", response);
    return response;
  } catch (error) {
    // console.error("Error in getSigningTemplate:", error);
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
    // console.log("Save signed document and approve response:", response);
    return response;
  } catch (error) {
    // console.error("Error in saveSignedDocumentAndApprove:", error);
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
    // console.log("Decline document response:", response);
    return response;
  } catch (error) {
    // console.error("Error in declineDocument:", error);
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
    // console.log("Delete document response:", response);
    return response;
  } catch (error) {
    // console.error("Error in deleteDocument:", error);
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
    // console.log("Save signed document response:", response);
    return response;
  } catch (error) {
    // console.error("Error in saveSignedDocument:", error);
    throw error;
  }
}

// Function to fetch document types
export async function fetchDocumentTypes(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId
  };

  return apiRequest("type-documents", requestBody, token);
}

// Function to fetch organizations
export async function fetchOrganizations(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId
  };

  return apiRequest("organization", requestBody, token);
}

// Function to fetch projects
export async function fetchProjects(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId
  };

  return apiRequest("project", requestBody, token);
}

// Function to update document files
export async function updateDocumentFiles(token, username, arrayToRemove, arrayToUpload, documentId, documentType) {
  const requestBody = {
    username: username,
    action: "update_document_files",
    type: documentType,
    documentId: documentId,
    array_to_remove: arrayToRemove,
    array_to_upload: arrayToUpload
   };

  // console.log('Sending update_document_files request');
  // console.log('Request body:', requestBody);
  // console.log('Array to remove:', arrayToRemove);
  // console.log('Array to upload:', arrayToUpload);
  
  const response = await apiRequest("document_files", requestBody, token);
  // console.log('Received response:', response);
  return response;
}

// Function to fetch CFO data
export async function fetchCFOs(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId
  };

  return apiRequest("cfo", requestBody, token);
}

// Function to fetch DDS articles
export async function fetchDdsArticles(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId,
    type: "expenditure"
  };

  return apiRequest("ddsArticle", requestBody, token);
}

// Function to fetch budget articles
export async function fetchBudgetArticles(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId,
    type: "expenditure"
  };

  return apiRequest("budget-article", requestBody, token);
}

// Function to fetch counterparties
export async function fetchCounterparties(token, documentId) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId,
    type: "expenditure"
  };

  return apiRequest("counterparty-list", requestBody, token);
}

// Function to fetch contracts for a specific counterparty
export async function fetchContracts(token, documentId, counterpartyGuid) {
  const requestBody = {
    username: "Администратор",
    documentId: documentId,
    type: "expenditure",
    counterparty_guid: counterpartyGuid
  };

  return apiRequest("contract-list", requestBody, token);
}

export default apiRequest;