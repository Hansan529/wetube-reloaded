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

```js
const handleStart = () => {
  startBtn.innerText = "녹화 중지";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    console.log("녹화종료");
    console.log(e);
    console.log(e.data);
  };
  console.log(recorder);
  recorder.start();
  console.log(recorder);
  setTimeout(() => {
    recorder.stop();
  }, 10000);
};
```

녹화 시작을 누르면,stream이 `state: inactive` &rarr; `state: recording` 으로 변한다  
10초 뒤에, 녹화 종료와 BlobEvent 값이 나온다.

ondataavailable에 브라우저 상의 메모리로 생성하는 URL을 만들 것이다.

```js
recorder.ondataavailable = (e) => {
  const video = URL.createObjectUrl(e.data);
  console.log(video);
};
```

콘솔에 `blob:https://wetube.hxan.net/a5966683-4fe8-49ce-a122-214f0afda783` 과 같이 경로가 생기는데, 접근하면 해당 파일은 없다.  
파일은 브라우저의 메모리 상에 있다.

```js
const handleStart = () => {
  startBtn.innerText = "녹화 중지";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    const videoFile = URL.createObjectURL(e.data);
    video.srcObject = null;
    video.src = videoFile;
    video.play();
  };
  recorder.start();
};
```

기존의 preview의 stream을 제거하고, 브라우저 메모리에 저장된 비디오로 변경한다.

`<video id="preview" src="blob:https://wetube.hxan.net/2cad908f-935e-4a73-b2c2-1e7676990207"></video>` 라는 파일로 변경된다.

우리 웹 사이트에서 호스팅하는 것 같지만, 브라우저의 메모리에서 가져온 비디오이다. 다운로드 시키기 위해 a 태그를 생성하고, href에 videoFile을 적용시킨 뒤,  
download 속성을 사용해 링크로 이동이 아닌, 다운로드 형식으로 변경했다.

```js
const handleDownload = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording";
  document.body.appendChild(a);
  a.click();
};
```
