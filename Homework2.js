// ========================================================================
// Initalizing the global variables
// ========================================================================
var canvas
var gl

var projectionMatrix
var modelViewMatrix
var instanceMatrix
var modelViewMatrixLoc

var texture1, texture2;
var c;
var flagLoc;

var vColor
var vTextCoord;

var vBuffer
var tBuffer
var cBuffer

var modelViewLoc

var colors = [];
var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var texSize = 256;
var numChecks = 8;

var numVertices = 24;

var flagColorChange = true;

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

var vertexColors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(0.0, 1.0, 1.0, 1.0),  // white
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var texCoord = [
  vec2(0, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(1, 0)
];

// ==========================================================================
//  TEXTURE IMAGE
// ==========================================================================

var image1 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) {
  for (var j = 0; j < texSize; j++) {
    var patchx = Math.floor(i / (texSize / numChecks));
    var patchy = Math.floor(j / (texSize / numChecks));
    if (patchx % 2 ^ patchy % 2) c = 255;
    else c = 0;
    //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
    image1[4 * i * texSize + 4 * j] = c;
    image1[4 * i * texSize + 4 * j + 1] = c;
    image1[4 * i * texSize + 4 * j + 2] = c;
    image1[4 * i * texSize + 4 * j + 3] = 255;
  }
}

var image2 = new Uint8Array(4 * texSize * texSize);

// Create a checkerboard pattern
for (var i = 0; i < texSize; i++) {
  for (var j = 0; j < texSize; j++) {
    // var c = 127 + 127 * Math.sin(0.1*i*j);
    var f = 200 - j / 2;
    image2[4 * i * texSize + 4 * j] = -f;
    image2[4 * i * texSize + 4 * j + 1] = -f;
    image2[4 * i * texSize + 4 * j + 2] = -f;
    image2[4 * i * texSize + 4 * j + 3] = 255

    // image2[4*i*texSize+4*j] = -i;
    // image2[4*i*texSize+4*j+1] = -i;
    // image2[4*i*texSize+4*j+2] = -i;
    // image2[4*i*texSize+4*j+3] = 255;
  }
}

function configureTexture() {
  texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

// Setting the IDs for our ease
var torsoId = 0
var neckId = 1
var leftFrontLegId = 2
var rightFrontLegId = 3
var leftBackLegId = 4
var rightBackLegId = 5
var headId = 6
var tailId = 7

var leftFrontFootId = 8
var rightFrontFootId = 9
var leftBackFootId = 10
var rightBackFootId = 11

// Setting the dimensions of body parts
var torsoHeight = 4
var torsoWidth = 8.0
var frontLegHeight = 5.0
var frontLegWidth = 1.2
var backLegHeight = 5.0
var backLegWidth = 1.2


var neckHeight = 4
var neckWidth = 1.7
var headHeight = 3.5
var headWidth = 1.2
var tailHeight = 5
var tailWidth = 0.5

var frontFootHeight = 3.0
var frontFootWidth = 0.7
var backFootHeight = 3.0
var backFootWidth = 0.7

// Number of nodes in the hierarchy
var numNodes = 12
// The angles for the legs, head and tail
var theta = [0, -25, 190, 170, 190, 170, -90, 150, -5, -5, 180, 190]
//var theta=[0,  1,   2,   3,   4,   5,   6,   7,   8,   9,   10,  11]
var thetaDefault = [0, -25, 180, 180, 180, 180, -90, 150, 180, 180, 180, 180]

// var stack
// var figure

// Some variables used for animations
var cam = -30
var horizontalPosition = -20
var verticalPosition = -0.1
var horizontalSpeed = 0.3
var rotationSpeed = 1
var atEnd = false
var animate = false
var smoothness = false

// ***************************************************
// Setting the IDs for the obstacle parts
// ***************************************************

var upperHorizontalPoolId = 0;
var bottomHorizontalPoolId = 1;
var leftUpperVerticalePoolId = 2;
var rightUpperVerticalePoolId = 3;

// ***************************************************
// Dimensions of obstacle parts
// ***************************************************

var horizontalPoolHeight = 6.0;
var horizontalPoolWidth = 1.5;
var verticalePoolHeight = 8.0;
var verticalePoolWidth = 1.0;

var numPoolNodes = 4;
var numPoolAngles = 4;

var thetaPool = [90, 90, 90, 180];

//******************************************** */

var stack = [];
var figure = [];
var obstacle = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);
for (var i = 0; i < numPoolNodes; i++) obstacle[i] = createNode(null, null, null, null);

