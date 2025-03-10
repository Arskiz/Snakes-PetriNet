// Enhanced fix for buttons and toggle animations
document.addEventListener('DOMContentLoaded', function () {
    // Run fixes immediately and after short delays
    fixButtonsAndToggles();
    setTimeout(fixButtonsAndToggles, 300);
    setTimeout(fixToggleSwitches, 300);
    setTimeout(fixButtonsAndToggles, 1000);
    setTimeout(fixToggleSwitches, 1000);
});

function fixToggleSwitches() {
    console.log('Fixing toggle switch animations');

    // Find all toggle switches
    document.querySelectorAll('.toggle-switch').forEach(function (toggleSwitch) {
        // Check if this toggle already has the ball element
        if (toggleSwitch.querySelector('.toggle-ball')) return;

        // Find the checkbox and slider
        const checkbox = toggleSwitch.querySelector('input[type="checkbox"]');
        const slider = toggleSwitch.querySelector('.toggle-slider');

        if (!checkbox || !slider) return;

        // Create the ball element
        const ball = document.createElement('span');
        ball.className = 'toggle-ball';

        // Add the ball after the slider
        toggleSwitch.appendChild(ball);

        // Make sure the toggle responds to clicks
        toggleSwitch.addEventListener('click', function (event) {
            // Don't propagate the click if it was directly on the checkbox
            if (event.target === checkbox) return;

            // Toggle the checkbox
            checkbox.checked = !checkbox.checked;

            // Trigger a change event so any listeners know the checkbox changed
            const changeEvent = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(changeEvent);

            // Determine which setting this toggle controls
            let settingKey;
            if (checkbox.id === 'animation-toggle') settingKey = 'enabled';
            else if (checkbox.id === 'performance-mode') settingKey = 'performanceMode';
            else if (checkbox.id === 'mouse-interaction') settingKey = 'mouseInteraction';
            else if (checkbox.id === 'pulsing-effect') settingKey = 'pulsingEffect';
            else if (checkbox.id === 'cluster-effect') settingKey = 'clusterEffect';

            // Update the setting if possible
            if (settingKey && window.updateSetting) {
                window.updateSetting(settingKey, checkbox.checked);
            }
        });

        // Prevent default on the label to avoid double-toggling
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
            label.addEventListener('click', function (event) {
                event.preventDefault();
            });
        }
    });
}

