import { toast } from "./toast";
import { Howl, Howler } from "howler";
export var page13is;

const threeJsContainer = document.querySelector(".threejs-container");
const height = threeJsContainer.clientHeight;
const width = threeJsContainer.clientWidth;

const goodAudio = new Howl({
  src: "good.mp3",
});

const veryGoodAudio = new Howl({
  src: "good.mp3",
});

const yesAudio = new Howl({
  src: "audioyes.mp3",
});

//const stoptestAudio=new Howl({
// src:"stoptest.mp3"
//})

let videoEnded = true;
//let stoptestAudioStatus;

// Helper to set avatar right
function SetAvatarRight() {
  threeJsContainer.style.marginLeft = "30%";
}

// Helper to set avatar center
function SetAvatarCenter() {
  threeJsContainer.style.marginLeft = "auto";
}

function hideAvatar() {
  threeJsContainer.style.display = "none";
}

function showAvatar() {
  threeJsContainer.style.display = "block";
}

export class PageManager {
  constructor(bgCtx, feedbackCtx, gestureDetector) {
    this.bgCtx = bgCtx;
    this.feedbackCtx = feedbackCtx;
    this.page = null;
    this.frame_in_current_page = 0;
    this.gestureDetector = gestureDetector;
    this.pageState = {};
    this.questionAnswer = {};
    this.timesWeek = 2;
    this.setPage(0);
  }

  //构造一个专门画bg函数，加载png
  drawBg(imagename) {
    const imgbg = document.getElementById(imagename);

    this.bgCtx.drawImage(
      imgbg,
      0,
      0,
      width,
      (width * imgbg.height) / imgbg.width
    );
    //this.bgCtx.font = "22px serif";
    //this.bgCtx.fillText("Page " + imagename, 0, 20);
  }