function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

// ==========================================================================
//  CREATE NODE FUNCTION
// ==========================================================================
function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;

}

// ==========================================================================
//  FUNCTION to initialize nodes
// ==========================================================================
function initNodes(Id) {
  var m = mat4();

  switch (Id) {
    case torsoId:
      m = translate(horizontalPosition, verticalPosition, 0.0)
      figure[torsoId] = createNode(m, torso, null, neckId);
      break;

    case neckId:
      m = translate(0.39 * torsoWidth, 0.75 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[neckId], 0, 0, 1))
      figure[neckId] = createNode(m, neck, leftFrontLegId, headId);
      break;

    case headId:
      m = translate(-0.5 * neckWidth, 1 * neckHeight, 0.0);
      m = mult(m, rotate(theta[headId], 0, 0, 1))
      figure[headId] = createNode(m, head, null, null);
      break;

    case leftFrontLegId:
      m = translate((0.5 * torsoWidth - 0.5 * frontLegWidth) - 0.1, 0.5, 0.0);
      m = mult(m, rotate(theta[leftFrontLegId], 0, 0, 1));
      figure[leftFrontLegId] = createNode(m, leftFrontLeg, rightFrontLegId, leftFrontFootId);
      break;

    case rightFrontLegId:
      m = translate(0.5 * torsoWidth - 0.5 * frontLegWidth, 0.5, 0.0);
      m = mult(m, rotate(theta[rightFrontLegId], 0, 0, 1));
      figure[rightFrontLegId] = createNode(m, rightFrontLeg, leftBackLegId, rightFrontFootId); //rightFrontFootId
      break;

    case leftBackLegId:
      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth - 0.1), 0.5, 0.0);
      m = mult(m, rotate(theta[leftBackLegId], 0, 0, 1));
      figure[leftBackLegId] = createNode(m, leftBackLeg, rightBackLegId, leftBackFootId); //leftBackFootId
      break;

    case rightBackLegId:
      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth), 0.5, 0.0);
      m = mult(m, rotate(theta[rightBackLegId], 0, 0, 1));
      figure[rightBackLegId] = createNode(m, rightBackLeg, tailId, rightBackFootId); //rightBackFootId
      break;

    case leftFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[leftFrontFootId], 0, 0, 1));
      figure[leftFrontFootId] = createNode(m, leftFrontFoot, null, null);
      break;

    case rightFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[rightFrontFootId], 0, 0, 1));
      figure[rightFrontFootId] = createNode(m, rightFrontFoot, null, null);
      break;

    case leftBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[leftBackFootId], 0, 1, 0));
      figure[leftBackFootId] = createNode(m, leftBackFoot, null, null);
      break;

    case rightBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[rightBackFootId], 0, 1, 0));
      figure[rightBackFootId] = createNode(m, rightBackFoot, null, null);
      break;

    case tailId:
      m = translate(-0.5 * torsoWidth + 0.2, 0.93 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[tailId], 0, 0, 1));
      figure[tailId] = createNode(m, tail, null, null);
      break;
  }
}

