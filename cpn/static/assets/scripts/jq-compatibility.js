$(document).ready(function() {
    // Identify elements with jQuery UI classes and remove them
    const uiClasses = [
        'ui-checkboxradio-label', 'ui-checkboxradio-icon', 'ui-btn', 
        'ui-btn-inherit', 'ui-checkbox', 'ui-slider', 
        'ui-spinner-input', 'ui-checkboxradio-icon-space', 'ui-widget', 
        'ui-widget-content', 'ui-widget-header', 'ui-state-default', 
        'ui-state-active', 'ui-state-hover', 'ui-state-focus', 
        'ui-corner-all', 'ui-front', 'ui-helper-hidden-accessible', 
        'ui-helper-hidden', 'ui-helper-reset', 'ui-helper-clearfix', 
        'ui-helper-zfix', 'ui-priority-primary', 'ui-priority-secondary'
    ];

    uiClasses.forEach(uiClass => {
        $(`.${uiClass}`).removeClass(uiClass);
    });
});

// Script to remove jQuery UI classes from the page
// This is necessary because the jQuery UI library keeps injecting its own styles into the page
// This script will remove all jQuery UI classes from the page to prevent style conflicts