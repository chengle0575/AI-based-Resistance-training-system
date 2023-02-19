import "virtual:windi.css";
import "virtual:windi-devtools";
import "./style.css";
import * as THREE from "three";
import * as Kalidokit from "kalidokit";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
/*
import {
  Holistic,
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
  FACEMESH_TESSELATION,
} from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
*/
import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";
import modelUrl from "./model/nainai.vrm";
import { GestureDetector } from "./gesture";
import { PageManager } from "./page_manager";
import { actionConfig } from "./actionConfig";
import { page13is } from "./page_manager";

/* SETUP OUR CODE */
const DEBUG_MODE = false;
let debugState = { keydown: false, actionId: 0, actionPosId: 0 };
document.addEventListener(
  "keydown",
  () => {
    debugState.keydown = true;
  },
  false
);

// Get canvas for bg and feedback
const bgCtx = getCtxById("bg-canvas");
const feedbackCtx = getCtxById("feedback-canvas");

let currentAngle = 0;
const rotateSpeed = 120;
const rotateIndicator = document.getElementById("rotate-indicator");

const gestureDetector = new GestureDetector();
const pageManager = new PageManager(bgCtx, feedbackCtx, gestureDetector);

// NOTE: These functions are used for animation transition
//Import Helper Functions from Kalidokit
const remap = Kalidokit.Utils.remap;
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

/* THREEJS WORLD SETUP */
let currentVrm;

const threeJsContainer = document.querySelector(".threejs-container");
const height = threeJsContainer.clientHeight;
const width = threeJsContainer.clientWidth;

// Get a canvas by element id
function getCtxById(id) {
  // This is hack...
  const e = document.getElementById(id);
  e.width = e.offsetWidth;
  e.height = e.offsetHeight;
  return e.getContext("2d");
}

// renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: threeJsContainer,
});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
//document.body.appendChild(renderer.domElement);

// camera change
const camPositionArray = [
  [0, -2, 0], //全身
  [0.0, 1.1, 1.2], //半身
];

const orbitCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
orbitCamera.position.set(
  camPositionArray[0][0],
  camPositionArray[0][1],
  camPositionArray[0][2]
);

// controls  orbitcontrol用来调整camera orbit around the object
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0.0, 1, 0);
//lock y-axis of the obit
orbitControls.minPolarAngle = Math.PI / 2;
orbitControls.maxPolarAngle = Math.PI / 2;

orbitControls.update();

// scene
const scene = new THREE.Scene();

//axes helper
function showAxiesHelper() {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}
//showAxiesHelper();

//camera helper
//const helper = new THREE.CameraHelper( orbitCamera );
//scene.add( helper );

//light
//const light1 = new THREE.DirectionalLight(0xffffff);
//light1.position.set(1.0, 1.0, 1.0).normalize();
//scene.add(light1);

const light = new THREE.PointLight("#FFADED", 1, 3);
light.position.set(0, -3, 0);
scene.add(light);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(100, 1000, 100);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

// Main Render Loop
const clock = new THREE.Clock();

function animate() {
  //change cam position
  if (page13is == 1) {
    orbitCamera.position.set(
      camPositionArray[1][0],
      camPositionArray[1][1],
      camPositionArray[1][2]
    );
  }

  requestAnimationFrame(animate);
  if (DEBUG_MODE) {
    if (debugState.actionId == actionConfig.length) {
      debugState.actionId = 0;
    }
    if (debugState.keydown) {
      debugState.actionPosId++;
      const action = actionConfig[debugState.actionId];
      console.log(action.actionName);
      if (debugState.actionPosId == action.actionPos.length) {
        debugState.actionPosId = 0;
        debugState.actionId++;
      }
      debugState.keydown = false;
    }
    const actionPos =
      actionConfig[debugState.actionId].actionPos[debugState.actionPosId];
    if (actionPos instanceof Function) {
      debugState.keydown = true;
    } else {
      pose(actionPos);
    }
  }

  const deltaTime = clock.getDelta();
  if (currentVrm) {
    // Update model to render physics
    currentVrm.update(deltaTime);
  }
  renderer.render(scene, orbitCamera);

  const rotateAmount = handsDistance() * rotateSpeed;
  currentAngle += rotateAmount;
  rotateIndicator.style.transform = "rotate(" + currentAngle + "deg)";
}
animate();

/* VRM CHARACTER SETUP */

