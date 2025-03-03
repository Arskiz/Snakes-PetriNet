import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// D3.js Petri Net Background Animation
let svg, stars = [], numStars, drawing = true;
const FPS = 60;
const mouse = { x: 0, y: 0 };

function createCanvas(containerId) {
  if (!svg) {
    // Get stored star count or use default
    let storedStars = localStorage.getItem('bgStarCount');
    numStars = storedStars ? parseInt(storedStars) : 50;
    
    // Create SVG with D3
    svg = d3.select(`#${containerId}`)
      .append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("opacity", 0)
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("z-index", -1);
    
    // Add definitions for gradients and filters
    const defs = svg.append("defs");
    
    // Enhanced glow filters - separate for places and transitions
    // Place glow (blue)
    const placeGlow = defs.append("filter")
      .attr("id", "placeGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    placeGlow.append("feColorMatrix")
      .attr("type", "matrix")
      .attr("values", "0 0 0 0 0   0 0 0 0 0.5   0 0 0 0 1   0 0 0 1 0")
      .attr("result", "blue");
      
    placeGlow.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blueBlur");
    
    placeGlow.append("feComposite")
      .attr("in", "blueBlur")
      .attr("in2", "SourceGraphic")
      .attr("operator", "out")
      .attr("result", "outerglow");
      
    const placeMerge = placeGlow.append("feMerge");
    placeMerge.append("feMergeNode").attr("in", "outerglow");
    placeMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Transition glow (green)
    const transitionGlow = defs.append("filter")
      .attr("id", "transitionGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    transitionGlow.append("feColorMatrix")
      .attr("type", "matrix")
      .attr("values", "0 0 0 0 0.2   0 0 0 0 0.8   0 0 0 0 0.3   0 0 0 1 0")
      .attr("result", "green");
      
    transitionGlow.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "greenBlur");
    
    transitionGlow.append("feComposite")
      .attr("in", "greenBlur")
      .attr("in2", "SourceGraphic")
      .attr("operator", "out")
      .attr("result", "outerglow");
      
    const transitionMerge = transitionGlow.append("feMerge");
    transitionMerge.append("feMergeNode").attr("in", "outerglow");
    transitionMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Create transition gradient - enhanced with more stops
    const transitionGradient = defs.append("radialGradient")
      .attr("id", "transitionGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    transitionGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(100, 150, 70, 0.8)");
      
    transitionGradient.append("stop")
      .attr("offset", "40%")
      .attr("stop-color", "rgba(90, 130, 60, 0.6)");
    
    transitionGradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "rgba(81, 110, 64, 0.4)");
      
    transitionGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(70, 90, 55, 0.2)");
    
    // Create place gradient - enhanced with more stops
    const placeGradient = defs.append("radialGradient")
      .attr("id", "placeGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    placeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(0, 135, 175, 0.8)");
      
    placeGradient.append("stop")
      .attr("offset", "40%")
      .attr("stop-color", "rgba(0, 105, 145, 0.6)");
    
    placeGradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "rgba(0, 95, 122, 0.4)");
      
    placeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(0, 85, 110, 0.2)");
    
    // Create line group (for connections)
    svg.append("g").attr("class", "connections");
    
    // Create node groups
    svg.append("g").attr("class", "places");
    svg.append("g").attr("class", "transitions");
    
    // Initialize
    if (localStorage.getItem("canvasAnimation") === "true" || localStorage.getItem("canvasAnimation") === null) {
      createStars();
      
      // Ensure mouse event works with both D3 v5 and v6+
      try {
        // D3 v6+ approach
        d3.select("body").on("mousemove", (event) => {
          onMouseMove(event);
        });
      } catch (e) {
        // Fallback to D3 v5 approach
        d3.select("body").on("mousemove", onMouseMove);
      }
      
      // Fade in animation
      svg.transition()
        .duration(1000)
        .style("opacity", 1);
        
      tick();
    }
  } else {
    setCanvas(true);
  }
}

function createStars() {
  stars = [];
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));
  const sizeMultiplier = 7;
  
  // Create clusters of nodes for more interesting patterns
  let clusterCenters = [];
  const numClusters = 4;
  
  // Create some cluster centers
  for (let i = 0; i < numClusters; i++) {
    clusterCenters.push({
      x: Math.random() * width * 0.8 + width * 0.1, // Avoid extreme edges
      y: Math.random() * height * 0.8 + height * 0.1
    });
  }
  
  for (let i = 0; i < numStars; i++) {
    // Every 4th node is a transition (rectangle)
    const isTransition = i % 4 === 0;
    
    // Vary node sizes with slightly larger contrast
    const baseRadius = isTransition ? 
      Math.random() * sizeMultiplier + 1 :  // Smaller for transitions
      Math.random() * sizeMultiplier + 2;   // Larger for places
    
    // Determine if this star will be in a cluster (70% chance)
    const inCluster = Math.random() < 0.7;
    let x, y;
    
    if (inCluster) {
      // Pick a random cluster
      const cluster = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
      // Position near the cluster with some random scatter
      const scatter = Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      x = cluster.x + Math.cos(angle) * scatter;
      y = cluster.y + Math.sin(angle) * scatter;
      
      // Make sure it's within bounds
      x = Math.max(10, Math.min(width - 10, x));
      y = Math.max(10, Math.min(height - 10, y));
    } else {
      // Completely random position
      x = Math.random() * width;
      y = Math.random() * height;
    }
    
    // Add variety to speeds
    const speedVariety = isTransition ? 0.8 : 1.2; // Transitions move slower, places faster
    
    stars.push({
      id: i,
      x: x,
      y: y,
      radius: baseRadius,
      baseRadius: baseRadius,
      vx: (Math.random() * 50 - 25) * speedVariety,
      vy: (Math.random() * 50 - 25) * speedVariety,
      isTransition: isTransition,
      // Add some personality to nodes for more varied animation
      pulseFactor: Math.random() * 0.4 + 0.2,
      pulseSpeed: Math.random() * 0.002 + 0.001
    });
  }
  
  updateVisualization();
}

