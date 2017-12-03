//import { AsciiFilter, AdvancedBloomFilter, BloomFilter, BulgePinchFilter, ColorReplaceFilter, ConvolutionFilter, CrossHatchFilter, DotFilter, DropShadowFilter, EmbossFilter, GlowFilter, GodrayFilter, OutlineFilter, MultiColorReplaceFilter, PixelateFilter, RGBSplitFilter, ShockwaveFilter, SimpleLightmapFilter, TiltShiftFilter, TiltShiftAxisFilter, TiltShiftXFilter, TiltShiftYFilter, TwistFilter, ZoomBlurFilter } from 'pixi-filters.js';

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

  name = data.player.uname;
  resetBoard(data);
  initUI();
	ticker.start();

}

function resetBoard(data) {
  leaderboard = data.leaderboard;
  // console.log(leaderboard);
  countdown = data.time;
  playerCount = data.player_count;
  score = 0;
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

    leaderboardDisplay.text = "Leaderboard: ";

    leaderboard.forEach(function (person) {
      // console.log(person);
      leaderboardDisplay.text += "\n" + person.uname + " - " + person.score;
    });

		renderer.render(stage);
	});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dots Logic
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

var dots = new PIXI.Container();
var desiredHeight = window.innerHeight * 0.7;
var split = desiredHeight / 16.0;
stage.addChild(dots);
dots.x = (window.innerWidth / 2) - (desiredHeight / 2);
dots.y = (window.innerHeight / 2) - (desiredHeight / 2);

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
  console.log(board);
  console.log(board[31][2]);
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
      circle.x = 20 + split * j;
      circle.y = 20 + split * i;
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
      dot.connected = true;
    }
    else if(containsObject(dot, this.connectedDots) && !(dot.i == this.connectedDots[length - 1].i)) {
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

	return (distance > 0 && distance <= 1.0 && DotsControl.grid[i1][j1].color == DotsControl.grid[i2][j2].color);
}

DotsControl.releaseDots = function() {

	var editedDots = {'loop': DotsControl.isLoop, 'dots': []};

	if(DotsControl.connectedDots.length > 1) {
		for(i in DotsControl.connectedDots) {
			var dot = DotsControl.connectedDots[i];
			editedDots['dots'].push({'y': dot.j + 16, 'x': dot.i + 16});
			dot.connected = false;
			socket.emit('clear_dots', editedDots);
		}
	}
	else {
		for(i in DotsControl.connectedDots) {
			dot.connected = false;
		}
	}

	for (i in DotsControl.lines) {
		var line = DotsControl.lines[i];
		line.clear();
		dots.removeChild(line);
	}

	DotsControl.isLoop = false;
	DotsControl.lines = [];
	DotsControl.connectedDots = [];
}

DotsControl.onMouseDown = function(event) {
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

//var outlineFilterRed = new PIXI.filters.BloomFilter(15, 2, 1, 0xff9999, 0.5)
// var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5)
// var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5)
// var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5)
// var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5)

function filterOn() {
    //this.filters = [outlineFilterRed]
}

function filterOff() {
    //this.filters = [outlineFilterBlue]
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

// draw line of color
drawLineTo = function(i1, j1, i2, j2) {
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
	DotsControl.onMouseUp(this);
	DotsControl.releaseDots();
}

onMouseDown = function() {
	DotsControl.onMouseDown(this);
	DotsControl.hoverDot(this);
}

onMouseOver = function() {
	//filterOn();
	if(DotsControl.isMouseDown === true) {
		DotsControl.hoverDot(this);
	}
}

DotsControl.onTouchDown = DotsControl.onMouseDown;
DotsControl.onTouchUp   = DotsControl.onMouseUp;
