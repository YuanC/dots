// Create the renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, this.options);
var ticker = new PIXI.ticker.Ticker();
renderer.backgroundColor = 0xfffff0;
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

// Add the canvas to the HTML document
document.body.appendChild(renderer.view);

// Create a container object called the `stage`
var stage = new PIXI.Container();
var timeDisplay, scoreDisplay, nameDisplay, playerCountDisplay, leaderboardDisplay;
var countdown, score, name, playerCount, leaderboard; 
var textColor = "0x375E53";

// Load google fonts
window.WebFontConfig = {
    google: {
        families: ['Oxygen']
    }
};

// include the web-font loader script
/* jshint ignore:start */
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();
/* jshint ignore:end */

function initialize(data){

  resetBoard(data);
  initUI();
	ticker.start();

}

function resetBoard(data) {
  countdown = data.time;
  name = data.player.uname;
  playerCount = data.player_count;
  score = data.player.score;
  DotsControl.drawGrid(data.board);
}

//TIME, SCORE, PLAYER COUNT, NAME CHANGE AND LEADERBOARD
function initUI(){
	timeDisplay = new PIXI.Text(
		"Time: " + countdown,
		{fontFamily: 'Oxygen', fontSize: 32, fill: textColor}
	);

	timeDisplay.anchor.set(0.5, 0);
  timeDisplay.position.set(window.innerWidth / 2, 20);
	stage.addChild(timeDisplay);

  scoreDisplay = new PIXI.Text(
    "Score: " + score,
    {fontFamily: 'Oxygen', fontSize: 32, fill: textColor}
  );

  scoreDisplay.anchor.set(1, 0);
  scoreDisplay.position.set(window.innerWidth - 20, 20);
  stage.addChild(scoreDisplay);

  nameDisplay = new PIXI.Text(
    "Name: " + name,
    {fontFamily: 'Oxygen', fontSize: 32, fill: textColor}
  );

  nameDisplay.anchor.set(1);
  nameDisplay.position.set(window.innerWidth - 20, window.innerHeight - 20);
  stage.addChild(nameDisplay);

  playerCountDisplay = new PIXI.Text(
    "Player count: " + playerCount,
    {fontFamily: 'Oxygen', fontSize: 32, fill: textColor}
  );

  playerCountDisplay.anchor.set(0, 1);
  playerCountDisplay.position.set(20, window.innerHeight - 20);
  stage.addChild(playerCountDisplay);

  leaderboardDisplay = new PIXI.Text(
    "Leaderboard: " + leaderboard,
    {fontFamily: 'Oxygen', fontSize: 32, fill: textColor}
  );

  leaderboardDisplay.position.set(20, 20);
  leaderboardDisplay.anchor.set(0,0);
  stage.addChild(leaderboardDisplay);

	ticker.add(function (deltaTime) {
		// console.log(ticker.elapsedMS);
		if(countdown > 0){
			countdown = countdown - deltaTime*ticker.elapsedMS/1000;
			timeDisplay.text = "Time: " + Math.round(countdown);
		}

    playerCountDisplay.text = "Player count: " + playerCount;
    scoreDisplay.text = "Score: " + score;


		renderer.render(stage);
	});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dots Logic
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

var dots = new PIXI.Container();
stage.addChild(dots);
dots.x = (window.innerWidth / 2) - 360;
dots.y = (window.innerHeight / 2) - 360;

/*
 * Dots Logic controller.
*/
DotsControl = {
  connectedDots: [],
  lines: [],
  isLoop: false,
  isMouseDown: false,
  grid: [],
}

var colorDict = {
  '0': 0xff4d4d,
  '1': 0x8cff66,
  '2': 0x6699ff,
  '3': 0xFF8C00,
  '4': 0x8000ff,
};
DotsControl.grid = Array(40)
for(var i = 0; i < 40; i++) {
  DotsControl.grid[i] = Array(20);
}

// Rerender grid
DotsControl.drawGrid = function(board) {
  // parse response grid
  for (var i = 0; i < 16; i++) {
    for(var j = 0; j < 16; j++) {
      var circle = new PIXI.Graphics();
      circle.interactive = true;
      circle.on('mouseover', onMouseOver).on('mousedown', onMouseDown).on('mouseup', onMouseUp);
      circle.beginFill(colorDict[board[16 + i][j].toString()]);
      circle.drawCircle(0, 0, 10);
      circle.endFill();
      circle.color = colorDict[board[16 + i][j].toString()];
      circle.i = i;
      circle.j = j;
      circle.connected = false;
      circle.hitArea = new PIXI.Rectangle(-30, -30, 60, 60);
      circle.x = 20 + 45 * i;
      circle.y = 20 + 45 * j;
      dots.addChild(circle);
      DotsControl.grid[i][j] = circle;
    }
  }
  renderer.render(stage);
}

/*
 * Hover over dot to see if connection can be made
*/
DotsControl.hoverDot = function(dot) {
  var length = this.connectedDots.length;
  console.log(this.connectedDots.length);
  if (length == 0 || DotsControl.canConnect(this.connectedDots[length - 1].i, this.connectedDots[length - 1].j, dot.i, dot.j)) {
    if (dot.connected !== true) {
      this.connectedDots.push(dot);
      console.log(this.connectedDots);
      dot.connected = true;
    }
    if(dot.connected === true) {
    	console.log('is loop');
    	DotsControl.isLoop = true;
    }

    if (length > 0) {
      // Connects to the last dot
      drawLineTo(this.connectedDots[length - 1].i, this.connectedDots[length - 1].j, dot.i, dot.j);
    }
  }
}

/*
 * Check if a dot can connect to other
*/
DotsControl.canConnect = function(i1, j1, i2, j2) {
	var distance = 0.0;
	distance = Math.pow((j1 - j2), 2);
	distance = distance + Math.pow((i1 - i2), 2);
	distance = Math.sqrt(distance);

	return (distance <= 1.0 && DotsControl.grid[i1][j1].color == DotsControl.grid[i2][j2].color);
}

DotsControl.releaseDots = function() {

	var editedDots = {'loop': DotsControl.isLoop, 'dots': []};

	for(i in DotsControl.connectedDots) {
		var dot = DotsControl.connectedDots[i];
		editedDots['dots'].push({'y': dot.i + 16, 'x': dot.j + 16});
		dot.connected = false;
	}
	socket.emit('clear_dots', editedDots);

	for (i in DotsControl.lines) {
		var line = DotsControl.lines[i];
		line.clear();
		dots.removeChild(line);
	}

	DotsControl.lines = [];
	DotsControl.connectedDots = [];
}

DotsControl.onMouseDown = function(event) {
	console.log('down');
	DotsControl.isMouseDown = true;
}

DotsControl.onMouseUp = function(event) {
  DotsControl.isMouseDown = false;
}

DotsControl.onTouchDown = DotsControl.onMouseDown;
DotsControl.onTouchUp   = DotsControl.onMouseUp;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// draw line of color
drawLineTo = function(i1, j1, i2, j2) {
	console.log('yo we out here');
	var line = new PIXI.Graphics();

	line.beginFill(DotsControl.grid[i1][j2].color);
	line.lineStyle(5, DotsControl.grid[i1][j2].color);
	line.moveTo(DotsControl.grid[i1][j1].x, DotsControl.grid[i1][j1].y);
	line.lineTo(DotsControl.grid[i2][j2].x, DotsControl.grid[i2][j2].y);
	line.endFill();

	DotsControl.lines.push(line);
	dots.addChild(line);
	renderer.render(stage);
}

onMouseUp = function() {
	console.log('up');
	DotsControl.onMouseUp(this);
	DotsControl.releaseDots();
}

onMouseDown = function() {
	console.log('down')
	DotsControl.onMouseDown(this);
	DotsControl.hoverDot(this);
}


onMouseOver = function() {
	console.log('over')
	if(DotsControl.isMouseDown === true) {
		DotsControl.hoverDot(this);
	}
}

DotsControl.onTouchDown = DotsControl.onMouseDown;
DotsControl.onTouchUp   = DotsControl.onMouseUp;