// Import Character VRM
const loader = new GLTFLoader();
loader.crossOrigin = "anonymous";
// Import model from URL, add your own model here
loader.load(
  modelUrl,

  (gltf) => {
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    VRM.from(gltf).then((vrm) => {
      scene.add(vrm.scene);
      currentVrm = vrm;
      currentVrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera
    });
  },

  (progress) =>
    console.log(
      "Loading model...",
      100.0 * (progress.loaded / progress.total),
      "%"
    ),

  (error) => console.error(error)
);

function pose(actionPose) {
  if (!currentVrm) return;
  const puppet = currentVrm.humanoid;
  puppet.resetPose();
  actionPose.forEach((e) => {
    const { bone, pos } = e;
    const part = puppet.getBoneNode(VRMSchema.HumanoidBoneName[bone]);
    console.assert(part);
    const euler = new THREE.Euler(pos.x, pos.y, pos.z);
    const quater = new THREE.Quaternion().setFromEuler(euler);
    part.quaternion.copy(quater);
  });
}

// NOTE: The function is used for animation transition
// Animate Rotation Helper function
const rigRotation = (
  name,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {
    return;
  }
  const Part = currentVrm.humanoid.getBoneNode(
    VRMSchema.HumanoidBoneName[name]
  );
  if (!Part) {
    return;
  }

  let euler = new THREE.Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (
  name,
  position = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {
    return;
  }
  const Part = currentVrm.humanoid.getBoneNode(
    VRMSchema.HumanoidBoneName[name]
  );
  if (!Part) {
    return;
  }
  let vector = new THREE.Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};

let oldLookTarget = new THREE.Euler();
const rigFace = (riggedFace) => {
  if (!currentVrm) {
    return;
  }
  rigRotation("Neck", riggedFace.head, 0.7);

  // Blendshapes and Preset Name Schema
  const Blendshape = currentVrm.blendShapeProxy;
  const PresetName = VRMSchema.BlendShapePresetName;

  // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
  // for VRM, 1 is closed, 0 is open.
  riggedFace.eye.l = lerp(
    clamp(1 - riggedFace.eye.l, 0, 1),
    Blendshape.getValue(PresetName.Blink),
    0.5
  );
  riggedFace.eye.r = lerp(
    clamp(1 - riggedFace.eye.r, 0, 1),
    Blendshape.getValue(PresetName.Blink),
    0.5
  );
  riggedFace.eye = Kalidokit.Face.stabilizeBlink(
    riggedFace.eye,
    riggedFace.head.y
  );
  Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);

  // Interpolate and set mouth blendshapes
  Blendshape.setValue(
    PresetName.I,
    lerp(riggedFace.mouth.shape.I, Blendshape.getValue(PresetName.I), 0.5)
  );
  Blendshape.setValue(
    PresetName.A,
    lerp(riggedFace.mouth.shape.A, Blendshape.getValue(PresetName.A), 0.5)
  );
  Blendshape.setValue(
    PresetName.E,
    lerp(riggedFace.mouth.shape.E, Blendshape.getValue(PresetName.E), 0.5)
  );
  Blendshape.setValue(
    PresetName.O,
    lerp(riggedFace.mouth.shape.O, Blendshape.getValue(PresetName.O), 0.5)
  );
  Blendshape.setValue(
    PresetName.U,
    lerp(riggedFace.mouth.shape.U, Blendshape.getValue(PresetName.U), 0.5)
  );

  //PUPILS
  //interpolate pupil and keep a copy of the value
  let lookTarget = new THREE.Euler(
    lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
    lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
    0,
    "XYZ"
  );
  oldLookTarget.copy(lookTarget);
  currentVrm.lookAt.applyer.lookAt(lookTarget);
};

var riggedPose, riggedLeftHand, riggedRightHand, riggedFace;
function getBoneNode(name) {
  const Part = currentVrm.humanoid.getBoneNode(name);
  console.assert(Part);
  return Part;
}

function handsDistance() {
  let dis = 0;
  if (
    currentVrm &&
    riggedPose &&
    riggedPose.LeftHand &&
    riggedPose.RightHand &&
    riggedPose.LeftHand.x &&
    riggedPose.RightHand.x
  ) {
    const leftHand = getBoneNode("leftHand");
    const rightHand = getBoneNode("rightHand");
    const lpos = new THREE.Vector3();
    const rpos = new THREE.Vector3();
    leftHand.getWorldPosition(lpos);
    rightHand.getWorldPosition(rpos);
    dis = lpos.distanceTo(rpos);
  }
  return dis;
}

