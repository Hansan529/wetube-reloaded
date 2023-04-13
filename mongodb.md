# MONGODB

## Array Database

```js
let videos = [
  {
    title: "첫번째 영상",
    rating: 5,
    comments: 2,
    createdAt: "2분 전",
    views: 59,
    id: 1,
  },
  {
    title: "두번째 영상",
    rating: 2,
    comments: 64,
    createdAt: "59분 전",
    views: 1532,
    id: 2,
  },
  {
    title: "세번째 영상",
    rating: 6,
    comments: 152,
    createdAt: "1시간 전",
    views: 665,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
```

기존에 trending에 있던 videos 배열을 전역변수로 변경한다.

li을 클릭하면 해당 id 값을 갖는 주소로 이동시키려고 하기에, video.pug에 h4에 a 태그를 사용한다.

`video(info) -> video(video)`로 다시 변경함

첫번째 방법

    a(href="/videos/" + video.id)=video.title

두번째 방법

    a(href=`/videos/${video.id}`)=video.title

첫번째 방법은 variable과 텍스트를 섞어서 작성하는 방식이며  
두번째 방법은 attribute에서는 사용 할 수 없다. 자바스크립트의 방식과 같이 `` 백틱과 ${}를 사용해야함

각 li들을 눌러보면 id 값에 따른 /videos/1 2 3 으로 이동된다.

<br>

이제 see에 대해 설정을 해 보겠다.

```js
export const see = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("watch");
};
```

ES6문을 이용해서 req.params.id 값을 알아내고 videos(배열) id의 순서 [1,2,3] 을 찾기 위해  
`videos[id - 1]`을 사용한다. 처음부터 id 값을 0 부터 시작하면 id로 지정해도 된다.

```js
const {
  params: { id },
} = req;
```

ES6 문 중에서, 객체 분해 문법 중 다른 방법으로 위와 같이 작성 할 수 있다. 첫번째 코드보다는 길어지지만  
복잡한 객체 구조에서도 수월하게 추출할 수 있다는 점이 있다.

```js
export const see = (req, res) => {
  const {
    params: { id },
  } = req;
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching ${video.title}` });
};
```

req에 들어온 :id 값을 const id에 저장하고, 해당 id-1번째 video 배열에서 title을 추출해서 pageTitle 변수에 보낸다.

<br>

`videos: 가상의 데이터베이스 배열`

> 만약 데이터베이스의 배열의 개수가 50개라고 하면, home.pug에 mixin video가 50개가 생기고,
>
> 50개의 제목은 데이터베이스의 title이 되고, a href="" 값에는 데이터베이스의 id가 된다.
>
> 그래서 a(href=`/videos/${video.id}`) 가 되어 각각 1,2,3,4,5,6 … 으로 50개가 생긴다.
>
> 각 페이지를 접속하면 /videos/\* 로 들어가기에, videoRouter로 들어가게된다.
>
> videoRouter의 `"/:id(\\d+)", see` 에서 see 변수가 실행되고, 1,2,3 … 값들은 :id에 저장된다.
>
> videoController에서는 요청된 값(/videos/:id)을 const id에 저장한다.
>
> 배열 중에서 저장한 id-1 번째 있는 배열을 video 변수에 저장한다. 그리고 pageTitle 변수에 title 값을 전송한다.

다음과 같은 일이 발생한다.

<br>

만약에 videos의 views가 1이라면 "views"가 아닌, "view" 라고 나타나야 하기 때문에 watch.pug를 손봐준다.

    h3 #{video.views} #{video.views === 1 ? "view" : "views"}

h3이 views 값이 되고, 만약 그 값이 1이라면 텍스트는 "view", 아니라면 "views" 삼단 논법을 사용했다. 간단한 조건문이니 IF보다 보기에 좋다.

<br>

수정하기 링크를 생성한다.

    a(href=`/videos/${video.id}/edit`) Edit Video &rarr;

다음과 같이 해야 할 까?, 우리는 videoRouter에서 `/videos/:id(\\d+)/edit` 을 설정했다.  
그러므로 그냥 edit 만 작성하면 된다.

해당 링크를 이동하면 해당 경로로 이동된다.
**localhost:4000/videos/edit**

우리는 :id/edit 경로로 가고 싶은데, 원하는 결과가 나오지 않았다. 그러면 **/edit** 으로 한다면?  
localhost:4000/edit

더욱이 원하지 않은 경로로 이동하게 되었다.

해당 현상이 absolute url과, relative url의 차이점이다.  
현재 /videos/1에 접속해있다면, 1이 edit으로 변경되는 것이다.

## Edit Video

```pug
extends base

block content
  h4 영상 제목 수정하기
  form(action="")
    input(placeholder="영상 제목", value=video.title, required)
    input(value="save", type="submit")
