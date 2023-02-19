import { degrees_to_radians } from "./math";
export var actionConfig = [
  {
    actionName: "chestEnlargement",
    actionPos: [
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 3.14 / 2, z: 0 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: -3.14 / 2, z: 0 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 1e-8, z: 0 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 1e-8, z: 0 } },
      ],
    ],
  },
  {
    actionName: "leftHandUp",
    actionPos: [
      function (riggedPose) {
        return riggedPose.RightUpperArm.z > 0.1;
      },
    ],
  },
  {
    actionName: "rightHandUp",
    actionPos: [
      function (riggedPose) {
        return riggedPose.LeftUpperArm.z < -0.1;
      },
    ],
  },
  {
    actionName: "slideToRight",
    // higher means stricter
    strictLevel: 0.75,
    actionPos: [
      [
        {
          bone: "RightUpperArm",
          pos: {
            x: 0,
            y: degrees_to_radians(90),
            z: 0,
          },
        },
        {
          bone: "RightLowerArm",
          pos: {
            x: 0,
            y: degrees_to_radians(90),
            z: 0,
          },
        },
      ],
    ],
  },
  {
    actionName: "slideToLeft",
    strictLevel: 0.75,
    actionPos: [
      [
        {
          bone: "LeftUpperArm",
          pos: {
            x: 0,
            y: -degrees_to_radians(90),
            z: 0,
          },
        },
        {
          bone: "LeftLowerArm",
          pos: {
            x: 0,
            y: -degrees_to_radians(90),
            z: 0,
          },
        },
      ],
    ],
  },
  /*
      如何添加一个新动作
      {
        actionName: '动作名字',
        // 这个数组可以配置动作如何检测,每个动作位置有两种配置方法: 1.函数 2.坐标
        actionPos: [
        ]
      }
      */
  {
    actionName: "RightchestEnlargement",
    actionPos: [
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
        { bone: "LeftLowerArm", pos: { x: 0, y: -3.14 / 1.3, z: 0 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: -3.14 / 5 } },
      ],
    ],
  },
  {
    actionName: "LeftchestEnlargement",
    actionPos: [
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
        { bone: "RightLowerArm", pos: { x: 0, y: +3.14 / 1.3, z: 0 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: +3.14 / 5 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
      ],
    ],
  },
  {
    actionName: "shoulderHorizon",
    strictLevel: 0.8,
    actionPos: [
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
      ],
    ],
  },
  {
    actionName: "shoulderUpandDown",
    strictLevel: 0.8,
    actionPos: [
      [
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: 1e-8 } },
      ],
    ],
  },
  {
    actionName: "LowerlimbHorizon",
    actionPos: [
      [
        { bone: "LeftUpperLeg", pos: { x: +3.14 / 2, y: 0, z: 1e-8 } },
        { bone: "LeftLowerLeg", pos: { x: -3.14 / 2, y: 0, z: 0 } },
        { bone: "RightUpperLeg", pos: { x: +3.14 / 2, y: 0, z: 1e-8 } },
        { bone: "RightLowerLeg", pos: { x: -3.14 / 2, y: 0, z: 0 } },
      ],
      [
        { bone: "LeftUpperLeg", pos: { x: +3.14 / 2, y: 0, z: -3.14 / 5 } },
        { bone: "LeftLowerLeg", pos: { x: -3.14 / 2, y: 0, z: 0 } },
        { bone: "RightUpperLeg", pos: { x: +3.14 / 2, y: 0, z: +3.14 / 5 } },
        { bone: "RightLowerLeg", pos: { x: -3.14 / 2, y: 0, z: 0 } },
      ],
    ],
  },
  {
    actionName: "StoporContinue",
    actionPos: [
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
        { bone: "RightLowerArm", pos: { x: -3.14 / 5, y: 0, z: +3.14 / 3 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
        { bone: "LeftLowerArm", pos: { x: -3.14 / 5, y: 0, z: -3.14 / 3 } },
      ],
      [
        { bone: "RightUpperArm", pos: { x: 0, y: 0, z: -3.14 / 2.5 } },
        { bone: "RightLowerArm", pos: { x: -0, y: 0, z: +0 } },
        { bone: "LeftUpperArm", pos: { x: 0, y: 0, z: +3.14 / 2.5 } },
        { bone: "LeftLowerArm", pos: { x: -0, y: 0, z: -0 } },
      ],
    ],
  },
];
