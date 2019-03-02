// Computer Graphics
// Camelia D. Brumar

var theta = 2.25;
var canvas;
var gl;
var program;
var numTimesToSubdivide = 5;
var index = 0;
var THETA_INCREMENT = 0.2;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var modelMatrix, viewMatrix, projectionMatrix;
var modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
var xEye = 0;
var yEye = 0;
var zEye = 20;
var eye = vec3(xEye, yEye, zEye);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var fovy = 60.0;

// objects and vectors in model coordinates:
var cubePoints = [];
var spherePoints = [];
var cubeNormals = [];
var cubeNormalsFlat = [];
var sphereNormals = [];
var hangerNormals = [];
var map = new Map();
var orderVertices = [];
var stack = [];
var pointsArray = [];
var normalsArray = [];

var shadeType = {gourand: true, flat: false};

var spotRad = 0.9;
var spotXPos = 0;
var spotYPos = 0;

var red = new Uint8Array([255, 0, 0, 255]);
var blue = new Uint8Array([0, 0, 255, 255]);
var green = new Uint8Array([0, 255, 0, 255]);
var cyan = new Uint8Array([0, 255, 255, 255]);
var magenta = new Uint8Array([255, 0, 255, 255]);
var yellow = new Uint8Array([255, 255, 0, 255]);

var cubeMap;
var imagesLoaded;

var imageXp = new Image();
var imageYp = new Image();
var imageZp = new Image();
var imageXn = new Image();
var imageYn = new Image();
var imageZn = new Image();
var textureRendered = false;

var floorPoints = [
    vec4( -10, -10,  -10, 1.0 ),
    vec4( -10,  -10,  10, 1.0 ),
    vec4( 10,  -10,  10, 1.0 ),
    vec4( 10, -10,  -10, 1.0 )

];



/*var floorPoints = [
    vec4( 0, -10,  -10, 1.0 ),
    vec4( -10,  -10,  10, 1.0 ),
    vec4( 0,  -10,  10, 1.0 ),
    vec4( 10, -10,  -10, 1.0 )
];*/

var floorNormals = [
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0)
];

var isRefl = false;
var isRefr = false;

// for the walls texturing-------------
var texture;

var minT = 0.0;
var maxT = 1.0;

var texCoord = [
    vec2(minT, minT),
    vec2(minT, maxT),
    vec2(maxT, maxT),
    vec2(maxT, minT)
];

var texCoordsArrayCube = [];
var texCoordsArraySphere = [];
var texCoordsArrayHanger = [];

function createATexture()
{
    //
    // Initialize a texture
    //

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Fill the texture with a 1x1 blue pixel.
    //Specify the array of the two-dimensional texture elements
    //target, level, iformat, format, type, image
    //target - lets us choose a single image or set up a cube map
    //level - mipmapping, where 0 denotes the highest resolution or that we are not using mipmapping
    //iformat - how to store the texture in memory
    //width
    //height
    //border - deprecated, so should always be 0
    //format and type - how the pixels are stored, so that WebGL knows how to read those pixels in
    //image - self-explanatory
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}



function configureTextureWalls( image ) {
    //Create a texture object
    texture = gl.createTexture();

    //Bind it as the current two-dimensional texture
    gl.bindTexture( gl.TEXTURE_2D, texture );

    //Needed to flip the image from top to bottom due to the different
    //coordinate systems used for the image and by our application
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //How do we interpret a value of s or t outside of the range (0.0, 1.0)?
    //Generally, we want the texture either to repeat or to clamp the values to 0.0 or 1.0
    //By executing these functions after the gl.bindTexture, the parameters become part of the texture object
    //Other option for last parameter is gl.REPEAT, but that doesn't work here
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //Specify the array of the two-dimensional texture elements
    //target, level, iformat, format, type, image
    //target - lets us choose a single image or set up a cube map
    //level - mipmapping, where 0 denotes the highest resolution or that we are not using mipmapping
    //iformat - how to store the texture in memory
    //format and type - how the pixels are stored, so that WebGL knows how to read those pixels in
    //image - self-explanatory
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );

    //The size of the pixel that we are trying to color on the screen may be smaller or larger than one pixel
    //magnification - the texel is larger than one pixel
    //minification - the texture is smaller than one pixel
    //NEAREST - use the value of the nearest point sampling
    //LINEAR - linear filtering
    //mip-mapping - create a series of texture arrays at reduced sizes; webgl requires row and column
    //dimensions that are powers of two
    //gl.NEAREST_MIPMAP_NEAREST
    //use point sampling with the best mipmap, filtering with the best mipmap, point sampling using linear filtering
    //between mipmaps, or both (NEAREST_MIPMAP_LINEAR, LINEAR_MIPMAP_NEAREST, LINEAR_MIPMAP_LINEAR)
    //gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    //Link the texture object we create in the application to the sampler in the fragment shader
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// ------------------------------------

