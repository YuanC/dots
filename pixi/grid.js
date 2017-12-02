
/*
 * Game Logic controller.
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
      circle.x = 20 + 50 * i;
      circle.y = 20 + 50 * j;
      dots.addChild(circle);
      grid[i][j] = circle;
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
DotsControl.canConnect = function(dot) {
  var distance = 0.0;

  distance = Math.pow((dot.matrixPos.x - this.matrixPos.x), 2);
  distance = distance + Math.pow((dot.matrixPos.y - this.matrixPos.y), 2);
  distance = Math.sqrt(distance);

  return (distance <= 1.0 && dot.element.lineColor == this.element.lineColor);
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