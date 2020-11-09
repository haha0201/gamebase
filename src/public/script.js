/*
You have a trail that follows you around
When you collect objects on the map, the trail gets that object.
Objects that are following you can do whatever, shoot, block, etc
Maximum of 1 objects following you.
click Space to place down the object.
it slowly breaks like turr.io ig

when you are carrying an object, it takes time for you to be able to place it.
if you clcik Space prematurely, it will be deleted


Or maybe just a remake of Pounce? idk
Some sorta interesting thing
*/
const server = {
  tick: 12, //ServerTick, updates automatically
  x: NaN, //ArenaX
  y: NaN //ArenaY
}
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

let afr;
const players = {};
const controller = new Controller()
let selfId = "";
CanvasRenderingContext2D.prototype.textSize = function(size){
  ctx.font = `${size}px 'Ubuntu'`;
}
class Player{
  constructor(initPack){
    this.x = initPack.x;
    this.y = initPack.y;
    this.size = initPack.size;
    this.name = initPack.name;
    this.id = initPack.id;
    this.chatTime = initPack.chatTime;
    this.chatValue = initPack.chatValue;
    players[ this.id ] = this;
    this.serverX = this.x;
    this.serverY = this.y;
    this.middleStateX = this.x;
    this.middleStateY = this.y;
  }
  updatePack(updatePack){
    if (updatePack.x){
    this.serverX = updatePack.x;
    }
    if (updatePack.y){
    this.serverY = updatePack.y;
    }
    this.chatTime = updatePack.chatTime;
    this.chatValue = updatePack.chatValue;
  }
  interpPlayer(delta){
    if ( delta <= 1 / server.tick){
      this.x = lerp(this.x, this.serverX, delta*server.tick)
      this.y = lerp(this.y, this.serverY, delta*server.tick)
      this.middleStateX = lerp(this.middleStateX, this.serverX, delta*server.tick)
      this.middleStateY = lerp(this.middleStateY, this.serverY, delta*server.tick)
    }
    
  }
  render(self, delta){
    this.interpPlayer(delta);
    const x = this.x-self.x+800;
    const y = this.y-self.y+450;
    ctx.beginPath();
    ctx.fillStyle = "rgb(50, 50, 50)"
    ctx.arc(x, y, this.size, 0, Math.PI*2)
    ctx.fill();

    ctx.textSize(30);
    ctx.fillText(this.name, x, y-this.size-15)

    
    ctx.font = "20px Verdana, Geneva, sans-serif";
		ctx.fillStyle = `rgb(50, 50, 50, ${this.chatTime*2.5})`;
		const width = ctx.measureText( this.chatValue ).width;
		ctx.fillRect(
				Math.round( x - width / 2 - 3 ),
				Math.round( y - 98 ),
				Math.round( ( width * 2 ) / 2 + 6 ),
				25
			);
		ctx.fillStyle = `rgb(200, 200, 200, ${this.chatTime*4})`;
	  ctx.fillText(this.chatValue, x, Math.round( y - this.size - 50));



    
  }
}
const ws = new WebSocket("wss://idk.haha0201.repl.co")
ws.binaryType = "arraybuffer";
const canvas = document.getElementById("canvas");
//document.body.appendChild(canvas)
const ctx = canvas.getContext("2d");
const chatBox = document.getElementById( "chatBox" );
const chatHolder = document.getElementById( "chatHolder" );
let scale;
let mouseX = 1;
let mouseY = 1;
let winX = 0;
let winY = 0;
let leftBorder = 0;
let topBorder = 0;
let windowWidth = 0;
let windowHeight = 0;
let chatLock = false;


let lastTime = Date.now();
let currentTime = Date.now();
let delta = 0;
function resize() {
  ctx.textAlign = "center"
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  scale = window.innerWidth / canvas.width;
  if (window.innerHeight / canvas.height < window.innerWidth / canvas.width) {
    scale = window.innerHeight / canvas.height;
  }
  leftBorder = windowWidth - canvas.width / 2;
  topBorder = windowHeight - canvas.height / 2;
  canvas.style.transform = "scale(" + scale + ")";
  canvas.style.left = (1 / 2) * (windowWidth - canvas.width) + "px";
  canvas.style.top = (1 / 2) * (windowHeight - canvas.height) + "px";
}
resize();
window.onload = function () {
  window.addEventListener("resize", resize);
  canvas.addEventListener("mousemove", (e) => {
    mouseX = Math.round(e.pageX / scale - leftBorder / scale);
    mouseY = Math.round(e.pageY / scale - topBorder / scale);
  });

  resize();
};
document.onkeydown = function(e){
  controller.keys[e.keyCode] =  true;
}
document.onkeyup = function(e){
  controller.keys[e.keyCode] = false;
}


