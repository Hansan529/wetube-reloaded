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
