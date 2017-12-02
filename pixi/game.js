//Create the renderer
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, this.options);
renderer.backgroundColor = 0x061639;
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();

drawGrid();



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