```

form을 통해서, 제목을 수정하고자 하는데 수정한 값을 서버에 전송을 해야 하는데, 그 역할이 action이다.

해당 정보를 같은 주소에 전송해야하니, action은 제거하도록 한다.  
그리고 form의 method 기본 값은 GET이니, 우리는 서버에 전송하기 위해 POST로 변경해준다.

    form(method="POST")

해당 작업을 마치고 save 버튼을 누르면 `Cannot POST /videos/id/edit` 과 같이 나온다.  
id는 접속한 video.id의 값이 나오니 다르다고 걱정하지 않아도 된다.

get의 경우, name을 지정하면 해당 변경 내용이 주소창에 그대로 나타난다.  
`http://localhost:4000/videos/1/edit?title=첫번째+영상`

그와 반대로 POST는 주소창에 어떠한 정보도 주지 않는다.  
파일을 전송하거나, database를 변경할 때 사용하는 것이 POST다.

우리는 videoRouter 에 POST는 없다. 모두 get 밖에 없다. 그래서 추가를 해 주는데,  
get과 post 모두 사용할 때 사용하기 좋은 코드가 있다.

    videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);

edit에서 경로 변경 없이 해당 경로에서 수정을 요청하니, get과 post를 하나의 코드에 작성할 수 있는 것이다. 이렇게 되면 코드 줄 수를 줄일 수 있어서 좋다.

postEdit에서, res.redirect()를 사용하면 브라우저가 자동으로 이동하도록 할 수 있다.

id값이 있으니, 절대 경로를 이용해서, id값의 videos로 이동하도록 한다.

    res.redirect(`/videos/${id}`)

완료!

<br>

### 추출하기

우리는 form의 POST 전송 방식으로 데이터를 받는데, 해당 정보를 확인하려면 어떻게 해야 할까?

마치 req.params처럼 말이다. `req.body` 라는 메소드를 사용하면 된다.

req.body를 이용하기 위해서는 express.unlencoded 라는 것이 필요하다.  
여러 옵션들이 있는데, 일단은 urlencoded를 사용한다.

```js
// server.js
app.use(express.urlencoded({ extended: true }));
app.use("/", globalRouter);
```

`express.urlencoded의 extended: true`는 form이 value들을 이해할 수 있도록 하며 사용할 수 있는 자바스크립트 형식으로 변형시켜준다.

edit에서 수정한 다음, save를 누른다면 다음과 같이 콘솔에 나온다.  
`{ title: 'text' }`: title은 input의 name이고, text는 input에 입력한 값이다.

해당 값도 id와 같이 req.body.title로 값을 추출할 수 있다. title은 input의 name 값이니 참고하기 바람.

<br>

```js
export const postEdit = (req, res) => {
  const {
    params: { id },
    body: { title },
  } = req;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};
```

id에 req.params.id를, title에 req.body.title 값을 지정하고 title을 콘솔에서 보면,  
{ title: 'text' } 이 아닌, text 라는 단어를 추출 할 수 있다.

videos[].title를 'text'로 변경하는 것이다!!!

<br>
<br>

```js
// videoRouter
import { getUpload, postUpload } from "../controllers/videoController";

videoRouter.route("/upload").get(getUpload).post(postUpload);
```

```js
// videoController

export const getUpload = (req, res) => {
  return res.render("upload");
};
export const postUpload = (req, res) => {
  return res.redirect("/");
};
```

다음과 같이, get과 post에 대한 라우터를 생성해준다. upload.pug를 render하기로 했으니 views 파일에 생성해 준다.

그리고 videoRouter의 getUpload와 postUpload에 대해 접근할 수 있는 링크를 생성한다.  
home.pug에다 `a(href="/videos/upload") Upload Video` 추가하여 확인해본다.

Upload Video를 클릭하면, /videos/upload로 이동하며, 이전에 edit 문과 같이 form 요소를 만들어준다.  
그 후, input에 값을 입력하고 submit을 하면, redirect로 인해 / 루트로 이동한다.

해당 값을 출력하기 위해서, postUpload에서 req.body 값을 추출한다. 그러기 위해서는 input에 name이 있어야 출력이 가능하다.

```js
// postUpload
const {
  body: { title },
} = req;
const newVideo = {
  title,
  rating: 0,
  comments: 0,
  createdAt: "방금",
  views: 0,
  id: videos.length + 1,
};
videos.push(newVideo);
return res.redirect("/");
```

videos에 있는 배열에 newVideo를 추가한다. 그 후 / 루트로 이동한다.  
서버를 재시작하면 추가한 배열은 제거된다. 왜냐면 가짜 데이터베이스기 때문이다.

## 데이터베이스 시작

mongoDB는 SQL 기반이 아닌, 문서 기반 데이터베이스이다.  
행과 열로 이루어진 데이터베이스가 아닌, 오브젝트 즉 {} 로 이루어져있다.

- mongoDB 설치

Xcode 명령줄 도구 설치

     xcode-select --install

MongoDB 설치

    brew tap mongodb/brew

    brew install mongodb-community@6.0

MongoDB 실행

    brew services start mongodb-community@6.0