// **********************************************
//  Create Nodes for Obstacles
// **********************************************
function initNodes2(Id) {

  var m = mat4();
  switch (Id) {

    case upperHorizontalPoolId:
      m = mult(m, translate(15, 0, 0, 0));
      m = mult(m, rotate(thetaPool[upperHorizontalPoolId], 0, 0, 1));
      obstacle[upperHorizontalPoolId] = createNode(m, upperHorizontalPool, bottomHorizontalPoolId, leftUpperVerticalePoolId); //leftUpperVerticalePoolId
      break;

    case bottomHorizontalPoolId:
      m = mult(m, translate(15, -5, 0, 0));
      m = mult(m, rotate(thetaPool[bottomHorizontalPoolId], 0, 0, 1));
      obstacle[bottomHorizontalPoolId] = createNode(m, bottomHorizontalPool, rightUpperVerticalePoolId, null); //rightUpperVerticalePoolId
      break;

    case leftUpperVerticalePoolId:
      m = mult(m, translate(2, 0, 0, 0));
      m = mult(m, rotate(thetaPool[leftUpperVerticalePoolId], 0, 0, 1));
      obstacle[leftUpperVerticalePoolId] = createNode(m, leftUpperVerticalePool, null, null); //bottomHorizontalPoolId
      break;

    case rightUpperVerticalePoolId:
      m = mult(m, translate(8, 2, 0, 0));
      m = mult(m, rotate(thetaPool[rightUpperVerticalePoolId], 1, 0, 0));
      obstacle[rightUpperVerticalePoolId] = createNode(m, rightUpperVerticalePool, null, null);
      break;

  }
}

// ***************************************
//  FUNCTION to traverse on hierarchy tree (horse)
// ***************************************
function traverse(Id) {
  if (Id == null)
    return;

  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();

  if (figure[Id].child != null)
    traverse(figure[Id].child);

  modelViewMatrix = stack.pop();

  if (figure[Id].sibling != null)
    traverse(figure[Id].sibling);
}

// *****************************************
// (Obstacle)
// *****************************************
function traverse2(Id) {

  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, obstacle[Id].transform);
  obstacle[Id].render();
  if (obstacle[Id].child != null) traverse2(obstacle[Id].child);
  modelViewMatrix = stack.pop();
  if (obstacle[Id].sibling != null) traverse2(obstacle[Id].sibling);
}

