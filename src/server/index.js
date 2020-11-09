/*
const fs = require("fs")
fs.unlink("index.js", ()=>{})
*/
/*
shift ctrl S in console
*/

const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const msgpack = require("msgpack-lite");
const path = require("path");
const app = express();
const wss = new WebSocket.Server({ noServer: true });
console.log("Game Started")

const serverTick = 35;
const arenaX = 1000;
const arenaY = 1000;

let currentTime = 0;
let lastTime = Date.now();

const players = {};
const clients = {};
const initPack = {player: []};
const removePack = {player: []};
const Player = require("./objects/player");

app.use(express.static("src/public"));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

wss.on("connection", ws=>{
  // intiial code
  // player joins, or wait for player message first
  const clientId = uuid.v4();
  clients[clientId] = ws;
  players[clientId] = new Player(clientId);
  const player = players[clientId]

  const peyload = {
    type: "init",
    selfId: clientId,
    config: {
      tick: serverTick,
      x: arenaX,
      y: arenaY
    },
    datas: {
      player: [...Player.getAllInitPack({players})],
    }
  }
  clients[clientId].send(
    msgpack.encode(
      peyload
    )
  );
  initPack.player.push(
    players[clientId].getInitPack()
  );
	ws.on("message",(data)=>{
		const msg = JSON.parse(data)

    if (msg.type === "keys"){
      const valueData = msg.data;
      if (valueData[0]){
        player.velY = -player.maxVel;
      }
      if (valueData[1]){
        player.velX = player.maxVel;
      }
      if (valueData[2]){
        player.velY = player.maxVel;
      }
      if (valueData[3]){
        player.velX = -player.maxVel;
      }
    }
    if (msg.type === "chat"){
      const valueData = msg.data;
      player.chatValue = msg.data;
      player.chatTime = 3;
    }

    /*
		return new Promise((resolve, reject)=>{
			
		})
    */
	})
	ws.on('close',()=>{
    delete players[clientId];
    removePack.player.push(clientId);
		//when player leaves
	})
})


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});


function updateGameState(clients, players){
  let delta = (Date.now() - lastTime)/1000;
  lastTime = Date.now();
	currentTime += delta;

  Player.collision({ playerArray: Object.entries({ ...players }), players });
  
  let pack = Player.pack({players, delta, arenaX, arenaY});

  for(let i of Object.keys(clients)){
    const clientSocket = clients[i];
    if (clientSocket.readyState === WebSocket.OPEN) {
      //Update
      clientSocket.send(
			  msgpack.encode({
				  type: "update",
				  datas: {player: pack},
			  })
      ); 
    }
    if (removePack.player.length > 0) {
      //Remove
      clientSocket.send(
        msgpack.encode({
          type: "remove",
          datas: removePack
        })
      );
    }
    if (initPack.player.length > 0) {
      //Remove
      clientSocket.send(
        msgpack.encode({
          type: "init",
          datas: initPack
        })
      );
    }
    
  }
  //Reset Packs
  initPack.player = [];
  removePack.player = [];
}

setInterval(() => {
  updateGameState(clients, players);
}, 1000 / serverTick);
