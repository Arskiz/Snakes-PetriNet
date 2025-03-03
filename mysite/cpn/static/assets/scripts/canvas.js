var canvas, ctx, body;
var drawing = true;
var stars = [],
    FPS = 60,
    numStars,
    mouse = { x: 0, y: 0 };

function createCanvas(containerId) {
    if (!canvas && !ctx && !body) {
        canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.style.opacity = "0";
        body = document.getElementById(containerId);
        body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        let storedStars = localStorage.getItem('bgStarCount');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        numStars = storedStars ? parseInt(storedStars) : 50;
        initialize();
        $(canvas).animate({ opacity: 1 }, 1000); // Fade-in effect
    } else {
        setCanvas(true);
    }
}

function initialize() {
    if (localStorage.getItem("canvasAnimation") === "true") {
        createStars();
        body.addEventListener('mousemove', onMouseMove);
        tick();
    }
}

function createStars() {
    stars = [];
    for (var i = 0; i < numStars; i++) {
        // Determine if this will be a place (circle) or transition (rectangle) for Petri net appearance
        const isTransition = i % 4 === 0; // Every 4th node is a transition (rectangle)
        
        // Vary the node sizes - places are slightly larger than transitions
        const baseRadius = isTransition ? 
            Math.random() * 1 + 1 :  // Smaller for transitions
            Math.random() * 2 + 1.5; // Larger for places
        
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: baseRadius,
            baseRadius: baseRadius, // Store base radius for animation
            vx: Math.floor(Math.random() * 50) - 25,
            vy: Math.floor(Math.random() * 50) - 25,
            isTransition: isTransition
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    // First, draw the connections between nodes
    drawConnections();
    
    // Then draw the nodes on top
    drawNodes();
}

function drawNodes() {
    for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        
        // Calculate pulsing effect - different for places and transitions
        s.radius = s.baseRadius + Math.sin(Date.now() * 0.002 + i) * (s.isTransition ? 0.3 : 0.5);
        
        // Different styling for places (circles) and transitions (rectangles)
        if (!s.isTransition) {
            // Places (circles) - blue theme
            ctx.fillStyle = "rgba(0, 95, 122, 0.25)";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(0, 95, 122, 0.3)";
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add a subtle ring to places (characteristic of Petri net places)
            ctx.strokeStyle = "rgba(0, 95, 122, 0.4)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
        } else {
            // Transitions (rectangles) - green theme
            ctx.fillStyle = "rgba(81, 101, 64, 0.25)";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(81, 101, 64, 0.3)";
            
            // Draw a rectangle
            const width = s.radius * 3;
            const height = s.radius * 1.5;
            ctx.fillRect(s.x - width/2, s.y - height/2, width, height);
            
            // Add a subtle border
            ctx.strokeStyle = "rgba(81, 101, 64, 0.4)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(s.x - width/2, s.y - height/2, width, height);
        }
        
        // Reset shadow for next elements
        ctx.shadowBlur = 0;
    }
}

function drawConnections() {
    ctx.beginPath();
    
    // Draw lines between nearby nodes with variable opacity based on distance
    for (var i = 0; i < stars.length; i++) {
        var starI = stars[i];
        
        // Connect to mouse if nearby
        const distToMouse = distance(mouse, starI);
        if (distToMouse < 150) {
            const opacity = 1 - (distToMouse / 150);
            ctx.strokeStyle = `rgba(0, 95, 122, ${opacity * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(starI.x, starI.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        
        // Connect to other nearby nodes
        for (var j = i + 1; j < stars.length; j++) {
            var starJ = stars[j];
            const dist = distance(starI, starJ);
            
            if (dist < 150) {
                // Make line opacity based on distance
                const opacity = 1 - (dist / 150);
                
                // Different color for different connection types
                // Place to transition connections are one color
                // Place to place or transition to transition are another
                if (starI.isTransition !== starJ.isTransition) {
                    // Place to transition - more visible
                    ctx.strokeStyle = `rgba(0, 95, 122, ${opacity * 0.3})`;
                } else {
                    // Same type connections - less visible
                    ctx.strokeStyle = `rgba(150, 150, 150, ${opacity * 0.1})`;
                }
                
                ctx.beginPath();
                ctx.moveTo(starI.x, starI.y);
                ctx.lineTo(starJ.x, starJ.y);
                ctx.lineWidth = 0.5 * opacity; // Thinner lines for distant connections
                ctx.stroke();
            }
        }
    }
}

function update() {
    for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        
        // Slower movement for transitions, faster for places
        const speedFactor = s.isTransition ? 0.7 : 1;
        
        s.x += (s.vx / FPS) * speedFactor;
        s.y += (s.vy / FPS) * speedFactor;
        
        // Bounce off edges
        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
    }
}

function distance(point1, point2) {
    var xs = point2.x - point1.x;
    xs *= xs;
    var ys = point2.y - point1.y;
    ys *= ys;
    return Math.sqrt(xs + ys);
}

function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function setCanvas(status) {
    if (status) {
        if (!drawing) {
            drawing = true;
            tick();
        }
    } else {
        drawing = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function tick() {
    if (drawing) {
        draw();
        update();
        requestAnimationFrame(tick);
    }
}

// Resize handling using jQuery
let timer = null;
$(window).on('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
        // Add a CSS transition class
        $(canvas).addClass('fade-out');
        
        // After a short delay, resize and redraw
        setTimeout(function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createStars(); // Recreate stars so they fit the new canvas size
            draw();
            
            // Remove fade-out and add fade-in
            $(canvas).removeClass('fade-out').addClass('fade-in');
            
            // Clean up fade-in class after animation completes
            setTimeout(function() {
                $(canvas).removeClass('fade-in');
            }, 200);
        }, 200);
    }, 200); // Runs after user stops resizing
});

// To create a new canvas and start the animation
createCanvas("body");