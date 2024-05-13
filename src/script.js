etch=document.getElementById('etch');
ctx=etch.getContext('2d');
ctx.fillStyle='rgba(201,201,201,0.1)';
radius = 20;
angle = 0;
rot=0;
knobs=false;

x=y=vx=vy=px=py=0; held=false;

keys=[];keys[37]=keys[38]=keys[39]=keys[40]=keys[88]=keys[90]=0;
document.onkeydown=function(e){keys[e.keyCode]=true; if(e.keyCode==38||e.keyCode==40)return false;}
document.onkeyup=function(e){keys[e.keyCode]=false;}

function draw(){
  ctx.beginPath();
  ctx.moveTo(232+radius*Math.cos(angle),232+radius*Math.sin(angle));
  if (knobs){angle=knobs[0]/10;radius=knobs[1]*6;}
  angle +=(keys[39]-keys[37])/Math.sqrt(radius)/10;
  radius=Math.min(154,Math.max(1,radius+keys[38]-keys[40]));
  if (knobs){knobs[1]=radius/6;}
  ctx.lineTo(232+radius*Math.cos(angle),232+radius*Math.sin(angle));
  ctx.stroke();


  
  if (!held){
    vx-=vx/5+x/10;
    vy-=vy/5+y/10;
    x+=vx;y+=vy;
  }
  etch.style.left=Math.round(x)+"px";
  etch.style.top =Math.round(y)+"px";
  
  etch.style.transform='rotate('+(rot+=(keys[88]-keys[90])*5)+'deg)';
  
  if (Math.abs(px-x)+Math.abs(py-y)>10) {ctx.beginPath();ctx.arc(232,232,155,0,6.283185307179586);ctx.fill();} px=x;py=y;
  requestAnimationFrame(draw);
}


(img=new Image()).src="https://raw.githubusercontent.com/QC20/non-cartesian-etch-a-sketch/057926b13d3962f396d204209dc39b16b10abe2a/RoundEtchASketch.png";
img.onload=function(){
  ctx.drawImage(img,0,0,464,464);
  document.getElementById('plc').style.display='none';
  etch.style.display='block';
  
  etch.onmousedown=function(e){
    held=true;
    dx=x;dy=y;
    mx=e.clientX; my=e.clientY;
    document.onmousemove=function(e){
      x=dx+e.clientX-mx;
      y=dy+e.clientY-my;
    }
    document.onmouseup=function(e){
      document.onmousemove = null;
      document.onmouseup = null;
      held=false;
      vx=x-px; vy=y-py;
    }
  }
  
  requestAnimationFrame(draw);
}




//Mobile / touch support
touches=[];
function knobAngle(x, y, rknob){
  if (rknob) x-=400; else x-=69;
  return Math.atan2(y-391,x);
}
etch.addEventListener("touchstart",function(e){
  if (!knobs) {knobs=[0,3];angle=knobs[0]/10;radius=knobs[1]*6;};
  for (var i =e.changedTouches.length;i--;){
    var r=(e.changedTouches[i].pageX-etch.offsetLeft >232);
    touches[e.changedTouches[i].identifier]={
	  "radius": r,
	  "oldAngle": knobAngle(e.changedTouches[i].pageX-etch.offsetLeft, e.touches[0].pageY-etch.offsetTop, r)
	}
  }
  e.preventDefault();

},true);

etch.addEventListener("touchmove",function(e){
  for (var i=e.touches.length;i--;){
    var t=touches[e.touches[i].identifier];
    var a = knobAngle(e.touches[i].pageX-etch.offsetLeft, e.touches[i].pageY-etch.offsetTop, t.radius);
	if (a-t.oldAngle < -3.141592653589793) t.oldAngle-=6.283185307179586;
	if (a-t.oldAngle >  3.141592653589793) t.oldAngle+=6.283185307179586;
    knobs[t.radius*1]+=a-t.oldAngle;
    t.oldAngle=a;
  }
},true);

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', function(e){
    if (pythag(e.accelerationIncludingGravity)>14 || pythag(e.acceleration)>4) {
      ctx.beginPath();ctx.arc(232,232,155,0,6.283185307179586);ctx.fill();
	}
  }, false);
}
function pythag(a){return Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);}