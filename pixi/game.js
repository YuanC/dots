//Create the renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, this.options);
var ticker = new PIXI.ticker.Ticker();
renderer.backgroundColor = 0x061639;
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();
var countdown, timeDisplay;

function initialize(){

	drawGrid();
	timer();

	ticker.start();

}

function drawGrid() {
	var grid = new Array(10);
	for (var i = 0; i < 10; i++) {
		grid[i] = new Array(10);
		for(var j = 0; j < 10; j++) {
			var circle = new PIXI.Graphics();
			circle.beginFill(0x9966FF);
			circle.drawCircle(0, 0, 10);
			circle.endFill();
			circle.x = 20 + 30 * i;
			circle.y = 20 + 30 * j;
			stage.addChild(circle);
			grid[i][j] = circle;
		}
	}
	renderer.render(stage);
}

//TIME, SCORE, PLAYER COUNT, NAME CHANGE AND LEADERBOARD
function timer(){
	timeDisplay = new PIXI.Text(
			"Time: " + countdown.toString(),
			{fontFamily: "Arial", fontSize: 32, fill: "white"}
		);

	timeDisplay.position.set(54, 96);
	stage.addChild(timeDisplay);

	ticker.add(function (time) {
		// console.log(ticker.elapsedMS);
		if(countdown > 0){
			countdown = countdown - time*ticker.elapsedMS/1000;
			timeDisplay.text = "Time: " + Math.round(countdown);
		}
		renderer.render(stage);
	});
}

// setInterval(function(){
// 	console.log("changing time");
// 	if(countdown > 0){
// 		countdown = countdown - 1;
// 		timeDisplay.text = "Time: " + countdown.toString();
// 	}
// },1000)












