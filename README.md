# New React App

This is a React application created by copying components from the ag_tech_web folder and converting them to JSX format.

## Project Structure

```
new-react-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Dashboard.css
│   │   ├── Dashboard.jsx
│   │   └── Login.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── services/
│   │   └── fetchManager.js
│   ├── App.css
│   ├── App.jsx
│   ├── config.js
│   ├── index.css
│   └── index.js
├── package.json
└── README.md
```

## Components Implemented

1. **Login Component** (`src/components/Login.jsx`)
   - User authentication interface
   - Theme switching (light/dark mode)
   - Form validation

2. **Dashboard Component** (`src/components/Dashboard.jsx`)
   - Sidebar navigation with collapsible sections
   - Document listing with filtering capabilities
   - User profile section with logout functionality
   - Theme switching
   - Integration with fetchManager service for real data
   - Empty placeholders for DocumentDetail and DocumentForm (to be implemented later)

## How to Run

1. Navigate to the project directory:
   ```
   cd new-react-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Implementation Notes

- All components have been converted from TypeScript (.tsx) to JavaScript (.jsx) format
- Dependencies on external services have been simplified for demonstration purposes
- The Dashboard component includes empty placeholders for dependent components that will be implemented in future steps
- CSS styling has been included for a complete user interface experience

## Services Implemented

1. **FetchManager Service** (`src/services/fetchManager.js`)
   - API communication layer for interacting with the 1C backend
   - Functions for fetching documents, document counts, and document details
   - Support for document actions (approve, reject, edit, delete)
   - Integration with authentication and CSRF token handling
   - Fallback to mock data for development

## Data

1. **Mock Data** (`src/data/mockData.js`)
   - Sample documents and users for development and testing
   - Used as fallback when API is not available

## Next Steps

1. Implement DocumentDetail component for viewing document details
2. Implement DocumentForm component for creating new documents
3. Add real API integration for document management
4. Implement additional dashboard features