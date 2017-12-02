// Create the renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, this.options);
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
var dots = new PIXI.Container();
stage.addChild(dots);

var line = new PIXI.Graphics();

line.beginFill(colorDict['0']);
line.lineStyle(5, colorDict['0']);
line.moveTo(25, 25);
line.lineTo(50, 50);
line.endFill();
dots.addChild(line);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dots Logic
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * Dots Logic controller.
*/
DotsControl = {
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
      circle.on('mouseover', onMouseOver).on('mousedown', onMouseDown).on('mouseup', onMouseUp);
      circle.beginFill(colorDict[board[i][j].toString()]);
      circle.drawCircle(0, 0, 10);
      circle.endFill();
      circle.color = colorDict[board[i][j].toString()];
      circle.i = i;
      circle.j = j;
      circle.connected = false;
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
  console.log(this.connectedDots.length);
  if (length == 0 || DotsControl.canConnect(this.connectedDots[length - 1].i, this.connectedDots[length - 1].j, dot.i, dot.j)) {
    if (dot.connected !== true) {
      this.connectedDots.push(dot);
      dot.connected = true;
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

	console.log(distance <= 1.0);
	return (distance <= 1.0 && DotsControl.grid[i1][j1].color == DotsControl.grid[i2][j2].color);
}

DotsControl.releaseDots = function() {

	for(i in DotsControl.connectedDots) {
		var dot = DotsControl.connectedDots[i];
		dot.connected = false;
	}

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