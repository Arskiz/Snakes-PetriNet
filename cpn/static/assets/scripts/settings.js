// Configuration code for SliderButtons and Switches using jQuery UI
$(document).ready(function() {
    // Initialize jQuery UI components
    initializeUI();
    
    // Set up event handlers and fix functionality
    fixButtonsAndToggles();
    setTimeout(fixToggleSwitches, 300);
    setTimeout(fixButtonsAndToggles, 1000);
});

function initializeUI() {
    // Initialize jQuery UI buttons - only for range buttons and reset button
    $('.range-button').button();
    $('#reset-settings').button({
        icons: {
            primary: "ui-icon-refresh"
        }
    });
    
    // Prevent jQuery UI from adding classes to header buttons
    $('.Hoverable').removeClass('ui-button ui-corner-all');
    
    // Apply jQuery UI styles to toggle switches
    $('.toggle-switch input[type="checkbox"]').each(function() {
        const id = $(this).attr('id');
        const label = $('label[for="' + id + '"]');
        
        // Make sure the toggle has initial state set correctly
        const initialState = getSetting(mapIdToSettingKey(id), $(this).prop('checked'));
        $(this).prop('checked', initialState);
    });
}

function mapIdToSettingKey(id) {
    switch (id) {
        case 'animation-toggle': return 'enabled';
        case 'performance-mode': return 'performanceMode';
        case 'mouse-interaction': return 'mouseInteraction';
        case 'pulsing-effect': return 'pulsingEffect';
        case 'cluster-effect': return 'clusterEffect';
        default: return null;
    }
}

function fixToggleSwitches() {
    // Handle toggle switch functionality
    $('.toggle-switch').each(function() {
        // Check if this toggle already has been processed
        if ($(this).data('processed')) return;
        $(this).data('processed', true);
        
        // Find the checkbox
        const checkbox = $(this).find('input[type="checkbox"]');
        if (!checkbox.length) return;
        
        // Make sure the toggle responds to clicks
        $(this).on('click', function(event) {
            // Don't process the click if it was directly on the checkbox
            if ($(event.target).is(checkbox)) return;
            
            // Toggle the checkbox
            const newState = !checkbox.prop('checked');
            checkbox.prop('checked', newState).trigger('change');
            
            // Update visual appearance manually
            const slider = $(this).find('.toggle-slider');
            if (newState) {
                slider.css('backgroundColor', '#0087af');
                slider.find('.slider-button').css('left', '30px');
            } else {
                slider.css('backgroundColor', '#374056');
                slider.find('.slider-button').css('left', '4px');
            }
            
            // Update the setting
            const settingKey = mapIdToSettingKey(checkbox.attr('id'));
            if (settingKey) {
                updateSetting(settingKey, newState);
            }
        });
        
        // Set up the change event handler
        checkbox.on('change', function() {
            const settingKey = mapIdToSettingKey($(this).attr('id'));
            if (settingKey) {
                updateSetting(settingKey, $(this).prop('checked'));
            }
        });
    });
}

function fixButtonsAndToggles() {
    // Handle toggle switches
    $('.toggle-switch').each(function() {
        const toggleSwitch = $(this);
        const checkbox = toggleSwitch.find('input[type="checkbox"]');
        const slider = toggleSwitch.find('.toggle-slider');
        const sliderButton = slider.find('.slider-button');
        
        if (!checkbox.length) return;
        
        // Get the current setting value and update checkbox state
        const settingKey = mapIdToSettingKey(checkbox.attr('id'));
        if (settingKey) {
            const value = getSetting(settingKey, checkbox.prop('checked'));
            checkbox.prop('checked', value);
            
            // Update visual appearance based on state
            if (value) {
                slider.css('backgroundColor', '#0087af');
                sliderButton.css('left', '30px');
            } else {
                slider.css('backgroundColor', '#374056');
                sliderButton.css('left', '4px');
            }
        }
    });
    
    // Handle range buttons (increment/decrement)
    $('.range-button').each(function() {
        const button = $(this);
        const settingItem = button.closest('.setting-item');
        const settingLabel = settingItem.find('label');
        
        if (!settingLabel.length) return;
        
        const labelText = settingLabel.text().trim().toLowerCase();
        const isDecrease = button.text().includes('-');
        
        // Determine which setting to update based on label text
        let settingInfo = getSettingInfo(labelText);
        if (!settingInfo) return;
        
        // Initialize the value display with current value
        const valueDisplay = settingItem.find('.range-value span');
        if (valueDisplay.length) {
            const currentValue = getSetting(settingInfo.key, settingInfo.default);
            valueDisplay.text(formatValue(currentValue, settingInfo.key));
        }
        
        // Add click handler using jQuery UI button
        button.off('click').on('click', function() {
            if (!valueDisplay.length) return;
            
            // Get the current value
            const currentDisplayText = valueDisplay.text().trim();
            const currentValue = parseDisplayValue(currentDisplayText, settingInfo.key);
            
            // Calculate the new value
            let newValue;
            if (isDecrease) {
                newValue = Math.max(settingInfo.min, currentValue - settingInfo.step);
            } else {
                newValue = Math.min(settingInfo.max, currentValue + settingInfo.step);
            }
            
            // Update the setting
            updateSetting(settingInfo.key, newValue);
            
            // Update the display
            valueDisplay.text(formatValue(newValue, settingInfo.key));
        });
    });
    
    // Reset button functionality using jQuery UI
    $('#reset-settings').off('click').on('click', function() {
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
        
        // Update all UI elements
        updateUIFromSettings(defaults);
        
        // If animation API is available, reset using that too
        if (window.petriNetAnimation && window.petriNetAnimation.resetConfig) {
            window.petriNetAnimation.resetConfig();
        }
        
        // Show confirmation using jQuery UI tooltip
        $(this).tooltip({
            items: "#reset-settings",
            content: "Settings reset to defaults",
            position: { my: "center bottom", at: "center top-10" }
        }).tooltip("open");
        
        setTimeout(() => {
            $(this).tooltip("close");
        }, 2000);
    });
}

