import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// D3.js Petri Net Background Animation
let svg, stars = [], drawing = true;
let resizeTimer;

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,           // Whether animation is enabled
  starCount: 50,           // Number of nodes
  fps: 60,                 // Animation frames per second
  connectionDistance: 150, // Maximum distance for connections
  mouseInteraction: true,  // Enable mouse interaction
  clusterEffect: true,     // Group nodes in clusters
  pulsingEffect: true,     // Enable the pulsing animation 
  opacity: 1,              // Overall opacity of the animation
  speedFactor: 1,          // Animation speed multiplier
  performanceMode: false   // Reduced effects for low-end devices
};

// Settings that can be customized via localStorage
let config = { ...DEFAULT_CONFIG };
const mouse = { x: 0, y: 0 };

// Load configuration from localStorage
function loadConfig() {
  const storedConfig = localStorage.getItem('petriNetConfig');
  if (storedConfig) {
    try {
      const parsedConfig = JSON.parse(storedConfig);
      config = { ...DEFAULT_CONFIG, ...parsedConfig };
    } catch (e) {
      console.error("Error parsing stored configuration", e);
      config = { ...DEFAULT_CONFIG };
    }
  } else {
    // Legacy support for older localStorage variables
    if (localStorage.getItem('bgStarCount')) {
      config.starCount = parseInt(localStorage.getItem('bgStarCount'));
    }
    if (localStorage.getItem('canvasAnimation') !== null) {
      config.enabled = localStorage.getItem('canvasAnimation') === "true";
    }
  }
}

// Save configuration to localStorage
function saveConfig() {
  localStorage.setItem('petriNetConfig', JSON.stringify(config));
  
  // Also update legacy values for backward compatibility
  localStorage.setItem('bgStarCount', config.starCount);
  localStorage.setItem('canvasAnimation', config.enabled.toString());
}

// Update a single configuration property
function updateConfig(property, value) {
  if (config.hasOwnProperty(property)) {
    config[property] = value;
    saveConfig();
    
    // Apply changes immediately
    if (property === 'enabled') {
      setCanvas(value);
    } else if (property === 'starCount') {
      createStars();
    } else if (property === 'opacity' && svg) {
      svg.style("opacity", value);
    } else if (property === 'performanceMode') {
      applyPerformanceMode();
    } else {
      // For other properties, just recreate the stars to apply changes
      if (svg) createStars();
    }
  }
}

// Apply performance mode settings
function applyPerformanceMode() {
  if (config.performanceMode) {
    // Reduce effects for better performance
    const oldStarCount = config.starCount;
    config.connectionDistance = 100;
    config.pulsingEffect = false;
    
    // Limit the star count in performance mode
    if (config.starCount > 30) {
      config.starCount = 30;
      // Recreate stars if count changed
      if (oldStarCount !== 30) {
        createStars();
      }
    }
    
    // Disable some filters and effects
    if (svg) {
      svg.selectAll(".places circle, .transitions rect")
        .style("filter", null);
      
      // Remove animations
      const style = document.querySelector('style[data-petri-net-style]');
      if (style) {
        style.textContent = `
          svg.fade-out { opacity: 0; transition: opacity 0.3s ease-out; }
          svg.fade-in { opacity: 1; transition: opacity 0.3s ease-in; }
        `;
      }
    }
  } else {
    // Re-enable full effects
    if (svg) {
      svg.selectAll(".places circle")
        .style("filter", "url(#placeGlow)");
      
      svg.selectAll(".transitions rect")
        .style("filter", "url(#transitionGlow)");
      
      // Restore animations
      updateCSSStyles();
    }
  }
}

function createCanvas(containerId) {
  // Load configuration from localStorage
  loadConfig();
  
  if (!svg) {
    // Create SVG with D3
    svg = d3.select(`#${containerId}`)
      .append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("opacity", config.enabled ? config.opacity : 0)
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
    const transitionGradient = defs.append("linearGradient")
      .attr("id", "transitionGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    transitionGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(94, 255, 0, 0.8)");
      
    transitionGradient.append("stop")
      .attr("offset", "40%")
      .attr("stop-color", "rgba(111, 255, 0, 0.6)");
    
    transitionGradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "rgba(94, 255, 0, 0.4)");
      
    transitionGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(111, 255, 0, 0.2)");
    
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
    
    // Add CSS styles
    updateCSSStyles();
    
    // Initialize
    if (config.enabled) {
      createStars();
      
      // Ensure mouse event works with both D3 v5 and v6+
      if (config.mouseInteraction) {
        try {
          // D3 v6+ approach
          d3.select("body").on("mousemove", (event) => {
            onMouseMove(event);
          });
        } catch (e) {
          // Fallback to D3 v5 approach
          d3.select("body").on("mousemove", onMouseMove);
        }
      }
      
      // Fade in animation
      svg.transition()
        .duration(1000)
        .style("opacity", config.opacity);
        
      // Apply performance mode if enabled
      if (config.performanceMode) {
        applyPerformanceMode();
      }
      
      tick();
    }
  } else {
    setCanvas(config.enabled);
  }
}

