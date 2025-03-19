// State tracking for the main dropdown menu
const mainDropdownElement = $("#signUpDropDown");
const hamburgerMenuButton = $("#HeaderRightHamburger");
const hamburgerMenuContent = $("#HamburgerContent");
const hamburgerButtonImage = $("#HamburgerBTNImg");

let isHamburgerMenuOpened = false;

// Initializes dropdown handlers on window load
$(window).on("load", function () { 
    // Clear nav items if their text is empty
    const navContent = $("#mySidenav .sidenav-content");
    const navItems = navContent.find("a");
    navItems.each(function () {
        const navText = $(this).text().trim();
        if (navText === "") {
            $(this).hide();
        }
    });

    // In future -> add settings stuff for background canvas - END
});

/* Set the width of the side navigation to {x}px */
function openNav() {
    document.getElementById("mySidenav").style.width = "320px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Animates a specified element with custom callbacks
function animateElement(element, animationName, durationInSeconds, callback) {
    if (element != null) {
        element.style.animation = `${animationName} ${durationInSeconds + durationInSeconds * 0.5}s`;
        setTimeout(callback, durationInSeconds * 1000);
    }
}

// Adds and removes CSS classes dynamically
function addAndRemoveClass(elementId, classToAdd, classToRemove) {
    const element = document.getElementById(elementId);
    if (element != null) {
        element.classList.remove(classToRemove);
        element.classList.add(classToAdd);
    }
}

// Removes a CSS class from an element
function removeClass(elementId, classToRemove) {
    const element = document.getElementById(elementId);
    if (element != null) {
        element.classList.remove(classToRemove);
    }
}

// Adds a CSS class to an element
function addClass(elementId, classToAdd) {
    const element = document.getElementById(elementId);
    if (element != null) {
        element.classList.add(classToAdd);
    }
}

// Redirects to a specified URL based on an ID
function redirect(redirectId) {
    const urls = {
        0: "https://etce-lab.com/",
        1: "about",
        2: "snakes",
        3: "settings",
        4: "../../settings",
        999: "../../snakes"
    };

    const headerElements = {
        header: document.getElementById("header"),
        footer: document.getElementById("footer"),
        headerLeft: document.getElementById("HeaderLeft"),
        headerRight: document.getElementById("HeaderRight"),
        body: document.getElementById("body")
    };

    Object.values(headerElements).forEach(el => animateElement(el, "smoothToTop", 0.5));
    
    let animationType = "growOut"; 

    animateElement(document.getElementById("archDiv"), animationType, 1);
    animateElement(headerElements.body, "smoothOpacityOut", 0.9, () => {
        window.location.href = urls[redirectId] || "/";
    });
}

// Template created in 2024, Copyright © Aron Särkioja to DIGIT-RESEARCH. All rights reserved to DIGIT-RESEARCH.