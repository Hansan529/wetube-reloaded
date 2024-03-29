# Video Player

```js
module.exports = {
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development",
  watch: true,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  ...
};
```

entry를 object 요소로 만들고, 이름을 지정해준다. output에서, [name] 을 이용하면 entry의 name을 불러온다.  
dev:assets 재실행해보면 main.js, videoPlayer.js로 2가지 파일로 변환된 걸 몰 수 있다.

---

## Play Pause

```pug
// watch
extends ../base

block content
  video(src=`/${video.fileUrl}`, controls)
  div
    button#play Play
    button#mute Mute
    span#time 00:00/00:00
    input(type="range",step="0.1" min="0" max="1")#volume
block scripts
  script(src="/assets/js/videoPlayer.js")
```

Play, Mute, 시간, 음량 조절 버튼을 생성하고, 해당 요소에 이벤트를 추가한다.

```js
// videoPlayer
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

const handleMute = (e) => {};

const handlePause = () => {
  playBtn.innerText = "Pause";
};
const handlePlay = () => {
  playBtn.innerText = "Play";
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
```

querySelector, getElementById 를 사용해서 선택한 후, 이벤트 속성을 통해 이벤트 발생 시  
알맞는 함수가 실행되도록 설정

## Duration

```pug
extends ../base

block content
  video(src=`/${video.fileUrl}`, controls)
  div
    button#play Play
    button#mute Mute
    div
      span#currenTime 00:00
      span  /
      span#totalTime 00:00
    input(type="range",step="0.1" value="1"  min="0" max="1")#volume
block scripts
  script(src="/assets/js/videoPlayer.js")
```

time을 JS로 수정하기 위해서 span으로 분리해준다.

```js
let volumeValue = 1;
video.volume = volumeValue;

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

volumeRange.addEventListener("input", handleVolumeChange);
```

비디오의 기본 소리는 1로 최대치로 설정하고, 전역변수인 volumeValue를 업데이트해준다. `change` 이벤트도 변경을 감지하는데,  
클릭을 하고, 놓는 순간을 기록하기 때문에, 실시간으로 업데이트되지 않아, `input` 이벤트를 사용해서 변경되는 순간순간 실행하도록 변경했다.

`loadedmetadata`는 비디오를 제외한 모든 것을 말한다. 시간, 가로, 세로 등등, 영상의 시간을 업데이트해주는 `timeupdate` 이벤트도 사용한다.

```js
const handleTimeUpdate = () => {
  console.log(video.currentTime);
};

video.addEventListener("timeupdate", handleTimeUpdate);
```

콘솔을 확인해보면, 현재 비디오의 시간에 맞게 시간이 업데이트되고 있다.

---

<br>

## Time Foratting

`new Data(0)`은 1970.1.1 09:00:00(한국 기준)을 기준으로 시작한다.  
new Date(5 \* 1000).toISOString() 을 하면, '1970-01-01T00:00:05.000Z' 값을 얻을 수 있다.

이전에는 한국 기준이여서 +9hr인데,지금은 영국을 기준으로 시작한다.

해당 시각을 특정 위치부터 자르기 위해 `substring`을 사용한다. 속성은 시작 위치, 종료 위치이다.

```js
const format = (seconds) => {
  new Date(seconds * 1000).toISOString().substring(11, 19);
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  return;
};

const handleTimeUpdate = () => {
  timeline.value = Math.floor(video.currentTime);
  return;
};
```

시간을 불러와서 포멧팅해주었다.

---

## Timeline

```js
const handleLoadedMetadata = () => {
  timeline.max = Math.floor(video.duration);
  totalTime.innerText = formatTime(Math.floor(video.duration));
  return;
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
  return;
};
```

비디오의 타임라인 input을 추가하고, 해당 input에 input 이벤트를 사용해서 값이 변할때마다 실행하도록 한다.  
timeline의 최대 값 (영상 시간)을 video의 길이로 동기화해준다.

비디오가 실행되면서 timeupdate가 되면, timeline의 value가 currentTime 값으로 동기화된다.

timeupdate 이벤트는 시간이 변할 때 마다 발동하고, input 이벤트는 값이 변하는 중에 발동한다.

```js
const handleTimelineChange = (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};
```

---

## Fullscreen

`element.requestFullscreen()` 메소드 하나면 전체화면이 가능하다.

문제는 해당 element만 fullscreen이 되기 때문에 대부분 video에 설정하니까 controls들은 함께 fullscreen이 되지 않는다.

그래서 video와 관련된 모듈들을 div로 감싸고, element를 택하고 fullscreen을 하면 컨트롤러도 포함한 채 전체화면이 된다.

```js
const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
  fullScreenBtn.innerText = fullscreen ? "Full Screen" : "Exit Full Screen";
};

fullScreenBtn.addEventListener("click", handleFullScreen);
```

전체화면이 아니라면 videoContainer를 전체화면으로 변경하고, 버튼 텍스트가 전체화면에서 나가기 텍스트로 변경한다.  
전체화면이라면 전체화면에서 벗어난다

```js
let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");
const timeoutCancle = () => {
  clearTimeout(controlsMovementTimeout);
  controlsMovementTimeout = null;
};

const handleMouseMove = () => {
  if (controlsMovementTimeout) {
    timeoutCancle();
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  timeoutCancle();
  hideControls();
};
```

video 안에서 마우스가 움직이면 3초뒤 showing 클래스를 제거하는 함수를 실행한다. 근데, 만약에 실행되었을 때, 다시 한번  
handleMouseMove가 실행되면 3초뒤 실행하는 함수를 취소시킨다.

이로서 마우스를 가만히 두면 실행하고, 움직이면 삭제하고 3초뒤 실행하는 갱신형으로 변경된다.

비디오에서 마우스가 벗어나면 즉시 숨기고, 예정된 함수를 취소시킨다.

timeout은 id가 있기 때문에, 해당 id와 일치시키는 cleartimeout에 id를 넣으면 timeout이 취소가 되는 방식이다.

---

## Keydown

```js
const ArrowLeft = () => {
  let { currentTime } = video;
  currentTime = currentTime < 1 ? 0 : currentTime - 1;
  video.currentTime = currentTime;
};
const ArrowRight = () => {
  let { currentTime } = video;
  currentTime =
    currentTime > video.max ? video.max : Math.floor(currentTime + 1);
  video.currentTime = currentTime;
};
const KeyM = () => {
  handleMute();
};
const KeyF = () => {
  handleFullScreen();
};

const keyFunctions = {
  Space: handlePlayClick,
  ArrowLeft,
  ArrowRight,
  KeyM,
  KeyF,
};

const handleKeydown = (e) => {
  const keyFunction = keyFunctions[e.code];
  if (keyFunction) {
    keyFunction();
  }
  return;
};

document.addEventListener("keydown", handleKeydown);
```

keyFunctions 객체에 Space,ArrowLeft... 프로퍼티를 추가하고 (ES6문을 활용해서 코드를 정리했다.)  
해당 함수를 keydown 이벤트 발생시 keyFunctions에서 찾아서 일치하면 실행하도록 설정해주면 된다.
