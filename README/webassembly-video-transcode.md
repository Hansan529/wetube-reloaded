# Webassembly Video Transcode

녹화한 영상을 다운로드 받아서 재생해보면, duration이 없는 것을 알 수 있다.

서버에서 비디오를 변환하면 많은 자원을 소모하므로, ffmpeg를 사용해서 사용자의 브라우저에서 비디오를 변환하는 작업을 뜻한다.

하지만 front-end는 HTML, CSS, JS 만 사용이 가능한데, ffmpeg는 C를 기반으로 구동되기 때문에

webassembly를 사용해서 구동하도록 할 것이다.

```bash
$ yarn add @ffmpeg/core @ffmpeg/@ffmpeg
```

ffmpeg를 사용하기 위해 설치해준다.

```js
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const handleDownload = async () => {
  const ffmpeg = createFFmpeg({log: true});
  await ffmpeg.load();

  ...
}
```

ffmpe를 불러오는데, javascript 가 아닌 다른 프로그램을 사용하기 때문에, await을 사용해 기다리도록 한다. 브라우저만이 아닌, 컴퓨터의 파일에서 생성해야하기 때문이다.

`ffmpeg.FS()` 메소드에는 3가지 속성이 있다.

- writeFile: 파일을 생성한다.
  - back-end에서는 multer가 파일을 생성했고, front-end에서는 ffmpeg가 파일을 생성한다.

URL.createObjectURL(e.data) 를 통해 binary data를 생성했으므로 다음과 같이 사용한다.

```js
ffmpeg.FS("writeFile", "recoding.webm", videoFile);
```

브라우저에서 ffmpeg를 사용하려면 -i 속성을 사용한다. 프레임은 -r를 사용한다.

```js
await ffmpeg.run("-i", "recoding.webm", "-r", "60", "output.mp4");
```

input으로 recoding.webm 을 불러온 뒤, 60프레임으로 output.mp4로 변환한다.

지금 상태에서 다운로드를 해보면 변환은 하지만, recoding.webm 파일이 다운된다.

```js
ffmpeg.FS("writeFile", "recoding.webm", await fetchFile(videoFile));

await ffmpeg.run("-i", "recoding.webm", "-r", "60", "output.mp4");

const mp4File = ffmpeg.FS("readFile", "output.mp4");

console.log("mp4File: ", mp4File);
console.log("mp4File: ", mp4File.buffer);
```

mp4File을 보면

```
Uint8Array(37267) [
    "0": 0,
    ...
    "37266": 48
]
```

수 많은 object를 볼 수 있다.

mp4File.buffer는

`ArrayBuffer(36267)` 값을 얻는다.

해당 값으로는 아무것도 할 수 없기 때문에, blob를 생성한다.  
blob은 자바스크립트 세계의 파일과 같다. 파일과 같은 객체를 만드는 blob이라는 방법이다.

`Uint8Array`와 `ArrayBuffer`에서 Uint8Array는 마음대로 변경이 가능하다.

ArrayBuffer는 raw data = binary data, 즉 실제 파일에 접근하려면 buffer를 사용해야한다.
