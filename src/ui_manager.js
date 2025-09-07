export class UIManager {
    constructor(app) {
        this.app = app;
        this.initializeUI();
    }

    initializeUI() {
        // this.setupModeToggle();
        this.setupWorldButton();
        // this.setupPrimitiveSelection();
        this.updateAllDisplays();
    }

    // setupModeToggle() {
    //     const userModeBtn = document.getElementById('user-mode-btn');
    //     const generativeModeBtn = document.getElementById('generative-mode-btn');

    //     userModeBtn.addEventListener('click', () => {
    //         this.app.setMode('user');
    //         this.updateModeButtons();
    //     });

    //     generativeModeBtn.addEventListener('click', () => {
    //         this.app.setMode('generative');
    //         this.updateModeButtons();
    //     });
    // }

    // setupPrimitiveSelection() {
    //     const primitiveButtons = document.querySelectorAll('.primitive-button');
        
    //     primitiveButtons.forEach(button => {
    //         button.addEventListener('click', () => {
    //             const primitive = button.dataset.primitive;
    //             this.app.setSelectedPrimitive(primitive);
    //             this.updatePrimitiveButtons();
    //         });
    //     });

    //     // Set initial selection
    //     this.updatePrimitiveButtons();
    // }

    setupWorldButton() {
      const worldButton = document.querySelector('.toggle-switch');
      worldButton.addEventListener("click", (event) => {
        const running = event.currentTarget.children[0].checked;
        if (running) {
          this.app.world.start();
        }
        else {
          this.app.world.stop();
        }
      })
    }

    // updateModeButtons() {
    //     const userBtn = document.getElementById('user-mode-btn');
    //     const generativeBtn = document.getElementById('generative-mode-btn');

    //     userBtn.classList.toggle('active', this.app.mode === 'user');
    //     generativeBtn.classList.toggle('active', this.app.mode === 'generative');
    // }

    // updatePrimitiveButtons() {
    //     const primitiveButtons = document.querySelectorAll('.primitive-button');
        
    //     primitiveButtons.forEach(button => {
    //         const isSelected = button.dataset.primitive === this.app.selectedPrimitive;
    //         button.classList.toggle('active', isSelected);
    //     });
    // }

    // updateModeDisplay() {
    //     const currentModeElement = document.getElementById('current-mode');
    //     if (currentModeElement) {
    //         currentModeElement.textContent = this.app.mode.charAt(0).toUpperCase() + 
    //                                        this.app.mode.slice(1);
    //     }
    //     this.updateModeButtons();
    // }

    // updateSelectedPrimitive() {
    //     const selectedPrimitiveElement = document.getElementById('selected-primitive');
    //     if (selectedPrimitiveElement) {
    //         selectedPrimitiveElement.textContent = 
    //             this.app.selectedPrimitive.charAt(0).toUpperCase() + 
    //             this.app.selectedPrimitive.slice(1);
    //     }
    //     this.updatePrimitiveButtons();
    // }

    updateObjectCount() {
        const objectCountElement = document.getElementById('object-count');
        if (objectCountElement && this.app.objectManager) {
            objectCountElement.textContent = this.app.objectManager.getObjectCount();
        }
    }

    updateMessageCount() {
        const messageCountElement = document.getElementById('message-count');
        if (messageCountElement && this.app.oscManager) {
            messageCountElement.textContent = this.app.oscManager.getMessageCount();
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('osc-status');
        if (statusElement && this.app.oscManager) {
            const isConnected = this.app.oscManager.isOSCConnected();
            statusElement.className = `status-indicator ${isConnected ? 'connected' : ''}`;
        }
    }

    updateAllDisplays() {
        // this.updateModeDisplay();
        // this.updateSelectedPrimitive();
        this.updateObjectCount();
        this.updateMessageCount();
        this.updateConnectionStatus();
    }

    update() {
        // Update dynamic elements that change frequently
        this.updateObjectCount();
        this.updateMessageCount();
        this.updateConnectionStatus();
    }

    // Helper method to show temporary notifications
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;

        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Method to disable/enable UI based on mode
    // updateUIForMode() {
    //     const primitivesPanel = document.querySelector('.primitives-menu').parentElement;
        
    //     if (this.app.mode === 'generative') {
    //         primitivesPanel.style.opacity = '0.5';
    //         primitivesPanel.style.pointerEvents = 'none';
    //     } else {
    //         primitivesPanel.style.opacity = '1';
    //         primitivesPanel.style.pointerEvents = 'auto';
    //     }
    // }
}
