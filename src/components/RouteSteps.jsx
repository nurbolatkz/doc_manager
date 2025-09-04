import React from 'react';

const RouteSteps = ({ 
  routeSteps = [], 
  routeType = null, 
  routeTitles = [], 
  usersList = [], 
  selectedUsers = {}, 
  searchTerms = {}, 
  theme, 
  onCopyRouteStep, 
  onDeleteRouteStep, 
  onUserSelection, 
  onSearchTermChange 
}) => {
  // Function to get filtered users for a step based on search term
  const getFilteredUsers = (stepGuid) => {
    const searchTerm = searchTerms[stepGuid] || '';
    if (!searchTerm) return usersList;
    
    return usersList.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Function to render user dropdown with search functionality
  const renderUserDropdown = (stepGuid, title) => {
    const searchTerm = searchTerms[stepGuid] || '';
    const filteredUsers = getFilteredUsers(stepGuid);
    const selectedUserGuid = selectedUsers[stepGuid] || '';
    
    // Find the selected user object to display the name
    const selectedUser = usersList.find(user => user.guid === selectedUserGuid);
    
    return (
      <div className="user-selection mt-2">
        <div className="search-container mb-2">
          <input
            type="text"
            className={`form-control ${theme && theme.mode === 'dark' ? 'dark' : 'light'}`}
            placeholder="Поиск пользователя..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(stepGuid, e.target.value)}
          />
        </div>
        
        {/* Show filtered user list when there's a search term */}
        {searchTerm && (
          <div className={`filtered-user-list ${theme && theme.mode === 'dark' ? 'dark' : 'light'}`}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.guid}
                  className={`filtered-user-item ${selectedUserGuid === user.guid ? 'selected' : ''}`}
                  onClick={() => {
                    onUserSelection(stepGuid, user.guid);
                    // Clear search term after selection
                    onSearchTermChange(stepGuid, '');
                  }}
                >
                  {user.name}
                </div>
              ))
            ) : (
              <div className="filtered-user-item">
                Пользователи не найдены
              </div>
            )}
          </div>
        )}
        
        {/* Hidden select for form submission compatibility */}
        <select
          className={`form-control hidden ${theme && theme.mode === 'dark' ? 'dark' : 'light'}`}
          value={selectedUserGuid}
          onChange={(e) => onUserSelection(stepGuid, e.target.value)}
        >
          <option value="">Выберите пользователя</option>
          {usersList.map(user => (
            <option key={user.guid} value={user.guid}>
              {user.name}
            </option>
          ))}
        </select>
        
        {/* Display selected user */ }
        {selectedUser && (
          <div className={`selected-user-display ${theme && theme.mode === 'dark' ? 'dark' : 'light'} mt-2`}>
            <span>Выбран: {selectedUser.name}</span>
          </div>
        )}
      </div>
    );
  };

  // Render route steps component
  // Check if we need to show free route steps
  const showFreeRouteSteps = routeType === 'free' && routeTitles.length > 0 && routeSteps.length === 0;
  
  if (!routeSteps || (routeSteps.length === 0 && !showFreeRouteSteps)) {
    return (
      <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <i className="fas fa-route"></i>
          Маршрут документа
        </div>
        <div className="text-center py-8">
          <i className={`fas fa-route text-3xl mb-2 ${theme?.mode === 'dark' ? 'dark' : ''}`}></i>
          <p className={`text-gray-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>Маршрут документа не настроен</p>
        </div>
      </div>
    );
  }

  // Render free route steps
  if (showFreeRouteSteps) {
    return (
      <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <i className="fas fa-route"></i>
          Маршрут документа
        </div>
        
        <div className="route-flow-container space-y-4">
          <div className={`route-start-icon flex items-center text-green-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-play-circle mr-3 text-xl"></i>
            <span className="text-sm font-medium">Начало маршрута</span>
          </div>
          
          <div className="route-steps-container space-y-4 ml-8">
            {routeTitles.map((title, index) => {
              const stepGuid = title.guid;
              
              return (
                <div 
                  key={stepGuid} 
                  className={`route-step pending ${theme?.mode === 'dark' ? 'dark' : ''}`}
                  data-index={index}
                >
                  <div className={`icon ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                    <i className="fas fa-hourglass-half"></i>
                  </div>
                  <div className={`route-step-info ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                    <strong className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{title.name || `Шаг ${index + 1}`}</strong>
                    
                    {/* User selection dropdown with search */}
                    <div className={`user-dropdown ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                      {renderUserDropdown(stepGuid, title)}
                    </div>
                  </div>
                  
                  {/* Action buttons for free route steps */}
                  <div className="step-actions">
                    <button 
                      className="copy-step-btn"
                      onClick={() => onCopyRouteStep(stepGuid)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button 
                      className="delete-step-btn"
                      onClick={() => onDeleteRouteStep(stepGuid)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={`route-finish-icon flex items-center text-blue-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
            <i className="fas fa-flag-checkered mr-3 text-xl"></i>
            <span className="text-sm font-medium">Завершение маршрута</span>
          </div>
        </div>
      </div>
    );
  }

  const getStepStatusClass = (index, status) => {
    if (status === 'approved') return 'approved';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'fas fa-check';
      case 'rejected': return 'fas fa-times';
      default: return 'fas fa-hourglass-half';
    }
  };

  return (
    <div className={`content-card ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      <div className={`section-header ${theme?.mode === 'dark' ? 'dark' : ''}`}>
        <i className="fas fa-route"></i>
        Маршрут документа
      </div>
      
      <div className="route-flow-container space-y-4">
        <div className={`route-start-icon flex items-center text-green-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <i className="fas fa-play-circle mr-3 text-xl"></i>
          <span className="text-sm font-medium">Начало маршрута</span>
        </div>
        
        <div className="route-steps-container space-y-4 ml-8">
          {routeSteps.map((step, index) => {
            const statusClass = getStepStatusClass(index, step.status);
            const statusIcon = getStepStatusIcon(step.status);
            
            // Get users for this step and flatten any multi-line users into separate users
            let users = [''];
            if (step.users && step.users.length > 0) {
              users = step.users.flatMap(user => 
                user.split('\n').filter(line => line.trim() !== '')
              );
              if (users.length === 0) users = [''];
            }
            
            return (
              <div 
                key={step.id} 
                className={`route-step ${statusClass} ${theme?.mode === 'dark' ? 'dark' : ''}`}
                data-index={index}
              >
                <div className={`icon ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                  <i className={statusIcon}></i>
                </div>
                <div className={`route-step-info ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                  <strong className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{step.title || `Шаг ${index + 1}`}</strong>
                  <ul className={`user-list ${theme?.mode === 'dark' ? 'dark' : ''}`}>
                    {users.map((user, userIndex) => (
                      <li key={userIndex} className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>
                        <i className={`far fa-user mr-1 ${theme?.mode === 'dark' ? 'dark' : ''}`}></i>
                        {user}
                      </li>
                    ))}
                  </ul>
                  {step.comment && <span className={`${theme?.mode === 'dark' ? 'dark' : ''}`}>{step.comment}</span>}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={`route-finish-icon flex items-center text-blue-500 ${theme?.mode === 'dark' ? 'dark' : ''}`}>
          <i className="fas fa-flag-checkered mr-3 text-xl"></i>
          <span className="text-sm font-medium">Завершение маршрута</span>
        </div>
      </div>
    </div>
  );
};

export default RouteSteps;