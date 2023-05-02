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