function updateCSSStyles() {
  // Remove any existing style element
  const existingStyle = document.querySelector('style[data-petri-net-style]');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create a new style element
  const style = document.createElement('style');
  style.setAttribute('data-petri-net-style', 'true');
  
  let pulseAnimation = '';
  if (config.pulsingEffect) {
    pulseAnimation = `
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
    `;
  }
  
  style.textContent = `
    svg.fade-out { opacity: 0; transition: opacity 0.3s ease-out; }
    svg.fade-in { opacity: 1; transition: opacity 0.3s ease-in; }
    
    ${pulseAnimation}
    
    .connections line {
      transition: stroke 0.3s, stroke-width 0.3s;
    }
  `;
  
  document.head.appendChild(style);
}

function createStars() {
  stars = [];
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));
  const sizeMultiplier = 7;
  
  // Create clusters of nodes for more interesting patterns
  let clusterCenters = [];
  const numClusters = config.clusterEffect ? 4 : 0;
  
  // Create some cluster centers
  for (let i = 0; i < numClusters; i++) {
    clusterCenters.push({
      x: Math.random() * width * 0.8 + width * 0.1, // Avoid extreme edges
      y: Math.random() * height * 0.8 + height * 0.1
    });
  }
  
  for (let i = 0; i < config.starCount; i++) {
    // Every 4th node is a transition (rectangle)
    const isTransition = i % 4 === 0;
    
    // Vary node sizes with slightly larger contrast
    const baseRadius = isTransition ? 
      Math.random() * sizeMultiplier + 1 :  // Smaller for transitions
      Math.random() * sizeMultiplier + 2;   // Larger for places
    
    // Determine if this star will be in a cluster (70% chance)
    const inCluster = config.clusterEffect && Math.random() < 0.7;
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
      vx: (Math.random() * 50 - 25) * speedVariety * config.speedFactor,
      vy: (Math.random() * 50 - 25) * speedVariety * config.speedFactor,
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
    .style("filter", config.performanceMode ? null : "url(#placeGlow)")
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
    .style("filter", config.performanceMode ? null : "url(#transitionGlow)")
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
  if (config.mouseInteraction) {
    stars.forEach((star, i) => {
      const distToMouse = distance(mouse, star);
      if (distToMouse < config.connectionDistance) {
        connections.push({
          id: `mouse-${i}`,
          source: star,
          target: mouse,
          distance: distToMouse,
          opacity: 1 - (distToMouse / config.connectionDistance) * 0.2,
          color: "rgba(0, 95, 122, " + ((1 - (distToMouse / config.connectionDistance)) * 0.2) + ")",
          width: 0.5 * (1 - distToMouse / config.connectionDistance),
          isMouseConnection: true
        });
      }
    });
  }
  
  // Add node-to-node connections
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dist = distance(stars[i], stars[j]);
      if (dist < config.connectionDistance) {
        const opacity = 1 - (dist / config.connectionDistance);
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
    s.x += (s.vx / config.fps) * speedFactor;
    s.y += (s.vy / config.fps) * speedFactor;
    
    // Enhanced pulsing radius effect with personalized parameters
    if (config.pulsingEffect) {
      s.radius = s.baseRadius + Math.sin(Date.now() * s.pulseSpeed + s.id) * 
                (s.isTransition ? 0.3 * s.pulseFactor : 0.5 * s.pulseFactor);
    } else {
      s.radius = s.baseRadius;
    }
    
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
  }
}

function setCanvas(status) {
  if (status) {
    config.enabled = true;
    saveConfig();
    
    if (!drawing) {
      drawing = true;
      svg.style("opacity", config.opacity);
      createStars(); // Recreate stars if needed
      tick();
    }
  } else {
    config.enabled = false;
    saveConfig();
    
    drawing = false;
    svg.style("opacity", 0);
  }
}

function tick() {
  if (drawing && config.enabled) {
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

// Handle window resize
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 200);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  createCanvas("body");
});

// Expose configuration functions for external use (settings page)
window.petriNetAnimation = {
  // Update a specific setting
  updateSetting: function(setting, value) {
    updateConfig(setting, value);
  },
  
  // Get current configuration
  getConfig: function() {
    return {...config};
  },
  
  // Reset to default configuration
  resetConfig: function() {
    config = {...DEFAULT_CONFIG};
    saveConfig();
    if (svg) {
      setCanvas(config.enabled);
      createStars();
    }
    return {...config};
  },
  
  // Toggle animation on/off
  toggle: function() {
    const newStatus = !config.enabled;
    setCanvas(newStatus);
    return newStatus;
  },
  
  // Enable performance mode
  enablePerformanceMode: function() {
    updateConfig('performanceMode', true);
    return true;
  },
  
  // Set star count
  setStarCount: function(count) {
    updateConfig('starCount', parseInt(count));
    return count;
  }
};

// For compatibility with existing code
function createStarsWithCount(count) {
  updateConfig('starCount', count);
  return count;
}