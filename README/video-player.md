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
