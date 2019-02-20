//TODO how do I move the sphere
// I feel like the cube is only a rectangle
// do we have to compute the normals each time the cube rotates? no. we compute the normals in the model coordinates and we pass them to view coordinates with the modelViewMotrix
// should I have done the the normal interpolation in the shaders? with the varying variable?, I did it in the javascript code
// i am not sure how to translate the sphere


// flat shading
var theta = 0;
var canvas;
var gl;
var program;

var numTimesToSubdivide = 5;

var index = 0;

var pointsArray = [];
var normalsArray = [];


var near = -10;
var far = 10;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

/*var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );*/
var a = 1;
var b = 1;
var c = 1;
var lightCoord = vec4(a, b, c, 1.0);
var lightPosition = lightCoord;
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = lightCoord;
var lightSpecular = lightCoord;

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye = vec3(0, 0, 2);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var fovy = 150.0;

var map = new Map();
//var normals = [];
var orderVertices = [];
var stack = [];

function cube()
{
    pointsArray = [];
    var verts = [];
    orderVertices = []; // we update it in the quad function
    normalsArray = []; // TODO maybe this will give errors


    for (var i = 0; i < 8; i++) {
        map.set(i.toString(), []);
    }

    verts = verts.concat(quad( 1, 0, 3, 2 ));
    verts = verts.concat(quad( 2, 3, 7, 6 ));
    verts = verts.concat(quad( 3, 0, 4, 7 ));
    verts = verts.concat(quad( 6, 5, 1, 2 ));
    verts = verts.concat(quad( 4, 5, 6, 7 ));
    verts = verts.concat(quad( 5, 4, 0, 1 ));

    //var firstN = newellMethod(vertices[orderVertices[0]], vertices[neigh[0][0]], vertices[neigh[0][1]]);


    // now we compute the normals for every vertex (interpolation of the normals)
    /*for (var i = 0; i < orderVertices.length; i++) {
        //var normalsLocal = [];
        var nx = 0;
        var ny = 0;
        var nz = 0;
        var neigh = map.get(orderVertices[i].toString()); // this is an array of arrays. Every array represents two neighbors of this vertex that together form a triangle. In this array we store only the positions of the vertices in the vertices array, not the vertices themselves
        //console.log(orderVertices[i]);
        //console.log(neigh);

        for (var j = 0; j < neigh.length; j++) {
            // now we compute the normal of each triangle
            var n = newellMethod(vertices[orderVertices[i]], vertices[neigh[j][0]], vertices[neigh[j][1]]);
            nx += n[0];
            ny += n[1];
            nz += n[2];


        }

        //we compute the normal of the vertex orderVertices[i]
        var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);
        //console.log(nx + " " + ny + " " + nz);
        //console.log(norm);
        normals.push(vec4(nx/norm, ny/norm, nz/norm, 0.0)); // these are the normals of the vertices! (using interpolation)

    }*/
    //console.log(normals);
    return verts;
}

function quad(a, b, c, d) //a, b, c , d are numbers (the position of the vertices that form a face in the vertices array)
{
    var verts = [];

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

    /*map.get(a.toString()).push([b, c]);
    map.get(a.toString()).push([c, d]);
    map.get(b.toString()).push([a, c]);
    map.get(c.toString()).push([a, b]);
    map.get(c.toString()).push([a, d]);
    map.get(d.toString()).push([a, c]); */



    var indices = [ a, b, c, a, c, d ];
    //orderVertices.push(a, b, c, a, c, d);

    for ( var i = 0; i < indices.length; ++i )
    {
        var v = vertices[indices[i]];
        verts.push(v);
        normalsArray.push(vec4(v[0], v[1], v[2], 0.0));
    }

    return verts;
}

function newellMethod(a, b, c) {
    //console.log("newell: " + a);
    var nx = (a[1] - b[1]) * (a[2] + b[2]) + (b[1] - c[1]) * (b[2] + c[2]) + (c[1] - a[1]) * (c[2] + a[2]);
    var ny = (a[2] - b[2]) * (a[0] + b[0]) + (b[2] - c[2]) * (b[0] + c[0]) + (c[2] - a[2]) * (c[0] + a[0]);
    var nz = (a[0] - b[0]) * (a[1] + b[1]) + (b[0] - c[0]) * (b[1] + c[1]) + (c[0] - a[0]) * (c[1] + a[1]);

    var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);

    return vec3(nx/norm, ny/norm, nz/norm); // normalized normal vectors
}

function triangle(a, b, c) {

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     // normals are vectors

     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;

}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    pointsArray = [];
    normalsArray = [];
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}



window.onload = function init() {




    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

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

    //draw(redCube, vec4(1.0, 0.0, 0.0, 1.0));
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    modelViewMatrix = lookAt(eye, at , up);
    stack.push(modelViewMatrix);
    projectionMatrix = perspective(fovy, canvas.width/canvas.height, .1, 1000);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    pointsArray = cube();
    modelViewMatrix = mult(modelViewMatrix, translate(2.0, 0.0, 0.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    render(true);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    modelViewMatrix = stack.pop();
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-2.0, 0.0, 0.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    render(false);




}

var id;
function render(isCube) {


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);




    var colorLoc = gl.getUniformLocation(program, "vColor");
    gl.uniform4fv(colorLoc, flatten(vec4(0.0, 1.0, 0.0, 1.0)));

    /*for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );*/

    if (isCube) {
        gl.drawArrays( gl.TRIANGLES, 0, 36 );
    } else {
        for( var i=0; i<index; i+=3)
            gl.drawArrays( gl.TRIANGLES, i, 3 );
    }


    //id = requestAnimationFrame(renderCube);
}
/*

function renderSphere() {
    //gl.cullFace(gl.BACK);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    modelViewMatrix = lookAt(eye, at , up);
    //projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = perspective(fovy, canvas.width/canvas.height, .1, 1000);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    var colorLoc = gl.getUniformLocation(program, "vColor");
    gl.uniform4fv(colorLoc, flatten(vec4(0.0, 1.0, 0.0, 1.0)));

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

}
*/
