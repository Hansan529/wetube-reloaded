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

---

## Thumbnail

`await ffmpeg.run("-i","recoding.webm", "-ss", "00:00:01", "-frames:v", "1", "thumbnail.jpg");`

-ss는 특정 시간대로 이동하는 속성이며, -frames:v, 1는 1초에 있는 장면을 저장하는 것이다.

video와 마찬가지로 Blob를 생성하고 연결해준다.

```js
const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");
const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
const thumbUrl = URL.createObjectURL(thumbBlob);

const thumbA = document.createElement("a");
thumbA.href = thumbUrl;
thumbA.download = "MyThumbnail.jpg";
document.body.appendChild("thumbA");
thumbA.click();
```

- 영상의 1초 후 사진을 사용하기 떄문에, 1초보다 작다면 오류가 발생한다는 점

브라우저에 계속 남아 있으면 속도가 느려지니 제거해준다.

```js
...

ffmpeg.FS("unlink", "recording.webm");
ffmpeg.FS("unlink", "output.mp4");
ffmpeg.FS("unlink", "thumbnail.jpg");
```

브라우저에는 mp4Url, thumbUrl이 존재하니 소스파일인 recording.webm 파일도 제거한다.

```js
URL.revokeObjectURL(mp4Url);
URL.revokeObjectURL(thumbUrl);
```

URL 객체를 메모리에서 지우기 위해 revoke를 사용해준다.

<br>

### cors

**현재 문제가, 비디오, 오디오 권한을 얻기 위해 사이트가 https로 변경되어서, 다른 링크에 있는 자료를 가져오기 위해서는 CORS를 허용해주어야 한다.**

직접 다음과 같은 코드를 입력해도 되지만, 미들웨어 패키지로 쉽게 사용하는 것이 편하다.

```js
res.setHeader("Access-Control-Allow-origin", "*");
res.setHeader("Access-Control-Allow-Credentials", "true");

res.end();
```

```bash
$ yarn add cors
```

```js
import express from "express";
import cors from "cors";

const app = express();

app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(
  cors({
    origin: "*",
  })
);
```

Network에서 보면, `Access-Control-Allow-Origin: *`이 보인다.  
쿠키 값을 보내려면 credentials 옵션을 설정해주어야한다.

단 Origin을 *로 할 경우 credentials은 에러가 발생한다. *이 아닌 직접 명시해주어야 한다.

- 요청이 들어오면 app.use(cors()) 를 통해 CORS 설정을 적용한다.
- 서버에서 클라이언트로 Access-Control-Allow-Origin 헤더를 res.header에서 설정해, 허용 여부를 결정한다.
