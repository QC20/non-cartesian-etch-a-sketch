// Get the canvas element and its 2D rendering context
etch = document.getElementById('etch');
ctx = etch.getContext('2d');

// Set initial properties
ctx.fillStyle = 'rgba(201,201,201,0.1)';
radius = 20;
angle = 0;
rot = 0;
knobs = false;

// Set initial position and velocity variables
let x = 0;
let y = 0;
let vx = 0;
let vy = 0;
let px = 0;
let py = 0;
let held = false;


// Set up key event listeners
const keys = {
  37: false, // Left arrow key
  38: false, // Up arrow key
  39: false, // Right arrow key
  40: false, // Down arrow key
  88: false, // Key 'X'
  90: false, // Key 'Z'
};
document.addEventListener('keydown', function(e) {
  if (e.keyCode in keys && (e.keyCode === 38 || e.keyCode === 40)) {
    e.preventDefault();
  }
  keys[e.keyCode] = true;
});

document.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
});

// Function to draw on the canvas
function draw() {
  // Start drawing a path
  ctx.beginPath();
  // Move to a starting point
  ctx.moveTo(232 + radius * Math.cos(angle), 232 + radius * Math.sin(angle));

  // Adjust angle and radius if knobs are turned
  if (knobs) {
    angle = knobs[0] / Math.TAU;
    radius = knobs[1] * 6;
  }

  // Adjust angle and radius based on keyboard input
  angle += (keys[39] - keys[37]) / Math.sqrt(radius) / 10;
  radius = Math.min(154, Math.max(1, radius + keys[38] - keys[40]));

  // Update knob radius if applicable
  if (knobs) {
    knobs[1] = radius / 6;
  }

  // Draw a line to a new point
  ctx.lineTo(232 + radius * Math.cos(angle), 232 + radius * Math.sin(angle));
  ctx.stroke();

  // Update position and velocity
  if (!held) {
    vx -= vx / 5 + x / 10;
    vy -= vy / 5 + y / 10;
    x += vx;
    y += vy;
  }

  // Update the position of the canvas element
  etch.style.left = Math.round(x) + "px";
  etch.style.top = Math.round(y) + "px";

  // Rotate the canvas element
  etch.style.transform = 'rotate(' + (rot += (keys[88] - keys[90]) * 5) + 'deg)';

  // Check if the position has changed significantly and fill a circle if so
  if (Math.abs(px - x) + Math.abs(py - y) > 10) {
    ctx.beginPath();
    ctx.arc(232, 232, 155, 0, 6.283185307179586);
    ctx.fill();
  }
  px = x;
  py = y;

  // Request animation frame for continuous drawing
  requestAnimationFrame(draw);
}

// Load an image and start drawing when it's loaded
const img = new Image();
img.src = 'https://raw.githubusercontent.com/QC20/non-cartesian-etch-a-sketch/057926b13d3962f396d204209dc39b16b10abe2a/RoundEtchASketch.png';

img.onload = function() {
  ctx.drawImage(img, 0, 0, 464, 464);
  document.getElementById('plc').style.display = 'none';
  etch.style.display = 'block';

  // Event listener for mouse interaction
  etch.onmousedown = function(e) {
    held = true;
    dx = x;
    dy = y;
    mx = e.clientX;
    my = e.clientY;
    document.onmousemove = function(e) {
      x = dx + e.clientX - mx;
      y = dy + e.clientY - my;
    }
    document.onmouseup = function(e) {
      document.onmousemove = null;
      document.onmouseup = null;
      held = false;
      vx = x - px;
      vy = y - py;
    }
  }

  // Start drawing animation
  requestAnimationFrame(draw);
}

// Mobile / touch support
touches = [];

// Function to calculate knob angle
function knobAngle(x, y, rknob) {
  if (rknob) x -= 400;
  else x -= 69;
  return Math.atan2(y - 391, x);
}

// Touch event listener for touch start
etch.addEventListener("touchstart", function(e) {
  if (!knobs) {
    knobs = [0, 3];
    angle = knobs[0] / Math.TAU
    radius = knobs[1] * 6;
  };
  for (var i = e.changedTouches.length; i--;) {
    var r = (e.changedTouches[i].pageX - etch.offsetLeft > 232);
    touches[e.changedTouches[i].identifier] = {
      "radius": r,
      "oldAngle": knobAngle(e.changedTouches[i].pageX - etch.offsetLeft, e.touches[0].pageY - etch.offsetTop, r)
    }
  }
  e.preventDefault();

}, true);

// Touch event listener for touch move
etch.addEventListener("touchmove", function(e) {
  for (var i = e.touches.length; i--;) {
    var t = touches[e.touches[i].identifier];
    var a = knobAngle(e.touches[i].pageX - etch.offsetLeft, e.touches[i].pageY - etch.offsetTop, t.radius);
    if (a - t.oldAngle < Math.PI) t.oldAngle -= Math.TAU;
    if (a - t.oldAngle > Math.PI) t.oldAngle += Math.TAU;
    knobs[t.radius * 1] += a - t.oldAngle;
    t.oldAngle = a;
  }
}, true);

// Accelerometer event listener for device motion
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', function(e) {
    if (pythag(e.accelerationIncludingGravity) > 14 || pythag(e.acceleration) > 4) {
      ctx.beginPath();
      ctx.arc(232, 232, 155, 0, Math.TAU);
      ctx.fill();
    }
  }, false);
}

// Function to calculate the magnitude of acceleration
function pythag(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}
