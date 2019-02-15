var points;
var colors;

var NumVertices  = 36;

var gl;

var fovy = 60.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio
var program;

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var stack = [];

var theta = 0;
var tx = 0;


var xdir = {xpos:true, xneg:false};
//var ydir = {ypos:true, yneg:false};
var zSign = 1;

function main()
{
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

	//Check that the return value is not null.
	if (!gl)
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	program = initShaders(gl, "vshader", "fshader");
	gl.useProgram(program);

	//Set up the viewport
    gl.viewport( 0, 0, 400, 400);

    aspect =  canvas.width/canvas.height;
    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearing the color buffer
    gl.enable(gl.DEPTH_TEST);

	points = [];
	colors = [];

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    render();
}

function cube(color) //we define the faces here
{
    var verts = [];
    switch (color) {
        case "r":
            verts = verts.concat(quad( 1, 0, 3, 2 ));
            verts = verts.concat(quad( 2, 3, 7, 6 ));
            verts = verts.concat(quad( 3, 0, 4, 7 ));
            verts = verts.concat(quad( 6, 5, 1, 2 ));
            verts = verts.concat(quad( 4, 5, 6, 7 ));
            verts = verts.concat(quad( 5, 4, 0, 1 ));
            break;
        case "b":
            verts = verts.concat(quad( 9, 8, 11, 10 ));
            verts = verts.concat(quad( 10, 11, 15, 14 ));
            verts = verts.concat(quad( 11, 8, 12, 15 ));
            verts = verts.concat(quad( 14, 13, 9, 10 ));
            verts = verts.concat(quad( 12, 13, 14, 15 ));
            verts = verts.concat(quad( 13, 12, 8, 9 ));
            break;
        case "g":
            var inc = 16;
            verts = verts.concat(quad( 1+inc, 0+inc, 3+inc, 2+inc ));
            verts = verts.concat(quad( 2+inc, 3+inc, 7+inc, 6+inc ));
            verts = verts.concat(quad( 3+inc, 0+inc, 4+inc, 7+inc ));
            verts = verts.concat(quad( 6+inc, 5+inc, 1+inc, 2+inc ));
            verts = verts.concat(quad( 4+inc, 5+inc, 6+inc, 7+inc ));
            verts = verts.concat(quad( 5+inc, 4+inc, 0+inc, 1+inc ));
            break;
    }
    /*
    verts = verts.concat(quad( 1, 0, 3, 2 ));
    verts = verts.concat(quad( 2, 3, 7, 6 ));
    verts = verts.concat(quad( 3, 0, 4, 7 ));
    verts = verts.concat(quad( 6, 5, 1, 2 ));
    verts = verts.concat(quad( 4, 5, 6, 7 ));
    verts = verts.concat(quad( 5, 4, 0, 1 )); */
    return verts;
}

var id;
function render()
{
    var redCube = cube("r");
    var blueCube = cube("b");
    var greenCube = cube("g");
    //var magentaCube = cube();

    pMatrix = perspective(fovy, aspect, .1, 10);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    theta += 0.1;
    eye = vec3(0, 0, 4);
    mvMatrix = lookAt(eye, at , up);

    //handling the circular movement

    if (xdir.xpos) {
        if (tx >= 1) {
            xdir.xpos = false;
            xdir.xneg = true;
            zSign = -1*zSign;
        } else {
            tx += 0.01;
            //ty += 0.01;
        }
    } else { // xdir.xneg is true

        if (tx <= -1) {
            xdir.xpos = true;
            xdir.xneg = false;
            zSign = -1*zSign;
        } else {
            tx -= 0.01;
            //ty -= 0.01;
        }
    }

    stack.push(mvMatrix);
    //mvMatrix = mult(rotateY(theta), mvMatrix); //translate(tx, 0, zSign*Math.sqrt(1-tx*tx))
    mvMatrix = mult(translate(tx, 0, zSign*Math.sqrt(1-tx*tx)), mvMatrix);
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    draw(redCube, vec4(1.0, 0.0, 0.0, 1.0));
    draw(blueCube, vec4(0.0, 0.0, 1.0, 1.0));
    draw(greenCube, vec4(0.0, 1.0, 0.0, 1.0));
    //mvMatrix = stack.pop();
    //mvMatrix = stack.pop();
    console.log(stack.length);
    //mvMatrix = stack.pop();
    //console.log(stack.length);

    /*stack.push(mvMatrix);
        mvMatrix = mult(rotateY(theta), mvMatrix);
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        draw(greenCube, vec4(0.0, 1.0, 0.0, 1.0));
        mvMatrix = stack.pop();
    /*
    stack.push(mvMatrix);
        mvMatrix = mult(, mvMatrix);
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        draw(redCube, vec4(1.0, 0.0, 0.0, 1.0));
        //mvMatrix = stack.pop();

        stack.push(mvMatrix);
            mvMatrix = mult(mvMatrix, translate(1, 1, 0));
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            draw(magentaCube, vec4(1.0, 0.0, 1.0, 1.0));
        mvMatrix = stack.pop();
    mvMatrix = stack.pop();

    stack.push(mvMatrix);
    mvMatrix = mult(mvMatrix, translate(-1, -1, -1));
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    draw(blueCube, vec4(0.0, 0.0, 1.0, 1.0));
    mvMatrix = stack.pop();

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    draw(greenCube, vec4(0.0, 1.0, 0.0, 1.0)); */
    id = requestAnimationFrame(render);
}

function draw(cube, color)
{
    var fragColors = [];

    for(var i = 0; i < cube.length; i++)
    {
        fragColors.push(color);
    }

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fragColors), gl.STATIC_DRAW);

    var vColor= gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}


function quad(a, b, c, d)
{
    var verts = [];

    var vertices = [
        vec4( -1.5, -1.0, 0.5, 1.0 ),
        vec4( -1.5, 0.0, 0.5, 1.0 ),
        vec4(  -0.5,  0.0,  0.5, 1.0 ),
        vec4( -0.5, -1.0, 0.5, 1.0 ),
        vec4( -1.5, -1.0, -0.5, 1.0 ),
        vec4( -1.5, 0.0, -0.5, 1.0 ),
        vec4(  -0.5,  0.0,  -0.5, 1.0 ),
        vec4( -0.5, -1.0, -0.5, 1.0 ),//red

        vec4( 0.5, -1.0,  0.5, 1.0 ),
        vec4( 0.5,  0.0,  0.5, 1.0 ),
        vec4(  1.5,  0.0,  0.5, 1.0 ),
        vec4(  1.5, -1.0,  0.5, 1.0 ),
        vec4( 0.5, -1.0, -0.5, 1.0 ),
        vec4( 0.5,  0.0, -0.5, 1.0 ),
        vec4(  1.5,  0.0, -0.5, 1.0 ),
        vec4(  1.5, -1.0, -0.5, 1.0 ),//blue

        vec4( -0.5, 1.0,  0.5, 1.0 ),
        vec4( -0.5,  2.0,  0.5, 1.0 ),
        vec4(  0.5,  2.0,  0.5, 1.0 ),
        vec4(  0.5, 1.0,  0.5, 1.0 ),
        vec4( -0.5, 1.0, -0.5, 1.0 ),
        vec4( -0.5,  2.0, -0.5, 1.0 ),
        vec4(  0.5,  2.0, -0.5, 1.0 ),
        vec4(  0.5, 1.0, -0.5, 1.0 ) //green

    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i )
    {
        verts.push( vertices[indices[i]] );
    }

    return verts;
}
