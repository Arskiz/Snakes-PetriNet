// Execute when DOM is ready
$(document).ready(function() {
    let fileLength = 25;
    const filename = getQueryParam("file");
    if (filename) {
        // Log values to debug
        console.log("Filename from query:", filename);
        console.log("Petri filename element:", $("#petri-filename").length);
        console.log("Petri filename text before:", $("#petri-filename").text());
        
        const decodedFilename = decodeURIComponent(filename);
        const truncatedFilename = decodedFilename.length > fileLength 
            ? '...' + decodedFilename.slice(-fileLength)
            : decodedFilename;
        $("#petri-filename").text(truncatedFilename);
        
        // Log text after setting
        console.log("Petri filename text after:", $("#petri-filename").text());
    } else {
        console.log("No filename in query parameters");
    }
});

// Function to get param from the url-string
function getQueryParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const value = urlParams.get(param);
    return value ? decodeURIComponent(value) : null;
}
