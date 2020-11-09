class Controller{
 constructor(){
   this.keys = [];
 }
  get up(){
    return (this.keys[87]|| this.keys[38])?true:false;
  }
  get down(){
    return (this.keys[83]|| this.keys[40])?true:false;
  }
  get left(){
    return (this.keys[65]|| this.keys[37])?true:false;
  }
  get right(){
    return (this.keys[68]|| this.keys[39])?true:false;
  }
  get autofire(){
    return (this.keys[69])?true:false;
  }
  get enter(){
    return (this.keys[13])?true:false;
  }
  
}