function configureCubeMap() {
    cubeMap = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, yellow);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, cyan);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, magenta);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, green);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

}


function configureCubeMapImage(xp, yp, zp, xn, yn, zn) {
    cubeMap = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, xp);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, yp);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, zp);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, xn);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, yn);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, zn);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

}

// This function returns the points that make the smaller hanger
function smallHanger() {
    var hVerts = [
        vec4(-3, -5, 0, 1.0),
        vec4(-3, -2, 0, 1.0),
        vec4(0, -2, 0, 1.0),
        vec4(0, 0, 0, 1.0),
        vec4(0, -2, 0, 1.0),
        vec4(3, -2, 0, 1.0),
        vec4(3, -5, 0, 1.0)
    ];
    return hVerts;


}

// This function returns the points that make the bigger hanger
function bigHanger() {
    var hVerts = [
        vec4(-5, -1, 0, 1.0),
        vec4(-5, 1, 0, 1.0),
        vec4(0, 1, 0, 1.0),
        vec4(0, 4, 0, 1.0),
        vec4(0, 1, 0, 1.0),
        vec4(5, 1, 0, 1.0),
        vec4(5, -1, 0, 1.0)
    ];

    for (var i = 0; i < hVerts.length; i++) {
        hangerNormals.push(vec4(0, 1, 0, 0));
        texCoordsArrayHanger.push(texCoord[0]);
    }
    return hVerts;
}

// creates the array with the points and normals of the cubes
function cube() {
    pointsArray = [];
    var verts = [];
    orderVertices = []; // we update it in the quad function
    normalsArray = [];


    for (var i = 0; i < 8; i++) {
        map.set(i.toString(), []);
    }

    verts = verts.concat(quad(1, 0, 3, 2));
    verts = verts.concat(quad(2, 3, 7, 6));
    verts = verts.concat(quad(3, 0, 4, 7));
    verts = verts.concat(quad(6, 5, 1, 2));
    verts = verts.concat(quad(4, 5, 6, 7));
    verts = verts.concat(quad(5, 4, 0, 1));

    pointsArray = verts;
}

// auxiliar function of the cube() one, that adds the triangles in the desired order to create faces.
function quad(a, b, c, d) //a, b, c , d are numbers (the position of the vertices that form a face in the vertices array)
{
    texCoordsArrayCube.push(texCoord[0]);
    texCoordsArrayCube.push(texCoord[1]);
    texCoordsArrayCube.push(texCoord[2]);
    texCoordsArrayCube.push(texCoord[0]);
    texCoordsArrayCube.push(texCoord[2]);
    texCoordsArrayCube.push(texCoord[3]);
    var verts = [];

    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var indices = [a, b, c, a, c, d];
    var n = newellMethod(vertices[a], vertices[b], vertices[c]);

    for (var i = 0; i < indices.length; ++i) {
        var v = vertices[indices[i]];
        verts.push(v);
        normalsArray.push(vec4(v[0], v[1], v[2], 0.0));
        cubeNormalsFlat.push(vec4(n[0], n[1], n[2], 0.0));

    }
    return verts;
}

