// Identify elements with jQuery UI classes and remove the classes from those elements
const uiClasses = [
    'ui-checkboxradio-label', 'ui-checkboxradio-icon', 'ui-btn',
    'ui-btn-inherit', 'ui-checkbox', 'ui-slider',
    'ui-spinner-input', 'ui-checkboxradio-icon-space', 'ui-widget',
    'ui-widget-content', 'ui-widget-header', 'ui-state-default',
    'ui-state-active', 'ui-state-hover', 'ui-state-focus',
    'ui-corner-all', 'ui-front', 'ui-helper-hidden-accessible',
    'ui-helper-hidden', 'ui-helper-reset', 'ui-helper-clearfix',
    'ui-helper-zfix', 'ui-priority-primary', 'ui-priority-secondary',
    'ui-btn-icon-left', 'ui-btn-icon-notext', 'ui-btn-icon-right',
    'ui-btn-icon-top', 'ui-btn-icon-bottom', 'ui-checkbox-off',
    'ui-page-theme-a', 'ui-overlay-a', 'ui-panel-wrapper',
    'ui-btn-icon-left','ui-checkbox-off','ui-checkbox-on',
    'ui-focus'
];

// On site load
$(document).ready(function () {
    clear_classes();
});

function clear_classes(){
    uiClasses.forEach(uiClass => {
        $(`.${uiClass}`).removeClass(uiClass);
    });
}

// Script to remove jQuery UI classes from the page
// This is necessary because the jQuery UI library keeps injecting its own styles into the page
// This script will remove jQuery UI classes from above from the page to prevent style conflicts. 
// You can always add more classes to the list at the top as needed.