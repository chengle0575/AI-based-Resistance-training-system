import { actionConfig } from "./actionConfig";
import { degrees_to_radians, vectorSimilarity } from "./math";

const loggedAction = {
  //slideToLeft: true,
  //rightHandUp: true,
  //slideToRight: true,
  //shoulderHorizon: true,
};

const loggedBone = [
  //"RightUpperArm", "RightLowerArm"
];

export class GestureDetector {
  constructor(riggedPose) {
    this.riggedPose = riggedPose;

    // 0 means not uncertain state (action not even start)
    this.state = {};
    this.isEndState = {};
    this.isEndStateOld = {};

    this.allPoseSequence = actionConfig;
  }

  edge(name) {
    const oldState = this.isEndStateOld[name];
    const newState = this.isEndState[name];
    return newState && oldState != newState;
  }

  slideToRightEdge() {
    return this.edge("slideToRight");
  }

  slideToLeftEdge() {
    return this.edge("slideToLeft");
  }

  leftHandUp() {
    return this.isEndState["leftHandUp"];
  }
  leftHandUpEdge() {
    return this.edge("leftHandUp");
  }

  rightHandUp() {
    return this.isEndState["rightHandUp"];
  }
  rightHandUpEdge() {
    return this.edge("rightHandUp");
  }

  chestEnlargement() {
    return this.isEndState["chestEnlargement"];
  }
  chestEnlargementEdge() {
    //返回值表示有没有做完一个动作
    return this.edge("chestEnlargement");
  }

  RightchestEnlargement() {
    return this.isEndState["RightchestEnlargement"];
  }

  RightchestEnlargementEdge() {
    return this.edge("RightchestEnlargement");
  }

  LeftchestEnlargement() {
    return this.isEndState["LeftchestEnlargement"];
  }

  LeftchestEnlargementEdge() {
    return this.edge("LeftchestEnlargement");
  }

  shoulderHorizon() {
    return this.isEndState["shoulderHorizon"];
  }

  shoulderHorizonEdge() {
    return this.edge("shoulderHorizon");
  }

  shoulderUpandDown() {
    return this.isEndState["shoulderUpandDown"];
  }

  shoulderUpandDownEdge() {
    return this.edge("shoulderUpandDown");
  }

  LowerlimbHorizon() {
    return this.isEndState["LowerlimbHorizon"];
  }

  LowerlimbHorizonEdge() {
    return this.edge("LowerlimbHorizon");
  }

  StoporContinue(){
    return  this.isEndState["StoporContinue"];
  }
  StoporContinueEdge(){
    return this.edge("StoporContinue");
  }

  //不用动下面的部分
  matchPose(target, name = undefined, strictLevel = 0.7) {
    if (!this.riggedPose) return false;
    let ret = true;
    target.forEach((e) => {
      const { bone, pos } = e;
      const expectedPos = pos;
      const actualPos = this.riggedPose[bone];
      if (!actualPos) return false;
      const similarity = vectorSimilarity(expectedPos, actualPos);
      ret &= similarity >= strictLevel;
      if (loggedAction[name]) console.log(name, similarity);
    });
    return ret;
  }

  matchPoseSequence(config) {
    const { actionName, actionPos } = config;

    const oldState = this.state[actionName];
    let newState = oldState;

    const matchIthPose = (i) => {
      console.assert(i < actionPos.length, i, actionPos);
      const posOrFunction = actionPos[i];
      const strictLevel = config.strictLevel;
      if (posOrFunction instanceof Function) {
        return posOrFunction(this.riggedPose);
      } else {
        return this.matchPose(posOrFunction, actionName, strictLevel);
      }
    };

    // The last state in the sequence
    const endState = actionPos.length;
    if (!oldState || oldState == endState) {
      // In an uncertain state or end state, start over
      if (matchIthPose(0)) {
        newState = 1;
      } else {
        newState = 0;
      }
    } else {
      // Test if can reach the next state
      if (oldState != endState && matchIthPose(oldState)) {
        newState = oldState + 1;
      }
      // Test if can retain the old state
      else if (matchIthPose(oldState - 1)) {
        newState = oldState;
      } else {
        // TODO: abort and restart action
        // Else fall into an uncertain state
        // newState = 0;
      }
    }
    this.state[actionName] = newState;
  }

  update(riggedPose) {
    this.riggedPose = riggedPose;
    this.isEndStateOld = this.isEndState;
    this.isEndState = {};

    loggedBone.forEach((bone) => {
      console.log(bone, riggedPose[bone]);
    });

    this.allPoseSequence.forEach((e) => {
      const name = e.actionName;
      this.matchPoseSequence(e);

      this.isEndState[name] = this.state[name] == e.actionPos.length;
      if (loggedAction[name])
        console.log(
          name,
          this.state[name],
          this.isEndStateOld[name],
          this.isEndState[name]
        );
    });
  }
}
