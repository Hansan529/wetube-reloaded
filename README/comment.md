# Comment

## Flash Message

로그인한 유저는 접근할 수 없도록 막아 놓은 middleware에 대해서, 현재는 말 없이 홈 화면으로 돌려보내고 있는데,  
이동하면서 메시지를 주기 위해서 express의 flash 를 사용하도록 하자.

```bash
$ yarn add express-flash
```

`server.js`에서 불러와 준 다음에, middleware 처럼 사용해주면 된다.

```js
import flash from "express-flash";

app.use(session({
  ...
}))

app.use(flash());
app.use(localsMiddleware);
```

설치 한 다음부터는 `req.flash` 를 사용할 수 있다.

메시지의 타입과 내용을 작성해주면 된다.

`req.flash("error", "존재하지 않는 유저입니다.");` 해당 코드를 `console.log(req.flash('error'))` 로 출력해보면  
**[ '존재하지 않는 유저입니다.' ]** 라고 확인이 된다.

pug에서 `messages.타입` 을 통해 호출이 가능하다.

```pug
//- message
mixin message(kind, text)
  div.message(class=kind)
    span=text

//- base
if messages.error
  +message("error", messages.error)
if messages.info
  +message("info", messages.info)
if messages.success
  +message("success", messages.success)
```

알림들을 스타일링 할 수 있도록 mixin으로 분리해줄 수 있다.

---

## Comment Models

```js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
```

```js
// Video.js
...
comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
```

```js
// User.js
...
comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
```

기존 모델에서 comments에 대해 참조하도록 추가,

하나의 Video에 여러개의 Comment가 있을 수 있으니 [] 배열 형식으로 생성해준다.  
마찬가지로 User에서도 한 명의 유저가 여러개의 Comment를 남길 수 있으니 배열로 생성한다.

---

## Comment Box

```pug
//- watch
if loggedIn
    .video__comments
      form.video__comments-form#commentForm
        textarea(cols="30", rows="10")
        button 작성하기
```

로그인한 유저만 form 을 볼 수 있도록 한다.

```js
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");
const videoContainer = document.getElementById("videoContainer");

const handleSubmit = (e) => {
  e.preventDefault();
  const text = textarea.value;
  const video = videoContainer.dataset.id;
};

form.addEventListener("submit", handleSubmit);
```

form 요소의 버튼을 클릭하면 제출을 하게 되는데 기본 동작 요소를 정지시켜준다.  
로그인한 상태라면 오류가 없지만 로그인을 하지 않은 상태에서 해당 watch 페이지를 렌더링하면  
textarea, btn 상수가 null 이라 오류가 발생 한 다.

그래서 아예 form이 있을 경우에만 실행하도록 변경한다.

```pug
block content
  if loggedIn
    script(src="/assets/js/commentSection.js")
```

```js
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
```

pug에서 애초에 로그인일 경우에만 스크립트를 불러오도록 하며, form이 있을 경우에만 handleSubmit 함수를 실행하도록 설정한다.  
그렇게 되면 로그인을 하지 않았을 경우에도 watch page에 접속했을 때 오류가 발생하지 않는다.

<br>

---

## API Router

textarea에 작성한 value 들을 back-end로 전송해야하는데, 이 단계에서 api를 이용한다.

```js
...
await fetch(`/api/videos/${videoId}/comment`, {
  method: "POST",
  body: {
    text,
  },
});
```

해당 경로에 POST 형식으로 body에 text를 포함한 채 호출한다.

req.params 를 확인해보면 정상적으로 출력이 되는데, req.body에서는 아무런 정보도 나오지 않는다.

Payload를 확인해보면 Request Payload [object Object] 라고, 텍스트가 아닌 object를 보내고 있다.  
url을 받을 수 있도록 express.urlencoded({ extended: true })와 마찬가지로  
express.text()를 추가해준다.

```js
app.use(express.text());
```

모든 text를 받아서 req.body에 넣어주는 역할을 해준다. 웹사이트에 request로 들어오는 text를 이해 할 수 있다.