  clearCanvasCtx(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  setPage(page) {
    if (page == this.page) {
      // 已经在指定的 page 了，不需要重复切换
      return;
    }
    /*
    if(page==13){
     
        this.onpage13PreEnter();
        let k=4000;
        let i=0;
        for(i=0;i<k;i++){
          if(this.isVideoOn()){
            i++
          }else {
            this.onPage13Enter;
            return;
          }
          
        }   

     

      

    }*/

    this.pageState = {};
    this.clearCanvasCtx(this.feedbackCtx);

    const oldPage = this.page;

    console.log("set page", page);
    this.page = page;
    this.frame_in_current_page = 0;
    this.drawBg("img" + this.page);

    const leaveName = "onPage" + oldPage + "Leave";
    if (this[leaveName]) {
      this[leaveName]();
    }

    const enterName = "onPage" + page + "Enter";
    if (this[enterName]) {
      this[enterName]();
    }
  }

  switchNextPage() {
    //toast("next page");
    console.log("next page");

    this.setPage(this.page + 1);
  }

  switchPrevPage() {
    console.log("prev page");

    if (this.page == 0) {
      return;
    }
    this.setPage(this.page - 1);
  }

  detectNextPageAction() {
    return (
      this.gestureDetector.rightHandUpEdge() ||
      (this.gestureDetector.rightHandUp() && this.frame_in_current_page > 100)
    );
  }

  detectPrevPageAction() {
    return (
      this.gestureDetector.leftHandUpEdge() ||
      (this.gestureDetector.leftHandUp() && this.frame_in_current_page > 100)
    );
  }

  onPage0Enter() {
    // 切换到页面0时，把人物放右边
    SetAvatarRight();
  }

  onPage1Enter() {
    // 举个例子，page1需要播放视频，那设置视频播放的逻辑就放这里
    this.playVideo("chanpinjieshao");
  }
  onPage1Leave() {
    // 从页面1切出去了，需要隐藏视频
    this.closeVideo("chanpinjieshao");
  }

  onPage5Enter() {
    this.pageState.currentBox = 0;
    this.pageState.boxNum = 3;
  }
  onPage5Update() {
    const ctx = this.feedbackCtx;
    let currentBox = this.pageState.currentBox;
    if (this.gestureDetector.slideToRightEdge()) {
      currentBox--;
    } else if (this.gestureDetector.slideToLeftEdge()) {
      currentBox++;
    }
    currentBox = Math.max(0, Math.min(currentBox, 2));
    this.pageState.currentBox = currentBox;

    const startX = 300;
    const startY =500;
    const boxWidth = 120;
    const boxGap = 10;
    this.clearCanvasCtx(ctx);
    let x = startX;

    for (let i = 0; i < this.pageState.boxNum; i++) {
      let height = boxWidth / 1.2;
      if (i == this.pageState.currentBox) {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        height *= 1.2;
      } else {
        ctx.fillStyle = "rgba(229, 229, 229, 1)";
      }
      ctx.fillRect(x, startY - height, boxWidth, height);
      x += boxWidth + boxGap;
    }
  }

  onPage6Enter() {
    console.log("我播放了");
    stoptestAudio.play();
    stoptestAudioStatus = 1;
  }

  onPage6Leave() {
    stoptestAudio.pause();
  }

  onPage7Enter() {
    this.pageState.questionNo = 0;
    const yesno = document.getElementById("yesno");
    yesno.style.display = "flex";
  }
  onPage7Leave() {
    const yesno = document.getElementById("yesno");
    yesno.style.display = "none";
  }
  onPage7Update() {
    function getbgName(i) {
      if (i == 0) return "img7";
      else return "img7." + i;
    }

    const questionTotal = 3;

    if (this.gestureDetector.slideToLeftEdge()) {
      if (this.questionAnswer[this.pageState.questionNo] != undefined) {
        if (this.pageState.questionNo == questionTotal - 1) {
          // all questions answered
          // test if can continue
          let illnessConut = 0;
          for (let i = 0; i < questionTotal; i++) {
            illnessConut += this.questionAnswer[i];
          }
          if (illnessConut > 0) {
            this.setPage(14);
            return;
          }
          this.switchNextPage();
          return;
        } else {
          this.pageState.questionNo++;
          // switch question
          this.drawBg(getbgName(this.pageState.questionNo));
          return;
        }
      }
    } else if (this.gestureDetector.slideToRightEdge()) {
      if (this.pageState.questionNo > 0) {
        this.pageState.questionNo--;
        // switch question
        this.drawBg(getbgName(this.pageState.questionNo));
        return;
      }
    }

    let yes = this.questionAnswer[this.pageState.questionNo];

    if (this.detectPrevPageAction()) yes = true;
    else if (this.detectNextPageAction()) yes = false;

    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");
    const whiteText = "rgba(247, 247, 247, 1)";
    const skyText = "rgba(38, 52, 102, 1)";
    const highlight = "rgba(38, 52, 102, 1)";
    const noHighlight = "rgba(247, 247, 247, 1)";

    if (yes == true) {
      yesBtn.style.background = highlight;
      noBtn.style.background = noHighlight;
      yesBtn.style.color = whiteText;
      noBtn.style.color = skyText;
    } else if (yes == false) {
      yesBtn.style.background = noHighlight;
      noBtn.style.background = highlight;
      noBtn.style.color = whiteText;
      yesBtn.style.color = skyText;
    } else {
      yesBtn.style.background = noHighlight;
      noBtn.style.background = noHighlight;
      noBtn.style.color = skyText;
      yesBtn.style.color = skyText;
    }

    this.questionAnswer[this.pageState.questionNo] = yes;
  }

  onPage8Enter() {
    this.playVideo("zhuangtaiceping", true, () => {
      this.switchNextPage();
    });
  }
  onPage8Leave() {
    this.closeVideo("zhuangtaiceping");
  }

  onPage11Update() {
    if (this.gestureDetector.slideToRightEdge()) {
      this.timesWeek = 3;
    } else if (this.gestureDetector.slideToLeftEdge()) {
      this.timesWeek = 2;
    }

    if (this.timesWeek == 3) {
      this.drawBg("img11");
    } else if (this.timesWeek == 2) {
      this.drawBg("img11.1");
    }
  }

  onPage12Update() {
    if (this.timesWeek == 3) {
      this.drawBg("img12");
    } else if (this.timesWeek == 2) {
      this.drawBg("img12.1");
    }
  }

  //onpage13PreEnter(){
  //
  //  this.playVideo("beforeaction1")

  //}
  onPage13Enter() {
    // 切换到页面13时，把人物放中间
    SetAvatarCenter();

    //记录已经进入了page13
    page13is = 1;

    this.playVideo("beforeaction1", true, () => {
      //显示 page13-overlay 元素
      const overlay = document.getElementById("page13-overlay");
      overlay.style.display = "block";
      this.pageState.score = 0;
      this.pageState.actionAmount = 0;

      const indicator = document.getElementById("rotate-indicator");
      indicator.style.display = "block";
    });
  }
  onPage13Leave() {
    const overlay = document.getElementById("page13-overlay");
    overlay.style.display = "none";

    page13is = 0;

    const indicator = document.getElementById("rotate-indicator");
    indicator.style.display = "none";
  }
  onPage13Update() {
    if (this.isVideoOn()) return;

    if (this.pageState.actionAmount > 24) {
      this.page(15);
      toast("全部完成");
      // Go to finish page
    }

    const good = () => {
      //修改为视觉计数+听觉很好音效
      this.pageState.actionAmount++;
      this.pageState.score += 100;
      toast("完成" + toastext() + "个啦");
      this.popUpAudio("good");
    };

    const veryGood = () => {
      this.pageState.actionAmount++;
      this.pageState.score += 120;
      toast("非常好");
      this.popUpAudio("verygood");
    };

    const toastext = () => {
      return this.pageState.actionAmount % 8;
    };

    //save headlines
    const headlineArray = [
      "1/6 手拉弹力带扩胸运动",
      "2/6 手拉弹力带肩部拉伸运动",
      "3/6 弹力带绕大腿后上提运动",
      "4/6 手拉弹力带右臂斜上方拉伸运动",
      "5/6 手拉弹力带左臂斜上方拉伸运动",
      "6/6 弹力带绕大腿开合运动",
    ];

    const actionRepeatTime = 8;

    const actionSequence = [
      "chestEnlargementEdge",
      "shoulderHorizonEdge",
      "shoulderUpandDownEdge",
      "RightchestEnlargementEdge",
      "LeftchestEnlargementEdge",
      "LowerlimbHorizonEdge",
    ];

    const actionId = Math.floor(this.pageState.actionAmount / actionRepeatTime);
    const actionName = actionSequence[actionId];
    if (this.gestureDetector[actionName]()) {
      good();

      if (
        this.pageState.actionAmount % actionRepeatTime == 0 &&
        this.pageState.actionAmount != 24
      ) {
        // Play action video
        this.playVideo("video" + actionId, true);
      }
    }

    //draw progressbar varies with actionAmount
    const barBottom = 700;
    const barTop = 90;
    const progressTop =
      barBottom - (this.pageState.actionAmount / 24) * (barBottom - barTop);

    this.clearCanvasCtx(this.feedbackCtx);

    //draw healine
    const actionHeadline = document.getElementById("action-headline");
    actionHeadline.textContent = headlineArray[actionId];

    this.feedbackCtx.fillStyle = "#ffffff";
    this.feedbackCtx.beginPath();
    this.feedbackCtx.moveTo(55, barTop);
    this.feedbackCtx.lineTo(55, barBottom); //bottom
    this.feedbackCtx.lineWidth = 30;
    this.feedbackCtx.strokeStyle = "white";
    this.feedbackCtx.lineCap = "round";
    this.feedbackCtx.stroke();

    this.feedbackCtx.beginPath();
    this.feedbackCtx.moveTo(55, progressTop);
    this.feedbackCtx.lineTo(55, barBottom); //bottom
    this.feedbackCtx.lineWidth = 30;
    this.feedbackCtx.strokeStyle = "orange";
    this.feedbackCtx.lineCap = "round";
    this.feedbackCtx.stroke();

    this.feedbackCtx.font = "48px system-ui";
    this.feedbackCtx.fillText(
      Math.ceil((this.pageState.actionAmount / 24) * 100) + "%",
      85,
      110
    );

    //show score
    const score = this.pageState.actionAmount * 150;
    //this.feedbackCtx.fillText(score, 320, 120);
    const scoreText = document.getElementById("score-text");
    scoreText.textContent = score;
  }

  onPage15Enter() {
    hideAvatar();
  }

  onPage15Leave() {
    showAvatar();
  }

  popUpAudio(audioname) {
    if (audioname == "good") {
      goodAudio.play();
    } else if (audioname == "verygood") {
      veryGoodAudio.play();
    } else {
      console.log("unknown audio name", audioname);
    }
  }

  playVideo(videoname, hideWhenEnded = false, callback = null) {
    // Refer: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#methods
    const video = document.getElementById(videoname);
    video.style.display = "block";
    video.play();
    videoEnded = false;
    video.addEventListener("ended", () => {
      videoEnded = true;
      if (hideWhenEnded) {
        video.style.display = "none";
      }
      if (callback) {
        callback();
      }
    });
  }
  closeVideo(videoname) {
    const video = document.getElementById(videoname);
    video.style.display = "none";
    video.pause();
    videoEnded = true;
  }

  isVideoOn() {
    return !videoEnded;
  }

  update() {
    this.frame_in_current_page++;

    // Page navigation special naavigation
    if (this.page == 3) {
      // When dectect a prevPage action on Page 3, switch to Page 4
      if (this.detectPrevPageAction()) {
        this.switchNextPage();
      }
    } else if (this.page == 5) {
      if (this.detectNextPageAction()) {
        this.setPage(7);
      }
    } else if (this.page == 7) {
      // handle navigation in onPage7Update
    } else if (this.page == 13) {
      if (this.pageState.actionAmount == 24) {
        this.setPage(15);
      }

      // don't handle navigation
    } else if (this.page == 15) {
      //return to the page 10
      if (this.detectNextPageAction()) {
        yesAudio.play();
        this.setPage(13);
      } else if (this.detectPrevPageAction()) {
        this.setPage(0);
      }
    } else if (this.page == 14) {
      if (this.detectNextPageAction()) {
        yesAudio.play();
        this.setPage(8);
      } else if (this.detectPrevPageAction()) {
        this.setPage(7);
      }
    } else if (this.page == 4) {
      if (this.detectNextPageAction()) {
        yesAudio.play();
        this.setPage(5);
      }
    } else if (this.page == 8) {
      // do nothing
    } else {
      // Default page navigation: left hand up -> previous page; right hand up -> next page
      if (this.detectNextPageAction()) {
        yesAudio.play();
        this.switchNextPage();
      } else if (this.detectPrevPageAction()) {
        this.switchPrevPage();
      }
    }

    // Main game logic goes here
    if (this.page == 5) {
      this.onPage5Update();
    } else if (this.page == 7) {
      this.onPage7Update();
    } else if (this.page == 11) {
      this.onPage11Update();
    } else if (this.page == 12) {
      this.onPage12Update();
    } else if (this.page == 13) {
      this.onPage13Update();
    }

    /*
    if (page == 0) {
      //加载画面
      drawBg("img0");
      //设置判断条件-pose等，先去page2吧,page1还没做好
      if (
        judge != true &&
        -3.14 / 2 <= riggedPose.LeftUpperArm.z &&
        riggedPose.LeftUpperArm.z <= -3.14 / 5
      ) {
        //judge=true，避免页面连跳
        judge = true;
        page = 1;
      }
    }
    if (page == 1) {
      //交互行为动作编码介绍
    }

    if (page == 2) {
      //产品介绍视频
      ///加载视频
      const player = videojs("chanpinjieshao");
      player.play();

      //救命，该怎么样子让他只播放一遍啊 杀人了我的耳朵。。。好像目前想不出来，等最后吧，有bug
      console.log(page);
      console.log(player);

      //设置判断条件-pose等
      if (
        -3.14 / 2 <= riggedPose.LeftUpperArm.z &&
        riggedPose.LeftUpperArm.z <= -3.14 / 5
      ) {
        page = 5;
      }
    }

    //if(page==3){
    //疾病筛查阶段，等画面尺寸正常后，用button写，bug
    //加载画面

    //}

    //if(page==4){
    //肌肉状态检测
    //加载视频
    //   const player = videojs("zhuangtaiceping1");
    //   player.play();

    //虚假的数据记录，暂时不打算写，涉及数据比较，比较麻烦

    // }
    //省略一些肌肉状态检测的视频

    if (page == 5) {
      //进入主选择界面
      //加载画面
      drawBg("img1");
      //设置判断条件-pose等，先去page2吧,page1还没做好
      if (
        judge != true &&
        -3.14 / 2 <= riggedPose.LeftUpperArm.z &&
        riggedPose.LeftUpperArm.z <= -3.14 / 5
      ) {
        judge = true;
        page = 8;
      }
    }

    //暂时省略page6和7，分别为11和12

    if (page == 8) {
      //要开始核心的动作检测和反馈以及记分了
      //加载画面
      drawBg("img2");

      //双手的距离
      let leftTorightDistance = handsDistance();
      //speed速度随之变化
      const speed = leftTorightDistance * 0.01;
      const amount = leftTorightDistance * 12;

      //视觉反馈的位置,效果和变化
      drawFeedback(
        innerWidth / 2,
        innerHeight / 2,
        amount,
        speed,
        10,
        200,
        200
      );
      console.log("lefttoright=" + leftTorightDistance);

      //根据流程图内容写的一些初稿
      // if(countnum%8==0){
      //   const index=count/8-countnum%8;
      //弹出视频(用数组？) 关键是怎么让视频只播放一遍？

      //字幕更换（用数组？）

      //}

      // var allVideo=[]
      // var allTitle=["1/3 水平扩胸运动","","",""];

      //切换状态,开合切换
      if (state == 1) {
        if (leftTorightDistance > 1.8) {
          //第一个动作达标的判断条件
          //达标提示反馈
          feedbackCtx.arc(
            innerWidth / 2,
            innerHeight / 2,
            80,
            0,
            Math.PI * 2,
            true
          );
          feedbackCtx.fillStyle = "orange";
          feedbackCtx.fill();
          //计数
          countnum = countnum + 1;
          //积分
          score = score + 120;
          console.log("完成数量=" + countnum);
          state = 2;
        }
      } else if (state == 2) {
        if (leftTorightDistance < 1.8) state = 1;
      }

      //进度条，未完成，差追随进度变化
      //  feedbackCtx.beginPath();
      //  feedbackCtx.moveTo(0, 0);
      //  feedbackCtx.lineTo(0, 100);
      //  feedbackCtx.lineWidth = 20;
      //  feedbackCtx.strokeStyle ="black";

      //  feedbackCtx.beginPath();
      //  feedbackCtx.moveTo(0, 0);
      //  feedbackCtx.lineTo(0, 80);
      //  feedbackCtx.lineWidth = 20;
      //  feedbackCtx.strokeStyle ="orange";

      //线变成圆线
      //  feedbackCtx.lineCap="round";
      //  feedbackCtx.stroke();

      //分数计数器显示  有显示bug,未完成
      feedbackCtx.font = "88px serif";
      const scorestring = String(score);
      feedbackCtx.fillText("goodbye", 10, 50);
    }
    */
  }
}
