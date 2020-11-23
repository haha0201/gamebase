const Vector = require("./ulti/vector");
var randomConso = function () {
  let index = Math.round(Math.random() * 20);
  let consos = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];
  return consos[index];
};
var randomVowel = function () {
  let index = Math.round(Math.random() * 4);
  let vowels = ["a", "e", "i", "o", "u"];
  return vowels[index];
};
module.exports = class Player{
  constructor(id){
    this.id = id;
    this.name =
      randomConso().toUpperCase() +
      randomVowel() +
      randomConso() +
      randomVowel() +
      randomConso() +
      randomVowel() +
      randomConso() +
      randomVowel();
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.accX = 0;
    this.accY = 0;
    this.velX = 0;
    this.velY = 0;
    this.size = 30;
    this.maxVel = 300;
    this.friction = 0.8;
    this.movement = [false, false, false, false]

    this.chatTime = 3; // Seconds
    this.chatValue = "Hello!"
  }
  update(dt, arenaX, arenaY){  
    if (this.movement[0]){
      this.velY = -this.maxVel;
    }
    if (this.movement[1]){
      this.velX = this.maxVel;
    }
    if (this.movement[2]){
      this.velY = this.maxVel;
    }
    if (this.movement[3]){
      this.velX = -this.maxVel;
    }
    this.chatTime -= dt;

    this.x += this.velX * dt;
    this.y += this.velY * dt;
    if (this.velX > this.maxVel){
      this.velX = this.maxVel;
    }
    if (this.velX < -this.maxVel){
      this.velX = -this.maxVel;
    }
    if (this.velY > this.maxVel){
      this.velY = this.maxVel;
    }
    if (this.velY < -this.maxVel){
      this.velY = -this.maxVel;
    }
    this.velX *= Math.pow(this.friction, dt*50)
    this.velY *= Math.pow(this.friction, dt*50)
    if (this.x < this.size){
      this.velX = 0;
      this.x = this.size;
    }
    if (this.x > arenaX-this.size){
      this.velX = 0;
      this.x = arenaX-this.size;
    }
    if (this.y < this.size){
      this.velY = 0;
      this.y = this.size;
    }
    if (this.y > arenaY-this.size){
      this.velY = 0;
      this.y = arenaY-this.size;
    }
    
  }
  static pack({players, delta, arenaX, arenaY}){
    let pack = [];
    for (let i of Object.keys(players)) {
			players[i].update(delta, arenaX, arenaY);
      pack.push(players[i].getUpdatePack());
    }
    return pack;
  }
  getUpdatePack(){
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
      chatTime: this.chatTime,
      chatValue: this.chatValue,
      id: this.id
    }
  }
  getInitPack(){
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
      name: this.name,
      id: this.id,
      size: this.size,
      chatTime: this.chatTime,
      chatValue: this.chatValue
    }
  }
  static getAllInitPack({ players }) {
    var initPacks = [];
    for (let i of Object.keys(players)) {
      initPacks.push(players[i].getInitPack());
    }
    return initPacks;
  }
  static collision({ playerArray, players }) {
    for (let i = 0; i < playerArray.length; i++) {
      for (let j = i + 1; j < playerArray.length; j++) {
        let player1 = players[playerArray[i][0]];
        let player2 = players[playerArray[j][0]];
        if (
          Math.sqrt(
            Math.abs(
              Math.pow(player2.x - player1.x, 2) +
                Math.pow(player2.y - player1.y, 2)
            )
          ) < 60
        ) {
          let distance = Math.sqrt(
            Math.abs(
              Math.pow(player2.x - player1.x, 2) +
                Math.pow(player2.y - player1.y, 2)
            )
          );
          let rotate = Math.atan2(
            player2.y - player1.y,
            player2.x - player1.x
          );
          player2.x += ((Math.cos(rotate) * 1) / distance) * 110;
          player1.x -= ((Math.cos(rotate) * 1) / distance) * 110;
          player2.y += ((Math.sin(rotate) * 1) / distance) * 110;
          player1.y -= ((Math.sin(rotate) * 1) / distance) * 110;
        }
      }
    }
  }
}