function fixButtonsAndToggles() {
    console.log('Fixing buttons and toggle animations');

    // Fix toggle switches - make them animate properly
    document.querySelectorAll('.toggle-switch').forEach(function (toggleSwitch) {
        // Find the toggle components
        const toggleLabel = toggleSwitch.closest('.setting-item').querySelector('label');
        const toggleId = toggleLabel ? toggleLabel.getAttribute('for') : null;

        if (!toggleId) return;

        // Find the checkbox by ID
        const checkbox = document.getElementById(toggleId);
        if (!checkbox) return;

        // Find or create the slider element
        let slider = toggleSwitch.querySelector('.toggle-slider');
        if (!slider) {
            slider = document.createElement('span');
            slider.className = 'toggle-slider';
            toggleSwitch.appendChild(slider);
        }

        // Find or create the slider button/knob (the circle that moves)
        let sliderButton = slider.querySelector('.slider-button');
        if (!sliderButton) {
            sliderButton = document.createElement('span');
            sliderButton.className = 'slider-button';
            slider.appendChild(sliderButton);
        }

        // Set up styles for animation
        toggleSwitch.style.position = 'relative';
        toggleSwitch.style.display = 'inline-block';
        toggleSwitch.style.width = '54px';
        toggleSwitch.style.height = '28px';
        toggleSwitch.style.cursor = 'pointer';

        slider.style.position = 'absolute';
        slider.style.top = '0';
        slider.style.left = '0';
        slider.style.right = '0';
        slider.style.bottom = '0';
        slider.style.backgroundColor = checkbox.checked ? '#0087af' : '#374056';
        slider.style.transition = 'background-color 0.3s';
        slider.style.borderRadius = '28px';

        sliderButton.style.position = 'absolute';
        sliderButton.style.width = '20px';
        sliderButton.style.height = '20px';
        sliderButton.style.left = checkbox.checked ? '30px' : '4px';
        sliderButton.style.bottom = '4px';
        sliderButton.style.backgroundColor = '#ffffff';
        sliderButton.style.transition = 'left 0.3s';
        sliderButton.style.borderRadius = '50%';

        // Create a click handler that properly animates the toggle
        const toggleHandler = function () {
            // Toggle the checked state
            checkbox.checked = !checkbox.checked;

            // Animate the slider
            slider.style.backgroundColor = checkbox.checked ? '#0087af' : '#374056';
            sliderButton.style.left = checkbox.checked ? '30px' : '4px';

            // Determine which setting this toggle controls
            let settingKey;
            switch (toggleId) {
                case 'animation-toggle':
                    settingKey = 'enabled';
                    break;
                case 'performance-mode':
                    settingKey = 'performanceMode';
                    break;
                case 'mouse-interaction':
                    settingKey = 'mouseInteraction';
                    break;
                case 'pulsing-effect':
                    settingKey = 'pulsingEffect';
                    break;
                case 'cluster-effect':
                    settingKey = 'clusterEffect';
                    break;
            }

            // Update the setting in localStorage
            updateSetting(settingKey, checkbox.checked);
        };

        // Make both the toggle and the label clickable
        [toggleSwitch, toggleLabel].forEach(function (element) {
            if (element) {
                // Remove existing click listeners to avoid duplicates
                const newElement = element.cloneNode(true);
                if (element.parentNode) {
                    element.parentNode.replaceChild(newElement, element);
                }

                // Add new click listener to the cloned element
                newElement.addEventListener('click', toggleHandler);
            }
        });

        // Initial state setup - ensure visual state matches checkbox
        slider.style.backgroundColor = checkbox.checked ? '#0087af' : '#374056';
        sliderButton.style.left = checkbox.checked ? '30px' : '4px';
    });

    // Fix increment/decrement buttons
    document.querySelectorAll('.range-button').forEach(function (button) {
        // Style the button properly
        button.style.width = '28px';
        button.style.height = '28px';
        button.style.borderRadius = '4px';
        button.style.border = 'none';
        button.style.backgroundColor = '#374056';
        button.style.color = '#ffffff';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.fontSize = '16px';
        button.style.margin = '0 2px';

        // Add hover effect
        button.addEventListener('mouseenter', function () {
            button.style.backgroundColor = '#0087af';
        });

        button.addEventListener('mouseleave', function () {
            button.style.backgroundColor = '#374056';
        });

        // Replace the button with a clone to remove any existing event listeners
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }

        // Add click effect
        newButton.addEventListener('mousedown', function () {
            newButton.style.transform = 'scale(0.95)';
        });

        newButton.addEventListener('mouseup', function () {
            newButton.style.transform = 'scale(1)';
        });

        // Find which value this button controls
        const settingItem = newButton.closest('.setting-item');
        const settingLabel = settingItem ? settingItem.querySelector('label') : null;

        if (!settingLabel) return;

        const labelText = settingLabel.textContent.trim().toLowerCase();
        const isDecrease = newButton.textContent.includes('-');

        // Determine which setting to update based on label text
        let settingKey, step, min, max;

        if (labelText.includes('node count')) {
            settingKey = 'starCount';
            step = 5;
            min = 10;
            max = 100;
        } else if (labelText.includes('speed')) {
            settingKey = 'speedFactor';
            step = 0.1;
            min = 0.5;
            max = 2.0;
        } else if (labelText.includes('opacity')) {
            settingKey = 'opacity';
            step = 0.1;
            min = 0.1;
            max = 1.0;
        } else if (labelText.includes('connection')) {
            settingKey = 'connectionDistance';
            step = 10;
            min = 50;
            max = 250;
        } else {
            return; // Unknown setting, skip this button
        }

        // Add click handler to update the value and display
        newButton.addEventListener('click', function () {
            // Get the value display element
            const valueDisplay = settingItem.querySelector('.range-value');
            if (!valueDisplay) return;

            // Get the current displayed value
            const currentDisplayText = valueDisplay.textContent.trim();
            let currentValue;

            // Parse the current value based on the setting type
            if (settingKey === 'starCount') {
                currentValue = parseInt(currentDisplayText);
            } else if (settingKey === 'speedFactor') {
                currentValue = parseFloat(currentDisplayText.replace('x', ''));
            } else if (settingKey === 'opacity') {
                currentValue = parseInt(currentDisplayText.replace('%', '')) / 100;
            } else if (settingKey === 'connectionDistance') {
                currentValue = parseInt(currentDisplayText.replace('px', ''));
            }

            // Calculate the new value
            let newValue;
            if (isDecrease) {
                newValue = Math.max(min, currentValue - step);
            } else {
                newValue = Math.min(max, currentValue + step);
            }

            // Update the setting
            updateSetting(settingKey, newValue);

            // Update the display value
            let formattedValue;
            if (settingKey === 'starCount') {
                formattedValue = Math.round(newValue).toString();
            } else if (settingKey === 'speedFactor') {
                formattedValue = newValue.toFixed(1) + 'x';
            } else if (settingKey === 'opacity') {
                formattedValue = Math.round(newValue * 100) + '%';
            } else if (settingKey === 'connectionDistance') {
                formattedValue = Math.round(newValue) + 'px';
            }

            if (formattedValue) {
                valueDisplay.textContent = formattedValue;
            }

            console.log(`Button clicked: ${isDecrease ? 'decrease' : 'increase'}, Setting: ${settingKey}, Current: ${currentValue}, New: ${newValue}`);
        });
    });

    // Fix reset button
    const resetButton = document.getElementById('reset-settings');
    if (resetButton) {
        // Style the button
        resetButton.style.backgroundColor = '#374056';
        resetButton.style.color = '#ffffff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '5px';
        resetButton.style.padding = '10px 20px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.display = 'flex';
        resetButton.style.alignItems = 'center';
        resetButton.style.justifyContent = 'center';
        resetButton.style.fontWeight = '500';

        // Add hover effect
        resetButton.addEventListener('mouseenter', function () {
            resetButton.style.backgroundColor = '#0087af';
        });

        resetButton.addEventListener('mouseleave', function () {
            resetButton.style.backgroundColor = '#374056';
        });

        // Replace with a clone to remove existing listeners
        const newResetButton = resetButton.cloneNode(true);
        if (resetButton.parentNode) {
            resetButton.parentNode.replaceChild(newResetButton, resetButton);
        }

        // Add click handler
        newResetButton.addEventListener('click', function () {
            // Reset to default values
            const defaults = {
                enabled: true,
                performanceMode: false,
                mouseInteraction: true,
                pulsingEffect: true,
                clusterEffect: true,
                starCount: 50,
                speedFactor: 1.0,
                opacity: 1.0,
                connectionDistance: 150
            };

            // Save default settings
            localStorage.setItem('petriNetConfig', JSON.stringify(defaults));
            localStorage.setItem('canvasAnimation', 'true');
            localStorage.setItem('bgStarCount', '50');

            // Update all displayed values
            document.querySelectorAll('.setting-item').forEach(function (item) {
                const label = item.querySelector('label');
                if (!label) return;

                const labelText = label.textContent.trim().toLowerCase();

                // Handle toggles
                const toggleSwitch = item.querySelector('.toggle-switch');
                if (toggleSwitch) {
                    const checkbox = toggleSwitch.querySelector('input[type="checkbox"]');
                    const slider = toggleSwitch.querySelector('.toggle-slider');
                    const sliderButton = slider ? slider.querySelector('.slider-button') : null;

                    if (checkbox && slider && sliderButton) {
                        if (labelText.includes('enable animation')) {
                            checkbox.checked = defaults.enabled;
                        } else if (labelText.includes('performance mode')) {
                            checkbox.checked = defaults.performanceMode;
                        } else if (labelText.includes('mouse interaction')) {
                            checkbox.checked = defaults.mouseInteraction;
                        } else if (labelText.includes('pulsing effect')) {
                            checkbox.checked = defaults.pulsingEffect;
                        } else if (labelText.includes('cluster effect')) {
                            checkbox.checked = defaults.clusterEffect;
                        }

                        // Update appearance
                        slider.style.backgroundColor = checkbox.checked ? '#0087af' : '#374056';
                        sliderButton.style.left = checkbox.checked ? '30px' : '4px';
                    }
                }

                // Handle value displays
                const valueDisplay = item.querySelector('.range-value');
                if (valueDisplay) {
                    if (labelText.includes('node count')) {
                        valueDisplay.textContent = defaults.starCount.toString();
                    } else if (labelText.includes('speed')) {
                        valueDisplay.textContent = defaults.speedFactor.toFixed(1) + 'x';
                    } else if (labelText.includes('opacity')) {
                        valueDisplay.textContent = (defaults.opacity * 100) + '%';
                    } else if (labelText.includes('connection')) {
                        valueDisplay.textContent = defaults.connectionDistance + 'px';
                    }
                }
            });

            // If animation API is available, reset using that too
            if (window.petriNetAnimation && window.petriNetAnimation.resetConfig) {
                window.petriNetAnimation.resetConfig();
            }

            // Show confirmation
            showToast('Settings reset to defaults');
        });
    }

    console.log('Buttons and toggle animations fixed');
}

