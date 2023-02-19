import * as THREE from "three";

export function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

export function radians_to_degree(radians) {
  return (radians / Math.PI) * 180;
}

export function radians_to_degree_vector(v) {
  return {
    x: radians_to_degree(v.x),
    y: radians_to_degree(v.y),
    z: radians_to_degree(v.z),
  };
}

function pow(x) {
  return x * x;
}

function transformToVector(q) {
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(q.x, q.y, q.z), Math.PI / 2);

  const vector = new THREE.Vector3(1, 0, 0);
  vector.applyQuaternion(quaternion);

  return vector;
}

function diffUsingQuaternion(A, B) {
  const a = new THREE.Quaternion().setFromEuler(new THREE.Euler(A.x, A.y, A.z));
  const b = new THREE.Quaternion().setFromEuler(new THREE.Euler(B.x, B.y, B.z));
  return Math.cos(a.angleTo(b));
}

function naiveDiffIgnoreZero(target, actual) {
  let s = 0;
  if (target.x != 0) s += Math.abs(target.x - actual.x);
  if (target.y != 0) s += Math.abs(target.y - actual.y);
  if (target.z != 0) s += Math.abs(target.z - actual.z);
  s = Math.min(s, Math.PI);
  return Math.cos(s);
}

export function vectorSimilarity(A, B) {
  //return cosinesim(transformToVector(A), transformToVector(B));
  //return diffUsingQuaternion(A, B);
  return naiveDiffIgnoreZero(A, B);
}

function sqrtDiff(A, B) {
  let diff = pow(A.x - B.x) + pow(A.y - B.y) + pow(A.z - B.z);
  diff = Math.sqrt(diff / 3);
  //console.log(A, B, diff);
  return diff;
}

// calculate cosine similarity
function cosinesim(xA, xB) {
  const A = [xA.x, xA.y, xA.z];
  const B = [xB.x, xB.y, xB.z];
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  let similarity = dotproduct / (mA * mB);
  //console.log(A, B, similarity);
  return similarity;
}
