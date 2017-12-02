// Create the renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, this.options);
var ticker = new PIXI.ticker.Ticker();
renderer.backgroundColor = 0xfffff0;
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

var colorDict = {
	'0': 0xff4d4d,
	'1': 0x8cff66,
	'2': 0x6699ff,
	'3': 0xffff00,
	'4': 0x8000ff,
};
var grid = Array(40)
for(var i = 0; i < 40; i++) {
	grid[i] = Array(20);
}

// Add the canvas to the HTML document
document.body.appendChild(renderer.view);

// Create a container object called the `stage`
var stage = new PIXI.Container();
var timeDisplay, scoreDisplay, nameDisplay, playerCountDisplay, leaderboardDisplay;
var countdown, score, name, playerCount, leaderboard; 
var textColor = "0x375E53";

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
		{fontFamily: "Arial", fontSize: 32, fill: textColor}
	);

	timeDisplay.anchor.set(0.5, 0);
  timeDisplay.position.set(window.innerWidth / 2, 20);
	stage.addChild(timeDisplay);

  scoreDisplay = new PIXI.Text(
    "Score: " + score,
    {fontFamily: "Arial", fontSize: 32, fill: textColor}
  );

  scoreDisplay.anchor.set(1, 0);
  scoreDisplay.position.set(window.innerWidth - 20, 20);
  stage.addChild(scoreDisplay);

  nameDisplay = new PIXI.Text(
    "Name: " + name,
    {fontFamily: "Arial", fontSize: 32, fill: textColor}
  );

  nameDisplay.anchor.set(1);
  nameDisplay.position.set(window.innerWidth - 20, window.innerHeight - 20);
  stage.addChild(nameDisplay);

  playerCountDisplay = new PIXI.Text(
    "Player count: " + playerCount,
    {fontFamily: "Arial", fontSize: 32, fill: textColor}
  );

  playerCountDisplay.anchor.set(0, 1);
  playerCountDisplay.position.set(20, window.innerHeight - 20);
  stage.addChild(playerCountDisplay);

  leaderboardDisplay = new PIXI.Text(
    "Leaderboard: " + leaderboard,
    {fontFamily: "Arial", fontSize: 32, fill: textColor}
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

var dots = new PIXI.Container();
stage.addChild(dots);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dots Logic
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * Dots Logic controller.
*/
var DotsControl = {
  connectedDots: [],
  lines: [],
  isMouseDown: false,
  grid: [],
}

var colorDict = {
  '0': 0xff4d4d,
  '1': 0x8cff66,
  '2': 0x6699ff,
  '3': 0xffff00,
  '4': 0x8000ff,
};
DotsControl.grid = Array(40)
for(var i = 0; i < 40; i++) {
  DotsControl.grid[i] = Array(20);
}

// Rerender grid
DotsControl.drawGrid = function(board) {
  // parse response grid
  for (var i = 0; i < 10; i++) {
    for(var j = 0; j < 10; j++) {
      var circle = new PIXI.Graphics();
      circle.interactive = true;
      circle.beginFill(colorDict[board[i][j].toString()]);
      circle.drawCircle(0, 0, 10);
      circle.endFill();
      circle.color = colorDict[board[i][j].toString()];
      circle.hitArea = new PIXI.Rectangle(-10, -10, 20, 20);
      circle.x = 20 + 50 * i;
      circle.y = 20 + 50 * j;
      dots.addChild(circle);
      DotsControl.grid[i][j] = circle;
    }
  }
  renderer.render(stage);
}

// 
DotsControl.hoverDot = function(dot) {
  var length = this.connectedDots.length;

  if (length == 0 || dot.canConnect(this.connectedDots[length - 1])) {
    if (dot.connected !== true) {
      this.connectedDots.push(dot);
      dot.connected = true;
    } else {
      DotsController.increasePoints(1);
    }

    if (length > 0) {
      // Connects to the last dot
      dot.connectTo(this.connectedDots[length - 1]);
    }

    dot.animateHover();
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

  return (distance <= 1.0 && DotsControls.grid[i1][j1] == DotsControls.grid[i2][j2]);
}

DotsControl.onMouseDown = function(event) {
  DotsControl.isMouseDown = true;
}

DotsControl.onMouseUp = function(event) {
  DotsControl.isMouseDown = false;
  DotsControl.releaseDots();
}

DotsControl.onTouchDown = DotsControl.onMouseDown;
DotsControl.onTouchUp   = DotsControl.onMouseUp;

// draw line of color
drawLineTo = function(i1, j1, i2, j2) {
  var line = new PIXI.Graphics();
  var color = this.element.lineColor;

  line.beginFill(DotsControls.grid[i1][j2].color);
  line.lineStyle(5, DotsControls.grid[i1][j2].color);
  line.moveTo(DotsControls.grid[i1][j1].x, DotsControls.grid[i1][j1].y);
  line.lineTo(DotsControls.grid[i2][j2].x, DotsControls.grid[i2][j2].y);
  line.endFill();

  DotsController.lines.push(line);
  stage.addChild(line);
}

DotsControl.onMouseDown = function(event) {
  DotsControl.isMouseDown = true;
}

DotsControl.onMouseUp = function(event) {
  DotsControl.isMouseDown = false;
  DotsControl.releaseDots();
}

DotsControl.onTouchDown = DotsControl.onMouseDown;
DotsControl.onTouchUp   = DotsControl.onMouseUp;