// returns the normal of a triangle
function newellMethod(a, b, c) { // a, b, c are vertices
    var nx = (a[1] - b[1]) * (a[2] + b[2]) + (b[1] - c[1]) * (b[2] + c[2]) + (c[1] - a[1]) * (c[2] + a[2]);
    var ny = (a[2] - b[2]) * (a[0] + b[0]) + (b[2] - c[2]) * (b[0] + c[0]) + (c[2] - a[2]) * (c[0] + a[0]);
    var nz = (a[0] - b[0]) * (a[1] + b[1]) + (b[0] - c[0]) * (b[1] + c[1]) + (c[0] - a[0]) * (c[1] + a[1]);

    var norm = Math.sqrt(nx * nx + ny * ny + nz * nz);

    return vec3(nx / norm, ny / norm, nz / norm); // normalized normal vectors
}

// creates the array with the points and normals of the spheres
function triangle(a, b, c) {

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // normals are vectors

    normalsArray.push(a[0], a[1], a[2], 0.0);
    normalsArray.push(b[0], b[1], b[2], 0.0);
    normalsArray.push(c[0], c[1], c[2], 0.0);

    texCoordsArraySphere.push(texCoord[0]);
    texCoordsArraySphere.push(texCoord[1]);
    texCoordsArraySphere.push(texCoord[2]);

    index += 3;

}

// divides the faces of a poliedra until it creates a sphere
function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    } else {
        triangle(a, b, c);
    }
}

// the recursive function to create the faces of the sphere
function tetrahedron(a, b, c, d, n) {
    pointsArray = [];
    normalsArray = [];
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}


// **EXTRA CREDIT 1**
// I added the feature to be able to move the spotlight along the x and y axis.
// The keys are the following:
// 'd' to move the spotlight in the positive X direction
// 'a' to move the spotlight in the negative X direction
// 'w' to move the spotlight in the positive Y direction
// 's' to move the spotlight in the negative Y direction

// **EXTRA CREDIT 2**
// I added the feature to be able to increment/decrement the speed of the animation.
// If the key 'e' is maintained enough time, the animation will be rotating in the opposite direction.
// The animation can even be stopped when the speed (theta) is 0.
// The keys are the following:
// 'r' to increment the speed
// 'e' to decrement the speed

// main function
window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }


    gl.viewport(0, 0, canvas.width, canvas.height);

    // we enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //
    //  Load shaders
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

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

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "viewMatrix");

    gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
    projectionMatrix = perspective(fovy, 1, .1, 100);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // we compute the points and the normals of the cubes and spheres in model coordinates.
    cube();
    cubePoints = pointsArray;
    cubeNormals = normalsArray;

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    spherePoints = pointsArray;
    sphereNormals = normalsArray;

    var increm = 2;

    // we set functionality of the pressed keys
    window.onkeypress = function (event) {
        var key = event.key;
        switch (key) {
            case 'p':
                spotRad -= 0.005;
                break;
            case 'P':
                spotRad += 0.005;
                break;
            case 'm': // gourand
                console.log("gourand");
                shadeType.gourand = true;
                shadeType.flat = false;
                break;
            case 'M': // flat
                console.log("flat");
                shadeType.gourand = false;
                shadeType.flat = true;
                break;
            case 'j':
                spotXPos += 0.1;
                break;
            case 'l':
                spotXPos -= 0.1;
                break;
            case 'i':
                spotYPos += 0.1;
                break;
            case 'k':
                spotYPos -= 0.1;
                break;
            case 'r':
                THETA_INCREMENT += 0.1;
                break;
            case 'e':
                THETA_INCREMENT -= 0.1;
                break;
            case 'c':
                isRefl = !isRefl;
                console.log(isRefl);
                break;
            case 'd':
                isRefr = !isRefr;
                console.log(isRefr);
                break;
            case '1':
                xEye += increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;
            case '2':
                xEye -= increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;
            case '3':
                yEye += increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;
            case '4':
                yEye -= increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;
            case '5':
                zEye += increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;
            case '6':
                zEye -= increm;
                gl.uniformMatrix4fv(viewMatrix, false, flatten(lookAt(eye, at, up)));
                break;

        }
    };




    imageXp.crossOrigin = "";
    imageXp.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposx.bmp";

    imageYp.crossOrigin = "";
    imageYp.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposy.bmp";

    imageZp.crossOrigin = "";
    imageZp.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvposz.bmp";

    imageXn.crossOrigin = "";
    imageXn.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegx.bmp";

    imageYn.crossOrigin = "";
    imageYn.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegy.bmp";

    imageZn.crossOrigin = "";
    imageZn.src = "http://web.cs.wpi.edu/~jmcuneo/env_map_sides/nvnegz.bmp";

    imagesLoaded = 0;
    imageXp.onload = function() {};
    imageYp.onload = function() {};
    imageZp.onload = function() {};
    imageXn.onload = function() {};
    imageYn.onload = function() {};
    imageZn.onload = function() {configureCubeMapImage(imageXp, imageYp, imageZp, imageXn, imageYn, imageZn);};

    configureCubeMap();


    var image = new Image();
    image.crossOrigin = "";
    //image.src = "http://web.cs.wpi.edu/~jmcuneo/grass.bmp";
    image.src = "https://web.cs.wpi.edu/~jmcuneo/a.jpg";
    //image.src = "SA2011_black.gif";
    image.onload = function() {
        configureTextureWalls( image );
    };

    render();
};

