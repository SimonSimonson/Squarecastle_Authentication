var Data = {};
var clickedX = -1;
var clickedY = -1;
var instruction = "";
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var websocket;

$(document).ready(function() {
  document.body.style.cursor="default";
  turned = 0;
});

//_______________________________________________________
function initializevalues(p1name,p2name,p1color,p2color){
  document.getElementById("selectedPlayer1").classList.add(p1color+"-player");
  document.getElementById("selectedPlayer2").classList.add(p2color+"-player");
  document.getElementById("p1name").innerHTML = "<p>"+p1name+"</p>";
  document.getElementById("p2name").innerHTML = "<p>"+p2name+"</p>";
}




function calc(source){
  if(lock)
    return;
  var payload = {
    "instruction": source.getAttribute("instruction"),
    "x": source.getAttribute("x"),
    "y": source.getAttribute("y")
  };
  if(source.getAttribute("instruction") === "r" )
    turnright();
  if(source.getAttribute("instruction") === "l" )
    turnleft();
  clickedX = source.getAttribute("x");
  clickedY = source.getAttribute("y");
  instruction = source.getAttribute("instruction");
  websocket.send(JSON.stringify(payload));
  //sendRequest("POST","/squarecastle/api/command", payload)
}

var turned=0;
function turnright(){
  if(turned === undefined)
    turned = 0;
  turned += 90;
  document.getElementById("preview").style.transform = 'rotate('+turned+'deg)';
  console.log("turn picture "+turned);
}
function turnleft(){
  if(turned === undefined)
    turned = 0;
  turned -= 90;
  document.getElementById("preview").style.transform = 'rotate('+turned+'deg)';
  console.log("turn picture "+turned);
}
function sendRequest(meth, path, payload){
  var request = $.ajax({
    method: meth,
    url: path,
    data: JSON.stringify(payload),
    dataType: "json",
    contentType: "application/json",
    success: function(JsonAr){
      readJson(JsonAr);
    }
  });

}
function readJson(json){
  Data[0] = json[0].replaceAll('"',""); //state
  Data[1] = json[1].replaceAll('"',""); //link neue karte
  Data[2] = json[2].replaceAll('"',""); //link gesetzte karte
  Data[3] = json[3].replaceAll('"',""); //spieler der dran ist
  Data[4] = json[4].replaceAll('"',""); //punkte p1
  Data[5] = json[5].replaceAll('"',""); //punkte p2
  Data[6] = json[6].replaceAll('"',""); //neue punkte
  Data[7] = json[7].replaceAll('"',""); //neue punkte

  updateHTML()
}
function updateHTML(){
  console.log("State : " + Data[0]);
  if(Data[0] === "2"){
    if(turned === undefined)
      turned = 0;
    switch (instruction) {
      case "r":
        turnright();
        break;
      case "l":
        turnleft();
        break;
      default:
        console.log("Instruction not readable "+ instruction);
    }
  }
  else if(Data[0] === "1") {
    turned = 0;
    //punktediv vorbereiten

    document.getElementById("punkteAnzeige").innerText = Data[6];
    document.getElementById("p1Points").innerText = Data[5] + " Pts";
    document.getElementById("p2Points").innerText = Data[4] + " Pts";
    document.getElementById("animateImg").classList.remove("red");
    document.getElementById("animateImg").classList.remove("green");
    document.getElementById("animateImg").classList.remove("blue");
    document.getElementById("animateImg").classList.remove("purple");

    document.getElementById("animateImg").classList.add(Data[7]);

    animateImg(0);
    document.getElementById("newcard").innerHTML = '<img id="preview" class="card-preview" src="/assets/' + Data[1] + '">';
    document.getElementById(clickedX + " " + clickedY).innerHTML = '<img src="/assets/' + Data[2] + '">';
  }
  else if(Data[0] === "3") {
    document.getElementById("newcard").innerHTML = '<img id="preview" class="card-preview" src="/assets/' + Data[1] + '">';

  }


}
function startgame(){
  websocket = new WebSocket("ws://localhost:9000/websocket");

  connectWebSocket();

  //animateImg(0);

}
var lock = false;
function animateImg(index){
  lock = true;
  document.getElementById('animateImg').style.transition = "right 0.5s";
  document.getElementById('animateImg').style.transitionTimingFunction = "ease-out";
  document.getElementById('animateImg').style.right = 'calc(100% - 200px)';
  setTimeout(endanimation, 1000);
}
function endanimation(){
  lock = false;
  setTimeout(easeout, 1500);

}
function easeout(){
  document.getElementById('animateImg').style.transition = "right 0.75s";
  document.getElementById('animateImg').style.right = '100%';

}
function connectWebSocket() {
  console.log("Connecting to Websocket");
  console.log("Connected to Websocket");

  websocket.onopen = function(event) {
    console.log("Trying to connect to Server");
  };

  websocket.onclose = function () {
    console.log('Connection Closed!');
    //$(".game").addClass("blurred");
  };

  websocket.onerror = function (error) {
    console.log('Error Occured: ' + error);
  };

  /**
   * Event when message is received from websocket
   * Updates the game
   * @param {*} e : received event
   */
  websocket.onmessage = function (e) {
      console.log("reveived message: "+e);

    readWierdMessagefromWebsocket(e.data);
    };
}
function readWierdMessagefromWebsocket(data){
  var json = JSON.parse(data)
  Data[0] = json[0].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //state
  Data[1] = json[1].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //link neue karte
  Data[2] = json[2].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //link gesetzte karte
  Data[3] = json[3].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //spieler der dran ist
  Data[4] = json[4].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //punkte p1
  Data[5] = json[5].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //punkte p2
  Data[6] = json[6].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //neue punkte
  Data[7] = json[7].replaceAll('"',"").replaceAll(String.fromCharCode(92),''); //neue punkte

  console.log(Data);
  console.log(instruction);
  updateHTML();
}