let fullScreen = false;

let canvas_holder = null;
let parent = null;
var canvas_obj = null;

// Execute when DOM is ready
$(document).ready(function () {

    // Get parent for canvas object and the canvas object itself and pass it to "canvas_obj".
    // Then add the required class for it to function properly
    try {
        canvas_obj = $("#v-section");
        canvas_holder = $("#c-holder");
        parent = $("#header").parent();
    }
    catch (error) {
        console.error(error);
    }

    // Handle query | ( +additional queries if decided to add later on)
    let fileLength = 25;
    const filename = getQueryParam("file");
    if (filename) {
        // Log values to debug
        // console.log("Filename from query:", filename);
        // console.log("Petri filename element:", $("#petri-filename").length);
        // console.log("Petri filename text before:", $("#petri-filename").text());

        const decodedFilename = decodeURIComponent(filename);
        const truncatedFilename = decodedFilename.length > fileLength
            ? '...' + decodedFilename.slice(-fileLength)
            : decodedFilename;
        $("#petri-filename").text(truncatedFilename);

        // Log text after setting
        // console.log("Petri filename text after:", $("#petri-filename").text());
    } else {
        console.log("No filename in query parameters");
    }

    // Add event listener to buttons
    $("#c-button").on('click', toggleCanvasView);
    $("#f-button").on('click', toggleCanvasView);

});

// Function to get param from the url-string
function getQueryParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const value = urlParams.get(param);
    return value ? decodeURIComponent(value) : null;
}

// Toggle between fullscreen and windowed screen
function toggleCanvasView() {
    fullScreen = !fullScreen;
    if (fullScreen) {
        canvas_obj.appendTo(parent);
        canvas_obj.removeClass("canvas-windowed");
        canvas_obj.addClass("canvas-fullscreen");
    }
    else {
        canvas_obj.appendTo(canvas_holder);
        canvas_obj.addClass("canvas-windowed");
        canvas_obj.removeClass("canvas-fullscreen");
    }
    toggleBars(fullScreen);
}

// Moves footer and header out of the way & enables an essential button to regain windowed mode if desired so
function toggleBars(state) {
    let _header = $("#header");
    let _footer = $("#footer");
    let _btn = $("#f-button");
    switch (state) {
        case true:

            // Header
            _header.css("transform", "translateY(-70px)");

            // Footer
            _footer.css("transform", "translateY(70px)");

            // Back to windowed mode - button
            _btn.removeAttr("hidden");
            _btn.css("transition", 'translateX("100px")');

            // Resize canvas
            resizeCanvas();
            break;

        case false:
            // Header
            _header.css("transform", "translateY(0px)");

            // Footer
            _footer.css("transform", "translateY(0px)");

            // Back to windowed mode - button 
            _btn.attr("hidden", "hidden");
            _btn.css("transition", 'translateX("-100px")');

            // Resize canvas
            resizeCanvas();
            break;

    }
}