function drawWallsAndFloor() {

    var grey = vec4(0.9, 0.9, 0.9, 1.0);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(floorPoints), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var colorLoc = gl.getUniformLocation(program, "vColor");
    gl.uniform4fv(colorLoc, flatten(grey));

    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(floorNormals), gl.STATIC_DRAW);


    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    //console.log(floorPoints.length);
    //console.log(floorNormals.length);
    //console.log(texCoordsArray.length);
    createATexture();

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


}

var id;

// this is what happens every frame of our animation
function render() {

    console.log();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /*if (!textureRendered && imagesLoaded === 6) {
        configureCubeMapImage(imageXp, imageYp, imageZp, imageXn, imageYn, imageZn);
        textureRendered = true;
    }*/
    // depending on what shading we want, we choose an array of normals or the other.
    var normalsToUse = [];
    if (shadeType.gourand) {
        normalsToUse = cubeNormals;
    } else if (shadeType.flat) {
        normalsToUse = cubeNormalsFlat;
    }

    theta += THETA_INCREMENT;
    modelMatrix = translate(0, 2, 0);
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    stack = [];
    var wallTexturing = true;
    gl.uniform1f(gl.getUniformLocation(program, "wallTexturing"), wallTexturing);
    var wantTexture = false;
    gl.uniform1f(gl.getUniformLocation(program, "wantTexture"), wantTexture);


    drawWallsAndFloor();
    var translateWall1 = mult(translate(-0.5, 0, 0), rotateZ(90));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, translateWall1)));
    drawWallsAndFloor();

    var translateWall2 = mult(translate(-20, 0, 0), rotateZ(90));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, translateWall2)));
    drawWallsAndFloor();

    //var translateWall3 = mult(translate(-20, 0, 0), rotateX(90));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, rotateX(90))));
    drawWallsAndFloor();

    //var translateWall3 = mult(translate(-20, 0, 0), rotateX(90));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, translate(0, 20, 0))));
    drawWallsAndFloor();

    wallTexturing = false;
    gl.uniform1f(gl.getUniformLocation(program, "wallTexturing"), wallTexturing);
    wantTexture = true;
    gl.uniform1f(gl.getUniformLocation(program, "wantTexture"), wantTexture);
    // top orange sphere
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, translate(0.0, 4.0, 0.0))));
    draw(false, false, vec4(1.0, 1.0, 0.0, 1.0), spherePoints, sphereNormals);
    stack.push(modelMatrix); // this is only the modelMatrix = translate(0, 2, 0); we want all the objects to do this

    modelMatrix = mult(modelMatrix, rotateY(-theta)); // rotation of the bigger hanger
    stack.push(modelMatrix);

    // big hanger
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(false, true, vec4(1.0, 1.0, 1.0, 1.0), bigHanger(), hangerNormals);

    //red cube
    //before doing any transformation on the red cube, it is in model coordinates and we can rotate the cube
    modelMatrix = mult(modelMatrix, translate(5.0, -1.0, 0.0));
    modelMatrix = mult(modelMatrix, rotateY(theta * 7));
    stack.push(modelMatrix);
    //var auxMat1 = mult(translate(5.0, -1.0, 0.0), rotateY(theta*3));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(true, false, vec4(1.0, 0.0, 0.0, 1.0), cubePoints, normalsToUse);


    //small hanger cubes
    modelMatrix = mult(modelMatrix, rotateY(theta * 3));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(false, true, vec4(1.0, 1.0, 1.0, 1.0), smallHanger(), hangerNormals);
    stack.push(modelMatrix);

    // green cube
    modelMatrix = mult(modelMatrix, translate(3, -5, 0));
    modelMatrix = mult(modelMatrix, rotateY(theta * 30));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(true, false, vec4(0.0, 1.0, 0.0, 1.0), cubePoints, normalsToUse);

    // orange cube
    modelMatrix = stack.pop();
    modelMatrix = mult(modelMatrix, translate(-3.0, -5.0, 0.0));
    modelMatrix = mult(modelMatrix, rotateY(theta * 30));
    //var auxMat6 = mult(translate(2.0, -6.0, 0.0), rotateY(theta*30));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(true, false, vec4(0.9, 0.9, 0.9, 1.0), cubePoints, normalsToUse);

    // purple sphere
    stack.pop();
    modelMatrix = stack.pop();
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mult(modelMatrix, translate(-5.0, -1.0, 0.0))));
    draw(false, false, vec4(0.3, 0.3, 1.0, 1.0), spherePoints, sphereNormals);
    stack.push(modelMatrix);

    //small hanger spheres
    modelMatrix = mult(modelMatrix, translate(-5, -1, 0));
    modelMatrix = mult(modelMatrix, rotateY(theta * 3));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(false, true, vec4(1.0, 1.0, 1.0, 1.0), smallHanger(), hangerNormals);
    stack.push(modelMatrix);

    // yellow sphere
    modelMatrix = mult(modelMatrix, translate(-3.0, -5.0, 0.0));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(false, false, vec4(1.0, 1.0, 1.0, 1.0), spherePoints, sphereNormals);

    // brown sphere
    modelMatrix = stack.pop(modelMatrix);
    modelMatrix = mult(modelMatrix, translate(3.0, -5.0, 0.0));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    draw(false, false, vec4(0.5, 0.5, 0.5, 1.0), spherePoints, sphereNormals);

    //drawWallsAndFloor();

    id = requestAnimationFrame(render);
}