// ****************************************
//  RENDER FUNCTIONS for each body part
// ****************************************
function torso() {
  configureTexture();
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0));
  instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function neck() {
  gl.deleteTexture(texture2);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * neckHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(neckWidth, neckHeight, neckWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function head() {
  gl.deleteTexture(texture2);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function leftFrontLeg() {
  // configureTexture();
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontLegWidth, frontLegHeight, frontLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function rightFrontLeg() {
  // configureTexture();
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontLegWidth, frontLegHeight, frontLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function leftBackLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * backLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(backLegWidth, backLegHeight, backLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function rightBackLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * backLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(backLegWidth, backLegHeight, backLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function leftFrontFoot() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}
function rightFrontFoot() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftBackFoot() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}


function rightBackFoot() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * frontFootHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(frontFootWidth, frontFootHeight, frontFootWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function tail() {
  gl.deleteTexture(texture2);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// *************************************
//  RENDER FUNCTIONS to draw obstacle
// *************************************

function upperHorizontalPool() {
  configureTexture();
  
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * horizontalPoolHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(horizontalPoolWidth, horizontalPoolHeight, horizontalPoolWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function bottomHorizontalPool() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * horizontalPoolHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(horizontalPoolWidth, horizontalPoolHeight, horizontalPoolWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperVerticalePool() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * verticalePoolHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(verticalePoolWidth, verticalePoolHeight, verticalePoolWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperVerticalePool() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * verticalePoolHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(verticalePoolWidth, verticalePoolHeight, verticalePoolWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

// *************************************
//  RENDER FUNCTIONS to draw ground line
// *************************************
function drawLine() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, -(0.6 * torsoHeight + 0.7 * backLegHeight), 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(2 * cam, 0.2, 2))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// ***********************************
// Function to Add the texture
// ***********************************

function quad(a, b, c, d) {
  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[b]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[2]);

  pointsArray.push(vertices[d]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[3]);
}

function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}
var neckRotationCC = false
var legForward = true
var facingRight = true
var goUp = true
var isJumping = false

// ****************************************
//  RUN FUNCTION
// ****************************************

function run() {
  var m = mat4()
  // console.log('start' +horizontalPosition);
  //horizontalPosition > -cam - 7.5 || horizontalPosition < cam + 7.5
  if (horizontalPosition > -cam - 7.5 || horizontalPosition < cam + 7.5) {
    atEnd = true;
  }

  if (atEnd) {
    if (horizontalPosition > -cam - 7.5 && !facingRight) {
      horizontalPosition -= 0.6
      atEnd = false
    } else if (horizontalPosition < cam + 7.5 && facingRight) {
      horizontalPosition += 0.6
      atEnd = false
    }
  } else {
    horizontalPosition += 0.6

    if (horizontalPosition == -1.3999999999999981) {
      smoothness = true;
      isJumping = true;
      jump();
      m = translate(horizontalPosition, verticalPosition, 0.0)
      figure[torsoId] = createNode(m, torso, null, neckId)
    } else if (horizontalPosition > 15) {
      goUp = false;
      smoothness = false;
      jump();
    }

    if (smoothness == false) {
      // console.log(horizontalPosition);
      if (neckRotationCC) {
        theta[neckId] += 1
        theta[tailId] -= 0.5
      } else {
        theta[neckId] -= 1
        theta[tailId] += 0.5
      }
      if (legForward) {
        theta[rightFrontLegId] += 2.1
        theta[rightBackLegId] -= 3.1
        theta[leftFrontLegId] += 3.1
        theta[leftBackLegId] -= 2.1

        theta[rightFrontFootId] += 2.1
        theta[rightBackFootId] -= 3.1
        theta[leftFrontFootId] += 3.1
        theta[leftBackFootId] -= 2.1

      } else {
        theta[rightFrontLegId] -= 2.1
        theta[rightBackLegId] += 3.1
        theta[leftFrontLegId] -= 3.1
        theta[leftBackLegId] += 2.1

        theta[rightFrontFootId] -= 2.1
        theta[rightBackFootId] += 3.1
        theta[leftFrontFootId] -= 3.1
        theta[leftBackFootId] += 2.1
      }

      if (theta[leftFrontLegId] < 150) {
        neckRotationCC = false
      }

      else if (theta[leftFrontLegId] >= 210) {
        neckRotationCC = true
      }
      if (theta[leftFrontLegId] < 150) {
        legForward = true
      }
      else if (theta[leftFrontLegId] >= 210) {
        legForward = false
      }
      m = translate(horizontalPosition, verticalPosition, 0.0)
      figure[torsoId] = createNode(m, torso, null, neckId)


      //  NODES WITH UPDATED TRANSFORMS
      m = translate(0.39 * torsoWidth, 0.75 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[neckId], 0, 0, 1))
      figure[neckId] = createNode(m, neck, leftFrontLegId, headId);

      m = translate(-0.5 * neckWidth, 1 * neckHeight, 0.0);
      m = mult(m, rotate(theta[headId], 0, 0, 1))
      figure[headId] = createNode(m, head, null, null);

      m = translate((0.5 * torsoWidth - 0.5 * frontLegWidth) - .1, 0.5, 0.0);
      m = mult(m, rotate(theta[leftFrontLegId], 0, 0, 1));
      figure[leftFrontLegId] = createNode(m, leftFrontLeg, rightFrontLegId, leftFrontFootId);

      m = translate(0.5 * torsoWidth - 0.5 * frontLegWidth, 0.5, 0.0);
      m = mult(m, rotate(theta[rightFrontLegId], 0, 0, 1));
      figure[rightFrontLegId] = createNode(m, rightFrontLeg, leftBackLegId, rightFrontFootId);

      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth - 0.1), 0.5, 0.0);
      m = mult(m, rotate(theta[leftBackLegId], 0, 0, 1));
      figure[leftBackLegId] = createNode(m, leftBackLeg, rightBackLegId, leftBackFootId);

      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth), 0.5, 0.0);
      m = mult(m, rotate(theta[rightBackLegId], 0, 0, 1));
      figure[rightBackLegId] = createNode(m, rightBackLeg, tailId, rightBackFootId);

      m = translate(-0.5 * torsoWidth + 0.2, 0.93 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[tailId], 0, 0, 1));
      figure[tailId] = createNode(m, tail, null, null);

      // case leftFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[leftFrontFootId], 0, 0, 1));
      figure[leftFrontFootId] = createNode(m, leftFrontFoot, null, null);

      // case rightFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[rightFrontFootId], 0, 0, 1));
      figure[rightFrontFootId] = createNode(m, rightFrontFoot, null, null);

      // case leftBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[leftBackFootId], 0, 1, 0));
      figure[leftBackFootId] = createNode(m, leftBackFoot, null, null);

      // case rightBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[rightBackFootId], 0, 1, 0));
      figure[rightBackFootId] = createNode(m, rightBackFoot, null, null);
    }
    else {
      m = translate(horizontalPosition, verticalPosition, 0.0)
      figure[torsoId] = createNode(m, torso, null, neckId)


      //  NODES WITH UPDATED TRANSFORMS
      m = translate(0.39 * torsoWidth, 0.75 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[neckId], 0, 0, 1))
      figure[neckId] = createNode(m, neck, leftFrontLegId, headId);

      m = translate(-0.5 * neckWidth, 1 * neckHeight, 0.0);
      m = mult(m, rotate(theta[headId], 0, 0, 1))
      figure[headId] = createNode(m, head, null, null);

      m = translate((0.5 * torsoWidth - 0.5 * frontLegWidth) - .1, 0.5, 0.0);
      m = mult(m, rotate(theta[leftFrontLegId], 0, 0, 1));
      figure[leftFrontLegId] = createNode(m, leftFrontLeg, rightFrontLegId, leftFrontFootId);

      m = translate(0.5 * torsoWidth - 0.5 * frontLegWidth, 0.5, 0.0);
      m = mult(m, rotate(theta[rightFrontLegId], 0, 0, 1));
      figure[rightFrontLegId] = createNode(m, rightFrontLeg, leftBackLegId, rightFrontFootId);

      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth - 0.1), 0.5, 0.0);
      m = mult(m, rotate(theta[leftBackLegId], 0, 0, 1));
      figure[leftBackLegId] = createNode(m, leftBackLeg, rightBackLegId, leftBackFootId);

      m = translate(-(0.5 * torsoWidth - 0.5 * frontLegWidth), 0.5, 0.0);
      m = mult(m, rotate(theta[rightBackLegId], 0, 0, 1));
      figure[rightBackLegId] = createNode(m, rightBackLeg, tailId, rightBackFootId);

      m = translate(-0.5 * torsoWidth + 0.2, 0.93 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[tailId], 0, 0, 1));
      figure[tailId] = createNode(m, tail, null, null);

      // case leftFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[leftFrontFootId], 0, 0, 1));
      figure[leftFrontFootId] = createNode(m, leftFrontFoot, null, null);

      // case rightFrontFootId:
      m = translate(0.0, frontLegHeight - 1.5, 0.0);
      m = mult(m, rotate(theta[rightFrontFootId], 0, 0, 1));
      figure[rightFrontFootId] = createNode(m, rightFrontFoot, null, null);

      // case leftBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[leftBackFootId], 0, 1, 0));
      figure[leftBackFootId] = createNode(m, leftBackFoot, null, null);

      // case rightBackFootId:
      m = translate(0.0, backFootHeight, 0.0);
      m = mult(m, rotate(theta[rightBackFootId], 0, 1, 0));
      figure[rightBackFootId] = createNode(m, rightBackFoot, null, null);

}
}
}