function updateVisualization() {
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));
  
  // Update places (circles)
  const places = svg.select("g.places")
    .selectAll("circle")
    .data(stars.filter(d => !d.isTransition), d => d.id);
  
  // Enter new places
  places.enter()
    .append("circle")
    .attr("r", d => d.radius)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", "url(#placeGradient)")
    .attr("stroke", "rgba(0, 95, 122, 0.4)")
    .attr("stroke-width", 0.5)
    .style("filter", "url(#placeGlow)")
    .merge(places) // Update existing
    .attr("r", d => d.radius)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
  
  // Exit old elements
  places.exit().remove();
  
  // Update transitions (rectangles)
  const transitions = svg.select("g.transitions")
    .selectAll("rect")
    .data(stars.filter(d => d.isTransition), d => d.id);
  
  // Enter new transitions
  transitions.enter()
    .append("rect")
    .attr("width", d => d.radius * 3)
    .attr("height", d => d.radius * 1.5)
    .attr("x", d => d.x - (d.radius * 3)/2)
    .attr("y", d => d.y - (d.radius * 1.5)/2)
    .attr("fill", "url(#transitionGradient)")
    .attr("stroke", "rgba(81, 101, 64, 0.4)")
    .attr("stroke-width", 0.5)
    .style("filter", "url(#transitionGlow)")
    .merge(transitions) // Update existing
    .attr("width", d => d.radius * 3)
    .attr("height", d => d.radius * 1.5)
    .attr("x", d => d.x - (d.radius * 3)/2)
    .attr("y", d => d.y - (d.radius * 1.5)/2);
  
  // Exit old transitions
  transitions.exit().remove();
  
  // Update connections
  const connections = [];
  
  // Add mouse connections
  stars.forEach((star, i) => {
    const distToMouse = distance(mouse, star);
    if (distToMouse < 150) {
      connections.push({
        id: `mouse-${i}`,
        source: star,
        target: mouse,
        distance: distToMouse,
        opacity: 1 - (distToMouse / 150) * 0.2,
        color: "rgba(0, 95, 122, " + ((1 - (distToMouse / 150)) * 0.2) + ")",
        width: 0.5 * (1 - distToMouse / 150)
      });
    }
  });
  
  // Add node-to-node connections
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dist = distance(stars[i], stars[j]);
      if (dist < 150) {
        const opacity = 1 - (dist / 150);
        let color;
        
        // Different colors based on node types
        if (stars[i].isTransition !== stars[j].isTransition) {
          // Place to transition - more visible
          color = "rgba(0, 95, 122, " + (opacity * 0.3) + ")";
        } else {
          // Same type connections - less visible
          color = "rgba(150, 150, 150, " + (opacity * 0.1) + ")";
        }
        
        connections.push({
          id: `${i}-${j}`,
          source: stars[i],
          target: stars[j],
          distance: dist,
          opacity: opacity,
          color: color,
          width: 0.5 * opacity
        });
      }
    }
  }
  
  // Create defs for line gradients if not exists
  if (!svg.select("defs").select("#connectionGradient").node()) {
    const lineGradient = svg.select("defs")
      .append("linearGradient")
      .attr("id", "connectionGradient")
      .attr("gradientUnits", "userSpaceOnUse");
      
    lineGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(0, 135, 175, 0.6)");
      
    lineGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(100, 150, 70, 0.6)");
      
    // Mouse connection gradient
    const mouseGradient = svg.select("defs")
      .append("linearGradient")
      .attr("id", "mouseConnectionGradient")
      .attr("gradientUnits", "userSpaceOnUse");
      
    mouseGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(255, 255, 255, 0.7)");
      
    mouseGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(200, 200, 255, 0.2)");
  }
  
  // Update lines with enhanced styling
  const lines = svg.select("g.connections")
    .selectAll("line")
    .data(connections, d => d.id);
  
  // Enter new lines
  const enterLines = lines.enter()
    .append("line")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
    
  // Apply different styles based on connection type
  enterLines.each(function(d) {
    const line = d3.select(this);
    
    if (d.isMouseConnection) {
      // Special styling for mouse connections
      const gradient = svg.select("#mouseConnectionGradient")
        .attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", d.target.x)
        .attr("y2", d.target.y);
        
      line.attr("stroke", "url(#mouseConnectionGradient)")
          .attr("stroke-width", d.width)
          .attr("stroke-linecap", "round")
          .attr("stroke-dasharray", "1, 2");
          
    } else if (d.source.isTransition !== d.target.isTransition) {
      // Place-transition connections use gradient
      const gradient = svg.select("#connectionGradient")
        .attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", d.target.x)
        .attr("y2", d.target.y);
        
      line.attr("stroke", "url(#connectionGradient)")
          .attr("stroke-width", d.width);
    } else {
      // Regular connections
      line.attr("stroke", d.color)
          .attr("stroke-width", d.width);
    }
  });
  
  // Update existing lines
  lines.each(function(d) {
    const line = d3.select(this);
    
    line.attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", d.target.x)
        .attr("y2", d.target.y);
        
    if (d.isMouseConnection) {
      const gradient = svg.select("#mouseConnectionGradient")
        .attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", d.target.x)
        .attr("y2", d.target.y);
        
      line.attr("stroke", "url(#mouseConnectionGradient)")
          .attr("stroke-width", d.width);
    } else if (d.source.isTransition !== d.target.isTransition) {
      const gradient = svg.select("#connectionGradient")
        .attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", d.target.x)
        .attr("y2", d.target.y);
        
      line.attr("stroke", "url(#connectionGradient)")
          .attr("stroke-width", d.width);
    } else {
      line.attr("stroke", d.color)
          .attr("stroke-width", d.width);
    }
  });
  
  // Exit old lines
  lines.exit().remove();
}

