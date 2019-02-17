var points;
var colors;

var NumVertices  = 36;

var gl;

var fovy = 50.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio
var program;



var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var eye = vec3(0, 0, 10);



var stack = [];

var theta = 0;
var tx = 0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;


var xdir = {xpos:true, xneg:false};
//var ydir = {ypos:true, yneg:false};
var zSign = 1;

var redCube = cube("r");
var blueCube = cube("b");
var greenCube = cube("g");

var cubes = [cube("g"), cube("r"), cube("b")];

var normalsArray = [];

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


    // set the lightning
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var ambientProduct = mult(lightAmbient, materialAmbient);


    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    /*
    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);*/

	points = [];
	colors = [];

    projection = gl.getUniformLocation(program, "projectionMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "viewMatrix");
    gl.uniformMatrix4fv(viewMatrix,false, flatten(lookAt(eye, at, up)));



    render();
}

function cube(color) //we define the faces here
{
    var verts = [];
    switch (color) {
        case "r":
            verts = verts.concat(quad( 1, 0, 3, 2 )); //we add a face formed by 2 triangles
            verts = verts.concat(quad( 2, 3, 7, 6 )); // we add another face
            verts = verts.concat(quad( 3, 0, 4, 7 )); // in total we add 6 faces
            verts = verts.concat(quad( 6, 5, 1, 2 )); // in total we add 12 triangles
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
    return verts; // returns an array of 36 vertices
}

var id;
function render()
{
    /*var redCube = cube("r");
    var blueCube = cube("b");
    var greenCube = cube("g");*/
    //var magentaCube = cube();

    pMatrix = perspective(fovy, aspect, .1, 1000);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    theta += 1;


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

    //stack.push(mvMatrix);
    var mvMatrix = translate(0, 2, 0);
    stack.push(mvMatrix);
    //mvMatrix = mult(rotateY(theta), mvMatrix); //translate(tx, 0, zSign*Math.sqrt(1-tx*tx))
    //mvMatrix = mult(translate(tx, 0, zSign*Math.sqrt(1-tx*tx)), mvMatrix);
    mvMatrix = mult(rotateY(theta), mvMatrix);
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //draw(blueCube, vec4(0.0, 0.0, 1.0, 1.0));
    draw(cubes[0], vec4(0.0, 1.0, 0.0, 1.0));
    //draw(redCube, vec4(1.0, 0.0, 0.0, 1.0));
    //mvMatrix = stack.pop();
    //mvMatrix = stack.pop();
    //console.log(stack.length);
    //mvMatrix = stack.pop();
    //console.log(stack.length);

    stack.push(mvMatrix);
        mvMatrix = mult(translate(tx, 0, zSign*Math.sqrt(1-tx*tx)), mvMatrix); //translate(tx, 0, zSign*Math.sqrt(1-tx*tx))
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        //draw(greenCube, vec4(0.0, 1.0, 0.0, 1.0));
        draw(cubes[1], vec4(1.0, 0.0, 0.0, 1.0));
        draw(cubes[2], vec4(0.0, 0.0, 1.0, 1.0));
        //mvMatrix = stack.pop();
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
    console.log(cube.length);
    console.log(fragColors.length);

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //we compute the normals of the triangles
    normalsArray = [];
    for (var i = 0; i < cube.length/3; i++) {
        newellMethod(cube[i*3], cube[i*3 + 1], cube[i*3 + 2]);
    }
    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

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

    var indices = [ a, b, c, a, c, d ]; // EACH FACE HAS GOT 6 VERTICES because it is composed by 2 triangles.

    for ( var i = 0; i < indices.length; ++i )
    {
        verts.push( vertices[indices[i]] );
    }

    return verts;
}

function newellMethod(a, b, c) {
    var nx = (a[1] - b[1]) * (a[2] + b[2]) + (b[1] - c[1]) * (b[2] + c[2]) + (c[1] - a[1]) * (c[2] + a[2]);
    var ny = (a[2] - b[2]) * (a[0] + b[0]) + (b[2] - c[2]) * (b[0] + c[0]) + (c[2] - a[2]) * (c[0] + a[0]);
    var nz = (a[0] - b[0]) * (a[1] + b[1]) + (b[0] - c[0]) * (b[1] + c[1]) + (c[0] - a[0]) * (c[1] + a[1]);

    var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);

    normalsArray.push(vec3(nx/norm, ny/norm, nz/norm)); // normalized normal vectors
}

//computes every triangle's normal
function triangleNormal(a, b, c) {
    // normals are vectors

    normalsArray.push(a[0],a[1], a[2], 0.0);
    normalsArray.push(b[0],b[1], b[2], 0.0);
    normalsArray.push(c[0],c[1], c[2], 0.0);

    //index += 3;

}