```js
const text = textarea.value;

await fetch(`/api/videos/${videoId}/comment`, {
  method: "POST",
  body: text,
});
```

body { text } &rarr; body : text 로 변경해서, body : "textassdasd" 가 되어 Payload에서도 확인이 가능하다.

문제는, 한 가지 이상을 전송하려면 object를 사용해야 한다는 것이다.  
그래서 JSON.stringify를 사용해서 이 문제를 해결할 것이다.

```js
JSON.stringify({ text: "abc", text2: "zxc" });
```

다음과 같이 변환된다.

```json
"{\"text\":\"abc\",\"text2\":\"zxc\"}"
```

JS object가 아니기 때문에, `req.body.text`, `req.body.rating` 과 같이 불러올 수 없다.

JSON을 JS object로 변경을 해주기 위해 미들웨어를 `.text` &rarr; `.json`으로 수정해준다.
.json이 하는 일은 `JSON.parse({},{})` 을 해주어 JS object로 변환해준다.

근데 변경하고 다시 확인해보면 변한 게 없다... 왜냐면 Express가 text를 보낸다고 생각하기 때문에 원하는 답이 나오지 않았다.  
json으로 보낸다고 말해주어야 한다.

```js
await fetch(`/api/videos/${videoId}/comment`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text }),
});
```

request에 headers 설정에 json으로 요청을 하면 Express는 json으로 요청이 들어온다고 알게 된다.

<br>

---

## Commenting

fetch를 통해 요청하면 credentials가 "same-origin" 이 기본값인데, Origin이 동일한 경우 쿠키를 전송한다는 의미다. "include" 로 설정하면 모든 쿠키를 전송한다.

HTTP 요청과는 정 반대이다. HTTP 요청은 credentials: "omit" 로 절대 쿠키를 전송하지 않는 설정이 기본값이다.

그래서 전달받은 쿠키로는 세션을 알 수 있고, **세션으로 사용자를 알 수 있다.**

해당 정보를 통해 데이터베이스에 정보를 저장할 수 있다.

```js
// videoController.js
export const creatEcomment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  res.sendStatus(201);
};
```

params: id, body: text, session: user 값을 가져오고, Video를 찾은 뒤,  
comment에 body에서 받은 text 값을 넣어 Comment를 생성한다.

---

## Realtime Comments

fetch에서 약간 수정해준다.

```js
const { status } = await fetch(`/api/videos/${videoId}/comment`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text }),
  credentials: "same-origin",
});
textarea.value = "";
```

fetch는 Promise를 받는데, 시간이 걸려서 await으로 기다리고, response를 받는데, response에는 여러 값이 있다.

> Response {type: 'basic', url: 'https://wetube.hxan.net/api/videos/645b2299329090c8596cf6f2/comment', redirected: false, status: 201, ok: true, …}  
> body : (...)  
> bodyUsed : false  
> headers : Headers {}  
> ok : true  
> redirected : false  
> status : 201  
> statusText : ""  
> type : "basic"  
> url : "https://wetube.hxan.net/api/videos/645b2299329090c8596cf6f2/comment"  
> [[Prototype]] : Response

우리는 status를 사용할 것이다.

```js
console.log(status);
if (status === 201) {
  console.log("가짜 댓글");
}
```

```
201
가짜 댓글
```

status가 201이여서 console.log가 실행되는 모습이다.

현재 댓글은 pug에서 comments의 목록을 가져와서 작성하는데, JS를 이용해서 실시간 댓글처럼 보이도록 할 것이다.