function update() {
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));
  
  stars.forEach(s => {
    // Slower movement for transitions, faster for places
    const speedFactor = s.isTransition ? 0.7 : 1;
    
    // Update position
    s.x += (s.vx / FPS) * speedFactor;
    s.y += (s.vy / FPS) * speedFactor;
    
    // Enhanced pulsing radius effect with personalized parameters
    s.radius = s.baseRadius + Math.sin(Date.now() * s.pulseSpeed + s.id) * 
              (s.isTransition ? 0.3 * s.pulseFactor : 0.5 * s.pulseFactor);
    
    // Bounce off edges
    if (s.x < 0 || s.x > width) s.vx = -s.vx;
    if (s.y < 0 || s.y > height) s.vy = -s.vy;
  });
}

function distance(point1, point2) {
  const xs = Math.pow(point2.x - point1.x, 2);
  const ys = Math.pow(point2.y - point1.y, 2);
  return Math.sqrt(xs + ys);
}

// Handle both D3 v5 and v6+ mouse events
function onMouseMove(event) {
  // For D3 v6+, the event is passed as parameter
  // For D3 v5, we need to use d3.event
  const evt = event || d3.event || window.event;
  
  if (evt) {
    mouse.x = evt.clientX || evt.pageX || 0;
    mouse.y = evt.clientY || evt.pageY || 0;
    
    // Uncomment for debugging
    // console.log("Mouse position:", mouse.x, mouse.y);
  }
}

function setCanvas(status) {
  if (status) {
    if (!drawing) {
      drawing = true;
      tick();
    }
  } else {
    drawing = false;
    // Clear by removing all elements
    svg.selectAll("*").remove();
  }
}

function tick() {
  if (drawing) {
    update();
    updateVisualization();
    requestAnimationFrame(tick);
  }
}

function resize() {
  if (svg) {
    // Add CSS transition classes
    svg.classed("fade-out", true);
    
    // After a short delay, resize and redraw
    setTimeout(() => {
      svg.attr("width", window.innerWidth)
         .attr("height", window.innerHeight);
      
      createStars(); // Recreate stars for new dimensions
      
      // Remove fade-out and add fade-in
      svg.classed("fade-out", false)
         .classed("fade-in", true);
      
      // Clean up classes after animation completes
      setTimeout(() => {
        svg.classed("fade-in", false);
      }, 200);
    }, 200);
  }
}

// Add enhanced CSS for transitions and animations
const style = document.createElement('style');
style.textContent = `
  svg.fade-out { opacity: 0; transition: opacity 0.3s ease-out; }
  svg.fade-in { opacity: 1; transition: opacity 0.3s ease-in; }
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  .places circle {
    animation: pulse 3s infinite ease-in-out;
  }
  
  .transitions rect {
    animation: pulse 4s infinite ease-in-out;
  }
  
  .connections line {
    transition: stroke 0.3s, stroke-width 0.3s;
  }
`;
document.head.appendChild(style);

// Handle window resize
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 200);
});

let resizeTimer;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  createCanvas("body");
});

// For compatibility with existing code
function createStarsWithCount(count) {
  numStars = count;
  localStorage.setItem('bgStarCount', count);
  createStars();
}