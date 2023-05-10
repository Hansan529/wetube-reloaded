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