/* VRM Character Animator */
const animateVRM = (vrm, results) => {
  if (!vrm) {
    return;
  }
  // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.

  const faceLandmarks = results.faceLandmarks;
  // Pose 3D Landmarks are with respect to Hip distance in meters
  const pose3DLandmarks = results.ea;
  // Pose 2D landmarks are with respect to videoWidth and videoHeight
  const pose2DLandmarks = results.poseLandmarks;
  // Be careful, hand landmarks may be reversed
  const leftHandLandmarks = results.rightHandLandmarks;
  const rightHandLandmarks = results.leftHandLandmarks;

  // Animate Face
  if (faceLandmarks) {
    riggedFace = Kalidokit.Face.solve(faceLandmarks, {
      runtime: "mediapipe",
      video: videoElement,
    });
    rigFace(riggedFace);
  }

  // Animate Pose
  if (pose2DLandmarks && pose3DLandmarks) {
    riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
      runtime: "mediapipe",
      video: videoElement,
    });

    gestureDetector.update(riggedPose);
    pageManager.update();

    rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
    rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
    rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);
    rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
    rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
    rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
    rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);
    rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3);
    rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3);
    rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3);
    rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3);
  }

  // Animate Hands
  if (leftHandLandmarks) {
    riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
    rigRotation("LeftHand", {
      // Combine pose rotation Z and hand rotation X Y
      z: riggedPose.LeftHand.z,
      y: riggedLeftHand.LeftWrist.y,
      x: riggedLeftHand.LeftWrist.x,
    });
    rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal);
    rigRotation("LeftRingIntermediate", riggedLeftHand.LeftRingIntermediate);
    rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal);
    rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal);
    rigRotation("LeftIndexIntermediate", riggedLeftHand.LeftIndexIntermediate);
    rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal);
    rigRotation("LeftMiddleProximal", riggedLeftHand.LeftMiddleProximal);
    rigRotation(
      "LeftMiddleIntermediate",
      riggedLeftHand.LeftMiddleIntermediate
    );
    rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal);
    rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal);
    rigRotation("LeftThumbIntermediate", riggedLeftHand.LeftThumbIntermediate);
    rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal);
    rigRotation("LeftLittleProximal", riggedLeftHand.LeftLittleProximal);
    rigRotation(
      "LeftLittleIntermediate",
      riggedLeftHand.LeftLittleIntermediate
    );
    rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal);
  }
  if (rightHandLandmarks) {
    riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
    rigRotation("RightHand", {
      // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
      z: riggedPose.RightHand.z,
      y: riggedRightHand.RightWrist.y,
      x: riggedRightHand.RightWrist.x,
    });
    rigRotation("RightRingProximal", riggedRightHand.RightRingProximal);
    rigRotation("RightRingIntermediate", riggedRightHand.RightRingIntermediate);
    rigRotation("RightRingDistal", riggedRightHand.RightRingDistal);
    rigRotation("RightIndexProximal", riggedRightHand.RightIndexProximal);
    rigRotation(
      "RightIndexIntermediate",
      riggedRightHand.RightIndexIntermediate
    );
    rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal);
    rigRotation("RightMiddleProximal", riggedRightHand.RightMiddleProximal);
    rigRotation(
      "RightMiddleIntermediate",
      riggedRightHand.RightMiddleIntermediate
    );
    rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal);
    rigRotation("RightThumbProximal", riggedRightHand.RightThumbProximal);
    rigRotation(
      "RightThumbIntermediate",
      riggedRightHand.RightThumbIntermediate
    );
    rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal);
    rigRotation("RightLittleProximal", riggedRightHand.RightLittleProximal);
    rigRotation(
      "RightLittleIntermediate",
      riggedRightHand.RightLittleIntermediate
    );
    rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal);
  }
};
//};

/* SETUP FEEDBACK DISPLAY */

