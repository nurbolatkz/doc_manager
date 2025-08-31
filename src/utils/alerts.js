// Custom alert function
export const showCustomMessage = (message, type = 'info') => {
    // Define alert configurations for better UX
    const alertConfig = {
        success: {
            bgColor: '#d1e7dd',
            borderColor: '#badbcc',
            textColor: '#0f5132',
            icon: 'check-circle',
            iconColor: '#198754'
        },
        danger: {
            bgColor: '#f8d7da',
            borderColor: '#f5c2c7',
            textColor: '#842029',
            icon: 'exclamation-triangle',
            iconColor: '#dc3545'
        },
        warning: {
            bgColor: '#fff3cd',
            borderColor: '#ffecb5',
            textColor: '#664d03',
            icon: 'exclamation-circle',
            iconColor: '#fd7e14'
        },
        info: {
            bgColor: '#d1ecf1',
            borderColor: '#bee5eb',
            textColor: '#055160',
            icon: 'info-circle',
            iconColor: '#0dcaf0'
        }
    };
    
    const config = alertConfig[type] || alertConfig.info;
    
    // Create enhanced alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 420px;
        min-width: 300px;
        background-color: ${config.bgColor} !important;
        border: 1px solid ${config.borderColor} !important;
        color: ${config.textColor} !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        padding: 16px 20px;
        margin-bottom: 0;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation: slideInRight 0.4s ease-out forwards;
        opacity: 0;
    `;
    
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas fa-${config.icon}" 
               style="color: ${config.iconColor}; 
                      font-size: 18px; 
                      margin-top: 2px; 
                      flex-shrink: 0;"></i>
            <div style="flex: 1; font-weight: 500;">${message}</div>
            <button type="button" 
                    class="btn-close" 
                    data-bs-dismiss="alert" 
                    aria-label="Close"
                    style="font-size: 12px; 
                           opacity: 0.6; 
                           flex-shrink: 0;
                           margin: -4px -8px -4px 8px;
                           transition: opacity 0.2s ease;">
            </button>
        </div>
    `;
    
    // Add CSS animation keyframes if not already present
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideInRight {
                0% {
                    transform: translateX(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .custom-alert .btn-close:hover {
                opacity: 1 !important;
                transform: scale(1.1);
            }
            
            .custom-alert:hover {
                transform: translateX(-2px);
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alertDiv);
    
    // Trigger animation
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Enhanced auto-removal with progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background-color: ${config.iconColor};
        border-radius: 0 0 12px 12px;
        width: 100%;
        transform-origin: left;
        animation: progressShrink 5s linear forwards;
    `;
    
    // Add progress bar animation
    if (!document.querySelector('#progress-animation')) {
        const progressStyle = document.createElement('style');
        progressStyle.id = 'progress-animation';
        progressStyle.textContent = `
            @keyframes progressShrink {
                0% { transform: scaleX(1); }
                100% { transform: scaleX(0); }
            }
        `;
        document.head.appendChild(progressStyle);
    }
    
    alertDiv.appendChild(progressBar);
    
    // Auto remove after 5 seconds with smooth exit
    const autoRemoveTimer = setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.style.transform = 'translateX(100%)';
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode) alertDiv.remove();
            }, 400);
        }
    }, 5000);
    
    // Clear timer if manually closed
    alertDiv.addEventListener('closed.bs.alert', () => {
        clearTimeout(autoRemoveTimer);
    });
    
    // Add click-to-dismiss functionality
    alertDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-close')) {
            clearTimeout(autoRemoveTimer);
            alertDiv.style.transform = 'translateX(100%)';
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode) alertDiv.remove();
            }, 400);
        }
    });
};