// Helper function to get setting from localStorage
function getSetting(key, defaultValue) {
    try {
        const storedConfig = localStorage.getItem('petriNetConfig');
        const config = storedConfig ? JSON.parse(storedConfig) : {};

        if (config[key] !== undefined) {
            return config[key];
        }

        // Check legacy settings
        if (key === 'enabled' && localStorage.getItem('canvasAnimation') !== null) {
            return localStorage.getItem('canvasAnimation') === 'true';
        }

        if (key === 'starCount' && localStorage.getItem('bgStarCount') !== null) {
            return parseInt(localStorage.getItem('bgStarCount'));
        }

        return defaultValue;
    } catch (e) {
        console.error('Error getting setting:', e);
        return defaultValue;
    }
}

// Helper function to update settings in localStorage
function updateSetting(key, value) {
    try {
        // Load existing config
        const storedConfig = localStorage.getItem('petriNetConfig');
        const config = storedConfig ? JSON.parse(storedConfig) : {};

        // Update the setting
        config[key] = value;

        // Save back to localStorage
        localStorage.setItem('petriNetConfig', JSON.stringify(config));

        // Update legacy settings for backward compatibility
        if (key === 'enabled') {
            localStorage.setItem('canvasAnimation', value.toString());
        } else if (key === 'starCount') {
            localStorage.setItem('bgStarCount', value.toString());
        }

        // If the animation API is available, update it directly
        if (window.petriNetAnimation && window.petriNetAnimation.updateSetting) {
            window.petriNetAnimation.updateSetting(key, value);
        }

        console.log(`Setting updated: ${key} = ${value}`);
    } catch (e) {
        console.error('Error updating setting:', e);
    }
}

// Toast notification for user feedback
function showToast(message, type = 'success') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      `;
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    toast.style.cssText = `
      background-color: ${type === 'success' ? '#0087af' : '#e74c3c'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      margin-top: 10px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Auto remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';

        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}