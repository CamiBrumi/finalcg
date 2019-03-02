Computer Graphics
Final Project Part 1
Camelia Daniela Brumar

The code is structured in the following way:
- the main is the function
    window.onload = function init()
  Where we load the shaders, we create the points and the normals for our objects, and we set the actions to be performed when the keys are pressed.
  At the very end of this function we call render().
- In render we choose what set of normals we want to use for the cubes, depending on what shading we want, flat or Gourand.
  Afterwards we start the part with the hierarchy and the moving objects.
- The draw method is called from render and it is where we initialize the buffers and some of the uniform variables from the shaders.
- The methods smallHanger, bigHanger, cube, quad, newellMethod, triangle, divideTriangle and tetrahedron are used to create the hangers, cubes and the spheres.


// ** EXTRA CREDIT 1 **
// I added the feature to be able to move the spotlight along the x and y axis.
// The keys are the following:
// 'd' to move the spotlight in the positive X direction
// 'a' to move the spotlight in the negative X direction
// 'w' to move the spotlight in the positive Y direction
// 's' to move the spotlight in the negative Y direction


// ** EXTRA CREDIT 1 **
// I added the feature to be able to move the spotlight along the x and y axis.
// The keys are the following:
// 'd' to move the spotlight in the positive X direction
// 'a' to move the spotlight in the negative X direction
// 'w' to move the spotlight in the positive Y direction
// 's' to move the spotlight in the negative Y direction

// ** EXTRA CREDIT 2 **
// I added the feature to be able to increment/decrement the speed of the animation.
// If the key 'e' is pressed enough time, the animation will be rotating in the opposite direction.
// The animation can even be stopped when the speed (theta) is 0.
// The keys are the following:
// 'r' to increment the speed
// 'e' to decrement the speed