MongoDB 종료

    brew services stop mongodb-community@6.0

<br>

설치되었나 확인하려면 `mongod`를 터미널에 입력해보자.

`mongosh` 를 입력하고 mongodb://url 을 복사하자.

<br>

mongoDB를 설치했으니, nodeJS에도 연결을 해주어야 하기에 `mongoose`를 설치한다.

    npm i mongoose

그 다음 server.js 파일 루트에 `db.js` 라는 파일을 생성한 다음

```js
// db.js
import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/");
```

data를 추가하려면 / 뒤에 이름을 명시해야한다. `/wetube`로 하겠음.

db.js를 server.js에서 불러온다. `import "./db"`

해당 db를 정상적으로 불러왔는지 확인하기 위해 db.js에서 다음과 같은 코드를 작성해준다.

```js
const db = mongoose.connection;

const handleOpen = () => console.log("✅ DB가 연결되었습니다.");
db.on("error", (error) => console.log("DB 오류", error));
db.once("open", handleOpen);
```

on은 클릭과 같이 여러번 계속 발생시킬 수 있다.  
once는 한 번만 발생한다.

<br>

## Video Model

```js
// Video
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: Date,
  hashtag: [{ type: String }],
  meta: {
    views: Number,
    rating: Number,
  },
});
```

mongoose를 불러오고, 데이터의 형식을 데이터베이스에게 알려준다. 직접 데이터를 저장하지 않는 이유는,  
유저가 데이터를 추가하기 때문이다. 해당 데이터 형식을 바탕으로 모델을 생성한다.

```js
const Video = mongoose.model("Video", videoSchema);
export default Video;
```

몽구스의 모델 명은 첫번째 대문자를 사용한다.

<br>

## Our First Query

server에 별별 파일을 다 불러오고 있다. 그래서 해당 코드를 분리해준다. **init.js** 라는 파일을 생성한다.

```js
// server
export default app;

// init
import "./db";
import "./models/Video";
import app from "./server";

const PORT = 4000;

const handleListening = () => {
  console.log(`🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`);
};

app.listen(PORT, handleListening);
```

그 후, videoController로 진입해서, model인 Video를 불러오도록 한다.

    import Video from "../models/Video.js";

<br>

```js
export const home = (req, res) => {
  Video.find({});
  return res.redner("home");
};
```

Video 데이터베이스를 CRUD하는 것에 도움을 주는 메소드 중 find를 사용한다.  
find는 2가지의 방법을 사용하는데, cellback과, parameters 방식이 있는데 callback 방식이 최근에는 사라졌다.

{}의 경우, **search terms** 이라고 하는데 해당 요소가 비어있으면, 모든 형식을 찾는다.

```js
export const home = (req, res) => {
  Video.find({})
    .then((videos) => {
      console.log("videos", videos);
    })
    .catch((err) => {
      console.log("errors", err);
    });
  console.log("안녕");
  return res.render("home", { pageTitle: "Home", videos: [] });
};
```

에러가 발생하지 않는다면 터미널에는 **videos []** 값만 보게 될 것이다.  
해당 코드로 database와의 통신이 된 것이다!

하지만 의문이 드는것이, 분명 videos가 먼저 console에 나와야하는데, 뒤에 작성한 "안녕" 이 먼저 출력이 되는 것을 알 수 있다.  
왜그럴까? 요청한 사항을 일단 다 받고, 오래걸리는 사항은 나중에 실행하기 때문에, 즉각 출력이 되는 "안녕"이 먼저 출력되는 것이다.

카페에서 음료를 주문하는데, 앞에 주문건이 커피 1잔, 커피 20잔이 있고 나 또한 커피 1잔을 주문하는데, 일반적인 서버의 경우  
개인 -> 단체 -> 개인, 주문 들어온 순서대로 처리하지만, node.js 서버는 개인 -> 개인 -> 단체 순으로 일처리를 한다.

금방 출력되고 갈 사람인데, 늦게까지 기다리지 않도록 할 수 있다.

**정리하자면 일반 서버는 순차적으로 처리하는 동기 처리 방식이며,  
노드서버는 비순차적으로 처리, 동시에 처리하는 방식이 비동기 처리 방식이다.**

개선된 버전이다.

```js
export const home = async (req, res) => {
  console.log("안녕");
  const videos = await Video.find({});
  console.log("안녕2");
  return res.render("home", { pageTitle: "Home", videos: [] });
};
```

순서대로 출력이 된다. 자바스크립트는 기다리는 기능이 없지만, await으로 인해 database가 불러와질 때 까지 기다리다가,  
완료되면 출력을 재시작한다. 비동기 방식을 await으로 동기 처리 방식으로 변경한다.

**await은 함수가 async 일 때만 가능하다**
자바스크립트가 await 하는 동안, 오류가 발생하면 try-catch문의 catch가 이를 발견하고, try에 있던 await 뒤에 있던 코드를 실행하지 않고, 즉각 catch 문을 실행한다.