function updateUIFromSettings(settings) {
    // Update toggle switches
    $('.toggle-switch input[type="checkbox"]').each(function() {
        const checkbox = $(this);
        const settingKey = mapIdToSettingKey(checkbox.attr('id'));
        if (settingKey && settings[settingKey] !== undefined) {
            const value = settings[settingKey];
            checkbox.prop('checked', value);
            
            // Update visual appearance too
            const slider = checkbox.siblings('.toggle-slider');
            const sliderButton = slider.find('.slider-button');
            
            if (value) {
                slider.css('backgroundColor', '#0087af');
                sliderButton.css('left', '30px');
            } else {
                slider.css('backgroundColor', '#374056');
                sliderButton.css('left', '4px');
            }
        }
    });
    
    // Update value displays
    $('.setting-item').each(function() {
        const item = $(this);
        const label = item.find('label');
        if (!label.length) return;
        
        const labelText = label.text().trim().toLowerCase();
        const settingInfo = getSettingInfo(labelText);
        
        if (!settingInfo) return;
        
        const valueDisplay = item.find('.range-value span');
        if (valueDisplay.length && settings[settingInfo.key] !== undefined) {
            valueDisplay.text(formatValue(settings[settingInfo.key], settingInfo.key));
        }
    });
}

// Loads the info for the settings page elements
function getSettingInfo(labelText) {
    if (labelText.includes('node count')) {
        return {
            key: 'starCount',
            step: 5,
            min: 10,
            max: 100,
            default: 50
        };
    } else if (labelText.includes('speed')) {
        return {
            key: 'speedFactor',
            step: 0.1,
            min: 0.5,
            max: 2.0,
            default: 1.0
        };
    } else if (labelText.includes('opacity')) {
        return {
            key: 'opacity',
            step: 0.1,
            min: 0.1,
            max: 1.0,
            default: 1.0
        };
    } else if (labelText.includes('connection')) {
        return {
            key: 'connectionDistance',
            step: 10,
            min: 50,
            max: 250,
            default: 150
        };
    }
    return null;
}

// Returns formatted version of the given parameter
function formatValue(value, settingKey) {
    switch (settingKey) {
        case 'starCount':
            return Math.round(value).toString();
        case 'speedFactor':
            return value.toFixed(1) + 'x';
        case 'opacity':
            return Math.round(value * 100) + '%';
        case 'connectionDistance':
            return Math.round(value) + 'px';
        default:
            return value.toString();
    }
}

// Returns parsed values upon called with approppriate parameters
function parseDisplayValue(displayValue, settingKey) {
    switch (settingKey) {
        case 'starCount':
            return parseInt(displayValue);
        case 'speedFactor':
            return parseFloat(displayValue.replace('x', ''));
        case 'opacity':
            return parseInt(displayValue.replace('%', '')) / 100;
        case 'connectionDistance':
            return parseInt(displayValue.replace('px', ''));
        default:
            return parseFloat(displayValue);
    }
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
    } catch (e) {
        console.error('Error updating setting:', e);
    }
}