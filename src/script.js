 // Initial setup for canvas and context
 const etch = document.getElementById('etch');
 const ctx = etch.getContext('2d');
 ctx.fillStyle = 'rgba(201,201,201,0.1)';

 // Initial state variables
 let radius = 20;
 let angle = 0;
 let rot = 0;
 let knobs = false;
 let x = 0, y = 0, vx = 0, vy = 0, px = 0, py = 0;
 let held = false;
 const keys = [];

 // Initialize keys array with default false values
 [37, 38, 39, 40, 88, 90].forEach(key => keys[key] = false);

 // Keydown event handler
 document.onkeydown = function(e) {
     keys[e.keyCode] = true;
     if (e.keyCode === 38 || e.keyCode === 40) return false;
 };

 // Keyup event handler
 document.onkeyup = function(e) {
     keys[e.keyCode] = false;
 };

 // Main drawing function
 function draw() {
     ctx.beginPath();
     ctx.moveTo(232 + radius * Math.cos(angle), 232 + radius * Math.sin(angle));
     
     // Update angle and radius based on knob or key inputs
     if (knobs) {
         angle = knobs[0] / 10;
         radius = knobs[1] * 6;
     }
     angle += (keys[39] - keys[37]) / Math.sqrt(radius) / 10;
     radius = Math.min(154, Math.max(1, radius + keys[38] - keys[40]));

     if (knobs) {
         knobs[1] = radius / 6;
     }
     
     ctx.lineTo(232 + radius * Math.cos(angle), 232 + radius * Math.sin(angle));
     ctx.stroke();

     // Update position and velocity if not held
     if (!held) {
         vx -= vx / 5 + x / 10;
         vy -= vy / 5 + y / 10;
         x += vx;
         y += vy;
     }

     // Update canvas position and rotation
     etch.style.left = Math.round(x) + "px";
     etch.style.top = Math.round(y) + "px";
     etch.style.transform = 'rotate(' + (rot += (keys[88] - keys[90]) * 5) + 'deg)';

     // Clear canvas if position changed significantly
     if (Math.abs(px - x) + Math.abs(py - y) > 10) {
         ctx.beginPath();
         ctx.arc(232, 232, 155, 0, 2 * Math.PI);
         ctx.fill();
     }

     // Store previous position
     px = x;
     py = y;

     // Request next frame
     requestAnimationFrame(draw);
 }

 // Load the etch-a-sketch image
 const img = new Image();
 img.src = "https://raw.githubusercontent.com/QC20/non-cartesian-etch-a-sketch/057926b13d3962f396d204209dc39b16b10abe2a/RoundEtchASketch.png";
 img.onload = function() {
     ctx.drawImage(img, 0, 0, 464, 464);
     document.getElementById('plc').style.display = 'none';
     etch.style.display = 'block';

     // Mouse event handlers for dragging
     etch.onmousedown = function(e) {
         held = true;
         const dx = x, dy = y, mx = e.clientX, my = e.clientY;
         document.onmousemove = function(e) {
             x = dx + e.clientX - mx;
             y = dy + e.clientY - my;
         };
         document.onmouseup = function() {
             document.onmousemove = null;
             document.onmouseup = null;
             held = false;
             vx = x - px;
             vy = y - py;
         };
     };

     // Start the drawing loop
     requestAnimationFrame(draw);
 };

 // Mobile / touch support
 const touches = [];

 function knobAngle(x, y, rknob) {
     if (rknob) x -= 400;
     else x -= 69;
     return Math.atan2(y - 391, x);
 }

 // Touch start event handler
 etch.addEventListener("touchstart", function(e) {
     if (!knobs) {
         knobs = [0, 3];
         angle = knobs[0] / 10;
         radius = knobs[1] * 6;
     }
     for (let i = e.changedTouches.length; i--;) {
         const r = (e.changedTouches[i].pageX - etch.offsetLeft > 232);
         touches[e.changedTouches[i].identifier] = {
             "radius": r,
             "oldAngle": knobAngle(e.changedTouches[i].pageX - etch.offsetLeft, e.touches[0].pageY - etch.offsetTop, r)
         };
     }
     e.preventDefault();
 }, true);

 // Touch move event handler
 etch.addEventListener("touchmove", function(e) {
     for (let i = e.touches.length; i--;) {
         const t = touches[e.touches[i].identifier];
         const a = knobAngle(e.touches[i].pageX - etch.offsetLeft, e.touches[i].pageY - etch.offsetTop, t.radius);
         if (a - t.oldAngle < -Math.PI) t.oldAngle -= 2 * Math.PI;
         if (a - t.oldAngle > Math.PI) t.oldAngle += 2 * Math.PI;
         knobs[t.radius * 1] += a - t.oldAngle;
         t.oldAngle = a;
     }
 }, true);

 // Device motion event handler for shake detection
 if (window.DeviceMotionEvent) {
     window.addEventListener('devicemotion', function(e) {
         if (pythag(e.accelerationIncludingGravity) > 14 || pythag(e.acceleration) > 4) {
             ctx.beginPath();
             ctx.arc(232, 232, 155, 0, 2 * Math.PI);
             ctx.fill();
         }
     }, false);
 }

 // Pythagorean theorem helper function
 function pythag(a) {
     return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
 }