function draw(isCube, isHanger, color, points, normals) {

    //console.log(points.length);
    // console.log(normals.length);
    // console.log(texCoord.length);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var colorLoc = gl.getUniformLocation(program, "vColor");
    gl.uniform4fv(colorLoc, flatten(color));

    gl.uniform1f(gl.getUniformLocation(program, "spot"), spotRad);
    gl.uniform1f(gl.getUniformLocation(program, "spotXPos"), spotXPos);
    gl.uniform1f(gl.getUniformLocation(program, "spotYPos"), spotYPos);
    gl.uniform1f(gl.getUniformLocation(program, "isRefl"), isRefl);
    gl.uniform1f(gl.getUniformLocation(program, "isRefr"), isRefr);


    var texCoordToUse = [];
    if (isCube) {
        texCoordToUse = texCoordsArrayCube;
    } else if (isHanger) {
        texCoordToUse = texCoordsArrayHanger;
    } else { // sphere
        texCoordToUse = texCoordsArraySphere;
    }
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordToUse), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    if (isCube) {
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    } else if (isHanger) {
        gl.drawArrays(gl.LINE_STRIP, 0, 7);
    } else {
        for (var i = 0; i < index; i += 3)
            gl.drawArrays(gl.TRIANGLES, i, 3);
    }


}