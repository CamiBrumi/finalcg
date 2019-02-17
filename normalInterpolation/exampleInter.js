var points;
var colors;

var NumVertices  = 36;

var gl;

var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio
var program;

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var stack = [];
var map = new Map();
var normals = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var orderVertices = [];

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

function cube()
{
    var verts = [];
    orderVertices = []; // we update it in the quad function
    normals = []; // TODO maybe this will give errors
    verts = verts.concat(quad( 1, 0, 3, 2 ));
    verts = verts.concat(quad( 2, 3, 7, 6 ));
    verts = verts.concat(quad( 3, 0, 4, 7 ));
    verts = verts.concat(quad( 6, 5, 1, 2 ));
    verts = verts.concat(quad( 4, 5, 6, 7 ));
    verts = verts.concat(quad( 5, 4, 0, 1 ));

    // now we compute the normals for every vertex (interpolation of the normals)
    for (var i = 0; i < orderVertices.length; i++) {
        //var normalsLocal = [];

        var neigh = map.get(orderVertices[i]); // this is an array of arrays. Every array represents two neighbors of this vertex that together form a triangle.
        var firstN = newellMethod(vertices[orderVertices[0]], neigh[0], neigh[1]);
        var nx = firstN[0];
        var ny = firstN[1];
        var nz = firstN[2];
        for (var j = 1; j < neigh.length; j++) {
            // now we compute the normal of each triangle
            var n = newellMethod(vertices[orderVertices[i]], neigh[0], neigh[1]);
            nx += n[0];
            ny += n[1];
            nz += n[2];


        }
        //we compute the normal of the vertex orderVertices[i]
        var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);
        normals.push(vec3(nx/norm, ny/norm, nz/norm)); // these are the normals of the vertices! (using interpolation)

    }

    return verts;
}

function newellMethod(a, b, c) {
    var nx = (a[1] - b[1]) * (a[2] + b[2]) + (b[1] - c[1]) * (b[2] + c[2]) + (c[1] - a[1]) * (c[2] + a[2]);
    var ny = (a[2] - b[2]) * (a[0] + b[0]) + (b[2] - c[2]) * (b[0] + c[0]) + (c[2] - a[2]) * (c[0] + a[0]);
    var nz = (a[0] - b[0]) * (a[1] + b[1]) + (b[0] - c[0]) * (b[1] + c[1]) + (c[0] - a[0]) * (c[1] + a[1]);

    var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);

    return vec3(nx/norm, ny/norm, nz/norm); // normalized normal vectors
}

function render()
{
    var redCube = cube();
    var blueCube = cube();
    var greenCube = cube();
    var magentaCube = cube();

    pMatrix = perspective(fovy, aspect, .1, 10);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    eye = vec3(0, 0, 4);
    mvMatrix = lookAt(eye, at , up);

    stack.push(mvMatrix);
        mvMatrix = mult(rotateZ(45), mvMatrix);
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
        draw(redCube, vec4(1.0, 0.0, 0.0, 1.0));
        //mvMatrix = stack.pop();

        stack.push(mvMatrix);
            mvMatrix = mult(mvMatrix, translate(1, 1, 1));
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
    draw(greenCube, vec4(0.0, 1.0, 0.0, 1.0));

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


function quad(a, b, c, d) //a, b, c , d are numbers (the position of the vertices that form a face in the vertices array)
{
    var verts = [];

    /*var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];*/

    map.set(a.toString(), []);
    map.set(b.toString(), []);
    map.set(c.toString(), []);
    map.set(d.toString(), []);

    map.get(a.toString()).push([b, c]);
    map.get(a.toString()).push([c, d]);
    map.get(b.toString()).push([a, c]);
    map.get(c.toString()).push([a, b]);
    map.get(c.toString()).push([a, d]);
    map.get(d.toString()).push([a, c]);


    var indices = [ a, b, c, a, c, d ];
    orderVertices.push(a, b, c, a, c, d);

    for ( var i = 0; i < indices.length; ++i )
    {
        verts.push( vertices[indices[i]] );
    }

    return verts;
}