function getBorders() {
  let stuff = windowHeight / windowWidth;

  let realWindowWidth = windowWidth;
  let realWindowHeight = windowHeight;
  if (stuff > 9 / 16) {
    realWindowHeight = (windowWidth * 9) / 16;
  }
  if (stuff < 9 / 16) {
    realWindowWidth = (windowHeight * 16) / 9;
  }

  let changeX = Math.abs(realWindowWidth - windowWidth);
  let changeY = Math.abs(realWindowHeight - windowHeight);

  leftBorder = changeX / 2;
  topBorder = changeY / 2;
}


function render(dt){
  const self = players[selfId];
  ctx.clearRect(0, 0, 1600, 900)
  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, 1600, 900)
  if (selfId){
    //Update
    ctx.fillStyle = `rgb(200, 200, 200)`
    ctx.fillRect(-self.x+800, -self.y+450, server.x, server.y)

    for(let i of Object.keys(players)){
      const player = players[i];
      player.render(self, dt);
    }
  }
}
function negative(e){
  return !e;
}
function updateKeys(dt){
  if (selfId){
    const keys = [false, false, false, false];
    if (controller.up){
      keys[0] = true;
    }
    if (controller.right){
      keys[1] = true;
    }
    if (controller.down){
      keys[2] = true;
    }
    if (controller.left){
      keys[3] = true;
    }
    if (document.activeElement !== chatBox){
      const peyloade = {
        type: "keys",
        data: keys
      }
      ws.send(JSON.stringify(peyloade));
    }
    
    
  }
  if (!controller.enter){
    chatLock = false;
  }
  if (controller.enter && document.activeElement === chatBox && chatLock == false){
    if (chatBox.value.length > 0){
      const peyloade = {
        type: "chat",
        data: chatBox.value
      }
      ws.send(JSON.stringify(peyloade));
    }
    chatHolder.style.display = "none";
    chatBox.value = "";
  }
  if (controller.enter && chatLock == false && document.activeElement !== chatBox){
    chatHolder.style.display = "block";
    chatBox.focus();
  }
  

  if (controller.enter){
    chatLock = true;
  }

  

}

function mainLoop(time){
  const delta = ( time - lastTime ) / 1000;
	lastTime = time;

  getBorders();
  /*
  currentTime = Date.now();
  delta = currentTime-lastTime;
  lastTime = currentTime;
  */
  render(delta);
  updateKeys(delta);
  afr = window.requestAnimationFrame(mainLoop);
}
afr = window.requestAnimationFrame(mainLoop)

ws.addEventListener("message", ( datas ) => {
	const msg = msgpack.decode(new Uint8Array( datas.data))
  if (msg.type === "init"){
    if ( msg.selfId ) {
			selfId = msg.selfId;
		}
    if ( msg.config ){
      server.tick = msg.config.tick;
      server.x = msg.config.x;
      server.y = msg.config.y;
    }
    if ( msg.datas ){
      if (msg.datas.player && msg.datas.player.length > 0 ){
        for (let data of msg.datas.player) {
				  new Player(data);
			  }
      }
    }
  }
  else if (msg.type === "update"){
    if (msg.datas.player && msg.datas.player.length > 0){
      for (let data of msg.datas.player){
        const player = players[data.id];
        if (player){
          player.updatePack(data)
        }
      }
    }
  }
  else if ( msg.type === "remove" ) {
    if (msg.datas.player && msg.datas.player.length > 0){
		  for ( let data of msg.datas.player ) {
			  delete players[data];
	    }
    }
  }
});
function lerp( start, end, time ) {
	return start * ( 1 - time ) + end * time;
}