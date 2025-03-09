// Is canvas animation checked
let CanvasAnimation = false;

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

    let cV = localStorage.getItem("canvasAnimation");
    switch (cV) {
        case null:
            localStorage.setItem("canvasAnimation", "true");
            SetCanvas(true);
            break;
    }
    /* THE FOLLOWING CODE IS DEPRECATED AND REPLACED WITH A MORE BEAUTIFIED DESIGN
    hamburgerMenuButton.on("click", function () {
        if (!isHamburgerMenuOpened) {
            hamburgerMenuContent.css("animation", "smoothOpacityIn 1s ease-in-out, growInFromVoid 1s ease-in-out");
            hamburgerButtonImage.css("transform", "RotateZ(90deg)")

            hamburgerMenuContent.css("display", "flex");
        } else {
            hamburgerButtonImage.css("transform", "RotateZ(0deg)")
            hamburgerMenuContent.css("animation", "growOut 0.5s ease-in-out");
            setTimeout(() => {
                hamburgerMenuContent.css("display", "none");
            }, 500);

        }

        isHamburgerMenuOpened = !isHamburgerMenuOpened;
    })
    END OF REMOVED CODE */

    // In future -> add settings stuff for background canvas - START
    $('#canvasAnimation').click(function () {
        if (this.checked) {
            localStorage.setItem("canvasAnimation", "true");
            createCanvas("body");
        }
        else if (!this.checked) {
            SetCanvas(false);
            localStorage.setItem("canvasAnimation", "false");
        }
    })

    $("[type=range]").change(function () {
        let newv = $(this).val();
        $(this).next().text(newv);
    });;

    $("#amountOfStars").change(function () {
        localStorage.setItem("bgStarCount", $(this).val());
    })

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
        0: "https://www.digit-research.de/digitec-studieren",
        1: "about",
        2: "snakes",
        3: "settings",
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

    let animationType = "";
    switch (activeBodyTextArea) {
        case "infoHolderChild1":
        case "archDiv":
            animationType = "growOut";
            break;
        case "HomeText":
            animationType = "smoothToBottom";
            break;
        default:
            animationType = "growOut";
    }

    animateElement(document.getElementById(activeBodyTextArea), animationType, 1);
    animateElement(headerElements.body, "smoothOpacityOut", 0.9, () => {
        window.location.href = urls[redirectId] || "/";
    });
}


// Document ready actions not used (YET, feel free to add as you wish)
document.addEventListener("DOMContentLoaded", () => {
    $(document).ready(

        function () {
            let url = window.location.href;
            if (url.includes("settings")) {
                $("#amountOfStars").val(parseInt(localStorage.getItem("bgStarCount")));
                $("#amountOfStars").next().text(parseInt(localStorage.getItem("bgStarCount")));
                switch (localStorage.getItem("canvasAnimation")) {
                    case "true":
                        $('#canvasAnimation').prop('checked', true);
                        break;

                    case "false":
                        $('#canvasAnimation').prop('checked', false);
                        break;
                }
            }

        });

    // Not in use
    const archiveSuffix = " - DIGITAL TECHNOLOGIES";
    const titles = {
        0: "Log In",
        1: "About",
        2: "Archive",
        3: "Register",
        4: "Upload",
        5: "Admin Panel",
        6: "Settings",
    };
    var activeSection = null;

    switch (document.title) {
        case (titles[0] + archiveSuffix || titles[3] + archiveSuffix || titles[4] + archiveSuffix || titles[5] + archiveSuffix || titles[6] + archiveSuffix):
            activeSection = "infoHolderChild1";
            break;

        case (titles[1] + archiveSuffix):
            activeSection = "HomeText";
            break;

        case (titles[2] + archiveSuffix):
            activeSection = "archDiv";
            break;
    }

    activeBodyTextArea = activeSection;
})

document.addEventListener('DOMContentLoaded', () => {
    // Etsi kaikki elementit, joilla on luokka .transition-box
    const transitions = document.querySelectorAll('.transition-box');
    transitions.forEach(el => {
        const topVal = el.getAttribute('data-top');
        const leftVal = el.getAttribute('data-left');
        el.style.top = topVal + 'px';
        el.style.left = leftVal + 'px';
    });
});
// Template created in 2024, Copyright © Aron Särkioja. All rights reserved.