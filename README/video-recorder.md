# Video Recorder

- 목표: 웹 브라우저에서 카메라, 마이크 사용 요청을 하자.

```js
const startBtn = document.getElementById("startBtn");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  console.log(stream);
};

startBtn.addEventListener("click", handleStart);
```

getUserMedia() 메소드가 권한을 요청하며, 반환된 값은 stream에 저장된다.

매개변수에는 `{ audio: true, video: true}`가 대표적이고, video의 width, height, min, max같은 요소도 지정할 수 있다.

모바일에는 카메라가 여러개인데, 전면 카메라를 요청하는 법은 facingMode: "user" 를 사용하면 된다.  
후면카메라는 facingMode: { exact: "environment"} 를 사용한다.

---

```
MediaStream
  active : true
  id : "6eae9721-5fe9-4a8c-8c43-f50b91100b2a"
  onactive : null
  onaddtrack : null
  oninactive : null
  onremovetrack : null
  [[Prototype]] : MediaStream
```

권한을 허용하면 다음과 같이 정보를 담은 stream을 사용 할 수 있다.

pug에서 video를 생성한 다음, `srcObject` 속성을 사용해 stream을 대입해주고, `play()` 요청하면 녹화하기 미리보기가 된다.

```js
const video = document.getElementById("preview");

...
video.srcObject = stream;
video.play();
```

srcObject는 video가 가질 수 있는 것을 의미한다.  
MediaStream, MediaSource, Blob, File

---

## Recording Video

MediaRecorder를 사용해 녹화를 할 수 있게 한다.