// ****************************************
// JUMP FUNCTION
// ****************************************
function jump() {

  if (goUp && isJumping) {
    if (verticalPosition < 20) {
      verticalPosition += 8.5
    } else if (verticalPosition >= 2 && verticalPosition < 5) {
      verticalPosition += 0.3
    } else if (verticalPosition >= 5 && verticalPosition < 7) {
      verticalPosition += 0.17
    } else if (verticalPosition >= 7 && verticalPosition < 8) {
      verticalPosition += 0.12
    } else if (verticalPosition >= 8 && verticalPosition < 9) {
      verticalPosition += 0.09
    } else if (verticalPosition >= 9 && verticalPosition < 9.8) {
      verticalPosition += 0.07
    } else if (verticalPosition >= 9.8) {
      verticalPosition += 0.05
    }
  } else if (!goUp && isJumping) {
    if (verticalPosition < 20) {
      verticalPosition -= 8.5
    } else if (verticalPosition >= 2 && verticalPosition < 5) {
      verticalPosition -= 0.3
    } else if (verticalPosition >= 5 && verticalPosition < 7) {
      verticalPosition -= 0.17
    } else if (verticalPosition >= 7 && verticalPosition < 8) {
      verticalPosition -= 0.12
    } else if (verticalPosition >= 8 && verticalPosition < 9) {
      verticalPosition -= 0.09
    } else if (verticalPosition >= 9 && verticalPosition < 9.8) {
      verticalPosition -= 0.07
    } else if (verticalPosition >= 9.8) {
      verticalPosition -= 0.05
    }
  }
  // If at top, go down, else go up
  if (verticalPosition > 20) {
    goUp = false
  } else if (verticalPosition < 0) {
    goUp = true
    isJumping = false
  }

  // CREATING NODES WITH UPDATED TRANSFORMS
  var m = mat4()
  if (facingRight) {
    m = translate(horizontalPosition, verticalPosition, 0)
    figure[torsoId] = createNode(m, torso, null, neckId)
  } else {
    m = translate(horizontalPosition, verticalPosition, 0.0)
    m = mult(m, scale4(-1, 1, 0))
    figure[torsoId] = createNode(m, torso, null, neckId)
  }
}
// ****************************************
//  Initalizing GL variables
// ****************************************
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor( 0.0, 0.0, 0.0, 0.85 );
  // gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);

  instanceMatrix = mat4();
  // projectionMatrix = ortho(cam, -cam, cam, -cam, -10.0, 10.0);
  // modelViewMatrix = mat4();

  // gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  // gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  // modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

  cube();

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

  vTextCoord = gl.getAttribLocation(program, "vTextCoord");
  gl.vertexAttribPointer(vTextCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTextCoord);

  // at init time make a 1x1 white texture.
  whiteTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, whiteTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([1, 0, 1, 1]));

  configureTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.uniform1i(gl.getUniformLocation(program, "texSampler0"), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.uniform1i(gl.getUniformLocation(program, "texSampler1"), 1);

  for (var i = 0; i < numNodes; i++)initNodes(i);
  for (i = 0; i < numPoolNodes; i++) initNodes2(i);

  document.getElementById("run").onclick = function (event) {
    animate = !animate;
  };

  var select = document.getElementById('colored')
    select.onchange = function () {
        var d = parseInt(this.options[this.selectedIndex].value);
        console.log(d);
        switch (d) {
            // default:
            // shadeFlag = true; //Gouraud
            case 1:
              flagColorChange = true; //Black and white
                break
            case 2:
              flagColorChange = false; //Colored
                break
        }
    }

  flagLoc = gl.getUniformLocation(program, 'flagColorChange');

  render();
  renderObstacle();
}

function render() {
  // var left = -30.0;
  // var right = 30.0;
  // var bottom = -20.0;
  // var ytop = 20.0;
  // var near = -30.0;
  // var far = 10.0

  gl.uniform1f(flagLoc, flagColorChange);

  eye = vec3(0, 0, 0);

  projectionMatrix = ortho(cam, -cam, cam, -cam, -10.0, 10.0);
  modelViewMatrix = mat4();
  // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
  modelViewMatrix = lookAt(eye, at, up);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
  gl.enableVertexAttribArray(vTextCoord);
  traverse(torsoId);
  if (animate) run();
  drawLine();
  requestAnimFrame(renderObstacle);
}

var renderObstacle = function () {
  eye = vec3(1, 0, 1)
  projectionMatrix = ortho(cam, -cam, cam, -cam, -10.0, 10.0);
  modelViewMatrix = mat4();
  modelViewMatrix = lookAt(eye, at, up);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

  // gl.disableVertexAttribArray(vTextCoord);
  traverse2(upperHorizontalPoolId);
requestAnimFrame(render);
}