```js
const addComment = async (text) => {
  // 추가할 ul을 선택
  const videoComments = document.querySelector(".video__comments ul");

  // li 생성 및 클래스 이름 지정
  const newComment = document.createElement("li");
  newComment.className = "video__comment";

  // img 생성 및 클래스 이름 지정
  const img = document.createElement("img");
  img.className = "video__comment-owner";
  // img 경로를 얻기 위해 api 호출
  const response = await fetch(`/api/videos/${videoId}/profile`, {
    method: "POST",
  });
  // 결과 값을 json으로 받음
  const data = await response.json();

  // avatarUrl의 마지막 배열을 선택함 (최근 submit한 목록)
  const avatarUrl = data.avatarUrls[data.avatarUrls.length - 1];
  img.src = avatarUrl;

  // CORS 정책 허용
  img.crossOrigin = "anonymous";

  // span 생성 및 매개변수로 받은 text 추가
  const span = document.createElement("span");
  span.innerText = text;

  // li에 마지막 위치에 img 태그 추가
  newComment.appendChild(img);
  // li에 마지막 위치에 span 태그 추가
  newComment.appendChild(span);
  // ul의 첫번째에 li 추가
  videoComments.prepend(newComment);
};
```

back-end code

```js
export const commentProfile = async (req, res) => {
  const {
    params: { id },
  } = req;

  // video 찾은 뒤, comments 목록 불러오기
  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });

  // video.comments 배열을 반복문을 돌려 owner.avatarUrl 값을 avatarUrls에 저장함
  const avatarUrls = video.comments.map((comment) => comment.owner.avatarUrl);

  // json 형태로 avatarUrls를 반환함
  res.status(200).json({ avatarUrls });
};
```

back-end에서 `.json({ avatarUrls })`로 json으로 내보내고, front-end에서 `await response.json()` json 형태로 받고,  
배열의 마지막의 avatarUrl을 얻어 img에 적용하고

`if (status === 201)` 에서 받은 `addComment(text)` 매개 변수를 span에 대입하고 append, prepend하여 front-end에서 볼 수 있다.

새로고침하면 사라지지만, pug에서 데이터베이스에 생긴 값을 바탕으로 생성하기 때문에 문제없다.

---

## Comment Ids

댓글을 작성했으면 삭제도 해야하는 법

```pug
if String(loggedInUser._id) === String(comment.owner._id)
  span.video__comment-delete ❌
```

일단, 댓글 작성자와 로그인한 유저가 동일할 경우만 target 보이도록 설정하고,

```js
// apiRouter
apiRouter.post("/videos/:id([0-9a-f]{24})/comment-delete", deleteComment);
```

front-end에서 back-end로 정보를 업데이트할 것이기 때문에, api를 사용하기 위해 router 생성 및 연결을 해준다.

```js
export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id: loginUser },
    },
    body: { index },
  } = req;

  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });
  const comments = video.comments.map((comment) => ({
    _id: comment._id,
    text: comment.text,
    owner: comment.owner,
  }));

  const comment = comments[comments.length - 1 - index];

  if (String(loginUser) !== String(comment.owner._id)) {
    return res.sendStatus(401);
  }

  await Video.findOneAndUpdate(
    { _id: id },
    { $pull: { comments: comment._id } },
    { new: true }
  );

  return res.sendStatus(200);
};
```

Video의 comments 정보 모두를 가져올 필요는 없으니, id와 텍스트, 작성자에 대한 정보만 가져온다.

pug에서 반복문으로 데이터베이스의 역순으로 나열하기 때문에, 0 -> 마지막 배열이 되어서 선택자를 바꿔야한다.  
그래서, comments의 개수에서 0부터 시작하니 -1, 그리고 index가 커질수록 줄어들어야 하기 때문에 index도 빼주면 된다.

front-end에서 이미 로그인한 유저만 접근 할 수 있지만, back-end에서도 이중 체크를 해준다.  
로그인한 유저와 owner가 같은지 체크하고, 일치하지 않는다면 오류 코드를 반환시킨다.

그 다음, $pull 연산자를 사용해 일치하는 요소를 배열에서 제거하고, 업데이트한 요소를 갖고 오기 위해 new를 사용한다.

그러면 댓글 제거 성공

---

`span.video__comment-text`에 dataset.id로 해당 comments id를 설정하는 방법도 있다.  
해당 방법이 관리하기 더 좋은 것 같다.