/*
if (feedbackCtx) {
  const ctx = feedbackCtx;
  ctx.globalAlpha = 0.5;

  // const cursor={
  //   x:innerWidth/2,
  //   y:innerHeight/2,
  // };

  let particlesArray = [];

  //generateParticles(30,0.02,generateColor(150,150,160));
  //setSize();
  //anim();

  //监听鼠标，追随鼠标移动
  //addEventListener("mousemove", (e) => {
  //  cursor.x = e.clientX;
  //  cursor.y = e.clientY;
  //});

  //addEventListener(
  //  "touchmove",
  // (e) => {
  //    e.preventDefault();
  //    cursor.x = e.touches[0].clientX;
  //    cursor.y = e.touches[0].clientY;
  //  },
  //  { passive: false }
  //);

  //addEventListener("resize", () => setSize());

  function generateParticles(amount, speed, color) {
    for (let i = 0; i < amount; i++) {
      particlesArray[i] = new Particle(
        innerWidth / 2,
        innerHeight / 2,
        4,
        color,
        speed
      );
    }
  }

  function generateColor(r, g, b) {
    let color;
    for (let i = 0; i < 6; i++) {
      color =
        "rgb(" +
        Math.floor(r + 20 * i) +
        ", " +
        Math.floor(g + 15 * i) +
        "," +
        b +
        ")";
    }

    //原来的任意色方法
    //let hexSet = "0123456789ABCDEF";
    //let finalHexString = "#";
    //for (let i = 0; i < 6; i++) {
    //  finalHexString += hexSet[Math.ceil(Math.random() * 15)];
    //}
    console.log(color);
    return color;
  }

  // function setSize() {
  //  feedbackcanvas.height = innerHeight;
  //  feedbackcanvas.width = innerWidth;
  //}

  function Particle(x, y, particleTrailWidth, strokeColor, rotateSpeed) {
    this.x = x;
    this.y = y;
    this.particleTrailWidth = particleTrailWidth;
    this.strokeColor = strokeColor;
    this.rotateSpeed = rotateSpeed;

    //光圈弧范围,360度圆形光圈
    this.theta = Math.random() * Math.PI * 2;
    //弧线之间的间距
    this.t = Math.random() * 150;

    //旋转起来
    this.rotate = () => {
      const ls = {
        x: this.x,
        y: this.y,
      };
      this.theta += this.rotateSpeed;
      this.x = cursor.x + Math.cos(this.theta) * this.t;
      this.y = cursor.y + Math.sin(this.theta) * this.t;

      ctx.beginPath();
      ctx.lineWidth = this.particleTrailWidth;
      ctx.strokeStyle = this.strokeColor;
      ctx.moveTo(ls.x, ls.y);
      ctx.lineTo(this.x, this.y);
      //线变成圆线
      ctx.lineCap = "round";

      ctx.stroke();
    };
  }

  function anim() {
    requestAnimationFrame(anim);

    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, feedbackcanvas.width, feedbackcanvas.height);

    particlesArray.forEach((particle) => particle.rotate());
  }
}
*/

/* SETUP MEDIAPIPE HOLISTIC INSTANCE */

let videoElement = document.querySelector(".input_video"),
  guideCanvas = document.querySelector("canvas.guides");

const onResults = (results) => {
  if (DEBUG_MODE) return;
  // NOTE: Here `results` is the normalized pose data

  // Draw landmark guides
  drawResults(results);

  // Animate model
  animateVRM(currentVrm, results);
};

const holistic = new Holistic({
  locateFile: (file) => {
    return `/${file}`;
  },
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
  refineFaceLandmarks: true,
});
// Pass holistic a callback function
holistic.onResults(onResults);

const drawResults = (results) => {
  guideCanvas.width = videoElement.videoWidth;
  guideCanvas.height = videoElement.videoHeight;
  let canvasCtx = guideCanvas.getContext("2d");
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  // Use `Mediapipe` drawing functions
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#00cff7",
    lineWidth: 4,
  });
  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: "#ff0364",
    lineWidth: 2,
  });
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
    color: "#C0C0C070",
    lineWidth: 1,
  });
  if (results.faceLandmarks && results.faceLandmarks.length === 478) {
    //draw pupils
    drawLandmarks(
      canvasCtx,
      [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
      {
        color: "#ffe603",
        lineWidth: 2,
      }
    );
  }
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
    color: "#eb1064",
    lineWidth: 5,
  });
  drawLandmarks(canvasCtx, results.leftHandLandmarks, {
    color: "#00cff7",
    lineWidth: 2,
  });
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
    color: "#22c3e3",
    lineWidth: 5,
  });
  drawLandmarks(canvasCtx, results.rightHandLandmarks, {
    color: "#ff0364",
    lineWidth: 2,
  });
};

// Use `Mediapipe` utils to get camera - lower resolution = higher fps
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();
