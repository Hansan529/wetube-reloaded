# Router

## 4.0 What are Routers?

> /edit-user → Edit User  
> /delete-user → Delete User  
> /watch-video → What Video  
> /edit-video → Edit Video  
> /delete-video → Delete Video

하는 일에 따라 주소를 정하면 이와 같을 것이다.

<br>

주제(도메인)에 맞도록 라우터를 정리하여 관리하는 것이 수월하다.

> / → home  
> /join → Join  
> /login → Login  
> /search → Search
>
> /user/edit → Edit User  
> /user/delete → Delete User
>
> /video/watch → Watch Video  
> /video/edit → Edit Video  
> /video/delete → Delete Video  
> /video/comments → Comment on a video  
> /video/comments/delete → Delete A

라우터는 작업중인 주제를 기반으로 URL을 그룹화한다.

<br>

여기서, /, /join, /login, /search는 왜 user, video에 속하지 않냐는 생각이 들 수도 있다.

**글로벌 라우터**로 지정히여 사용하는 것이 오히려 **접근성**에는 좋기 때문에, 홈페이지에서  
바로 접속이 가능한 루트에는 사용을 하는 것이 좋다.

하지만 간략하게 하여 접근이 쉽도록 할 때 예외로 router를 만들기도 한다. 두 차이를 보면 이해하기 쉽다.

> /wetube-reloaded/join  
> /wetube-reloaded/users/join

두 가지 링크 중에서 더 이해하기 쉬운 링크는 어떤 것인가? 생각해보자.

<br />

라우터에 대해 알았으니, 생성하는 방법에 대해 알아보자

```js
// 생성
const globalRouter = express.Router();
const userRouter = express.Router();
const videoRouter = express.Router();

// 사용
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
```

Router들의 첫 페이지를 생성한다.

```js
const handleHome = (req, res) => res.send("home");
const handleEditUser = (req, res) => res.send("Edit User");
const handleWatchVideo = (req, res) => res.send("Watch Video");

globalRouter.get("/", handleHome);
userRouter.get("/edit", handleEditUser);
videoRouter.get("/watch", handleWatchVideo);
```

/videos/watch 와 같이 지정하지 않은 url 에 대해 요청을 하면,

Express는 app.use에서 url에 대한 router를 실행시킨다.  
/videos 라는 경로가 있으니, videoRouter 함수가 실행 될 것이다.

videoRouter에는 /watch 라는 경로에 접근하면, handleWatchVideo 함수를 실행하여  
결국 "Watch Video" 메시지를 얻을 수 있다.

그 덕분에 /videos/watch 라고 지정을 하지 않아도 이동이 된다.

```
주소창: /videos/watch -> /videos(VideoRouter) -> /watch(handleWatchVideo) -> res.send
```

/videos/watch에서 /videos를 찾아서 접속하고 /watch를 찾아서 접속하는 방식이다.

<br />

## 4.2 Cleaning the Code

작동하는 코드를 완성했을 때, **너저분한** 코드를 정리해주어야 한다.

우선 컨트롤러와 라우터를 분리해준다. 모듈과 같이 별도의 파일에서도
독립적으로 작동해야하기에, 분리한 파일에서도 express를 import 해야 한다.

```
 // 기존 파일 구성 (통합)
src / server.js;

// 이후의 파일 구성 (분리)
src / routers / globalRouter.js;
src / routers / userRouter.js;
src / routers / videoRouter.js;
```

server.js 에서 router들을 불러오기 위해서는 router에서 export를 진행해야
한다. 개개인의 독립적인 파일이기에 공개되어있지 않아서, 같은 이름을
지정하더라도 아무런 문제가 없다.

우리는 파일 자체를 import 할 것이 아닌, 변수만 import 하고자 하는 것이기에
코드를 작성해준다.

```js
// server.js
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

// globalRouter.js
export default globalRouter;

// userRouter.js
export default userRouter;

// videoRouter.js
export default videoRouter;
```

server 파일에 있던 코드를 모두 옮기고 Router에서는 Export를 하며
server.js에서는 이를 import 하여 이용한다. 여러개의 Router를 추가해도
동일하다.

```js
// userController.js
const join = (req, res) =>; res.send("Join");
export default join;

// videoController.js
const trending = (req, res) =>; res.send("Home Page Videos");
export default trending;

// globalRouter.js
import express from "express";
import join from "../controllers/userController";
import trending from "../controllers/videoController";

const globalRouter = express.Router();

globalRouter.get("/", trending);
globalRouter.get("/join", join);

export default globalRouter;
```

Router를 server에서 독립시킬 때와 마찬가지로 별도의 js에서 controller
변수를 지정하고, export한 다음 router에서 import하는 것이다.

다만 문제점은 export default는 **하나밖에 export하지 못한다.** 그래서 이름
상관 없이 지정할 수 있는 것이다.

    import 아무이름 from "../controllers/videoController.js"

export default 로 내보내기 했으니, 해당 파일에서 import 해 오는 변수는  
trending 인 것을 알 수 있기때문에 이름에 대한 제한이 없는 것이다.

<br>

하지만 export를 변수 앞에 지정해줄 경우, 여러개를 export 할 수 있다.
단 정확한 이름을 작성해주어야 값을 불러온다.

```js
// userController.js
export const join = (req, res) => res.send("Join");

// videoController.js
export const trending = (req, res) => res.send("Home Page Videos");

// globalRouter.js
import { join } from "../controllers/userController";
import { trending } from "../controllers/videoController";

globalRouter.get("/", trending);
globalRouter.get("/join", join);
```

만약에 없는 router를 불러올 경우 에러가 발생한다.  
`Route.get() requires a callback function but got a [object Undefined]`

<br />

## 복습

```js
// 현재까지의 코드

// server.js
import express from "express";
import morgan from "morgan";

import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

const app = express();
const logger = morgan("dev");

app.use(logger);
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
const handleListening = () =>; console.log(`Server listening on port http://localhost:${PORT} 🚀`);
app.listen(PORT, handleListening);
```

```js
// globalRouter.js
import express from "express";
import { join } from "../controllers/userController";
import { trending } from "../controllers/videoController";
const globalRouter = express.Router();
globalRouter.get("/", trending);
globalRouter.get("/join", join);
export default globalRouter;
```

```js
// videoRouter.js
import express from "express";
import { watch, edit } from "../controllers/videoController";
const videoRouter = express.Router();
videoRouter.get("/watch", watch);
videoRouter.get("/edit", edit);
export default videoRouter;
```

```js
// userRouter.js
import express from "express";
import { edit, remove } from "../controllers/userController";
const userRouter = express.Router();
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
export default userRouter;
```

```js
// userController.js
export const join = (req, res) =>; res.send("Join");
export const edit = (req, res) =>; res.send("Edit User");
export const removed = (req, res) =>; res.send("Remove User");
```

```js
// videoController.js
export const trending = (req, res) =>; res.send("Home Page Videos");
export const watch = (req, res) =>; res.send("Watch");
export const edit = (req, res) =>; res.send("Eidt");
```

/users + /edit 을 자동으로 해주어서 /users/edit 과 같이 get을 작성하지 않아도 된다.

라우터는 url을 그룹화 하는 방법이다.

<br>

```js
// export default
import abc from "default";
```

abc 이지만 기능은 "default" 함수이다.

<br>

```js
// export
import { function-name } from "../"
```

object를 열고 그 안에 export 한 상수 이름 그대로 사용해야 한다.  
추가로, from 이후 ""에 단어만 있을 경우 express는 node_modules에서 찾아본다  
/, ../와 같은 절대, 상대주소를 이용하면 경로로 인식한다.

<br>

## 4.6 Planning Routes

```js
/ → home
/join → Join
/login → Login
/search → Search

/user/:id → See User
/user/logout → Log Out
// 현재 로그인 중인 유저만 가능함
/user/edit → Edit My Profile
/user/delete → Delete My Profile

// 누구나 동영상을 볼 수 있음
/video/:id → See Video
// 작성자만 가능함
/video/:id/edit → Edit Video
/video/:id/delete → Delete Video
// 로그인 시 누구나 업로드 할 수 있음
/video/upload → Upload Video

```

```js
// globalRouter
login, search Router 생성,
login, search import

// userRouter
logout, see Router 생성
logout, see import
// userController
login, logout, see Controller 생성
login, logout, see import

// videoRouter
upload, delete 생성 watch ->; see 변경
// videoController
search, upload, deleteVideo Controller 생성 watch ->; see 변경

```

<br />

## 4.7 URL Parameters

4.6에서 있던 router 중에 :id라는 항목이 있는데, :(파라미터) 라고 명칭한다

url 안에 변수를 포함시킬 수 있게 한다. 주소에 아래와 같이 입력 후 접속을
시도해보자

<p class="codeline">
<a
href="http://localhost:4000/videos/62483247"
style="color: #fff; text-decoration: none"
>http://localhost:4000/videos/62483247</a
>

분명 62483247 이라는 router를 만들지 않았는데, videoController의 see
Controller가 실행되어 결과로 "See" 와 같은 텍스트를 볼 수 있다.

```js
// videoController
export const see = (req, res) =>; {
console.log(req.params);
return res.send("See");
};
```

/video/ 를 통해 접속을 해보면 콘솔에 입력한 url의 주소를 확인 해 볼 수
있다.

{ id: `62483247` }
파라미터 이름과 url 함수값을 확인 할 수 있다.

또한 Router의 위치가 중요한데, 파라미터를 사용한 Router 뒤에, id값 자리에
들어가는 주소가 있다면, 그걸 주소가 아닌 id로 해석하여 원하지 않는 결과를
얻을 수 있기에 순서가 중요하다

```js
// videoRouter
videoRouter.get("/:id", see);
videoRouter.get("/upload", upload);

// videoController
export const see = (req, res) =>; {
return res.send(`Watch Video #${req.params.id}`);
};

// web
http://localhost:4000/videos/upload /* Watch Video #upload */
```

분명 upload Router를 실행하기 위해서 upload를 입력하고 req를 줬는데,
돌아온 답은 see 함수를 확인할 수 있다. 순서를 다시 upload가 위에 있다면
정상적인 답을 얻을 수 있다.

express가 router를 id로 인식하지 않도록 순서를 잘 확인하자.

만약 파라미터값을 숫자만 받고자 한다면 정규식을 이용해야한다. 다양한 식이
있지만, 일단 작게 알아보자

```js
videoRouter.get("/:id(\\d+)", see); d(digit): 숫자만 선택한다. w: 아무 단어를 선택한다. +: 전체 선택한다
videoRouter.get("/:id(\\d+)/edit", edit); js에서는 \를 하나 더 붙여서 작성한다
videoRouter.get("/:id(\\d+)/delete", deleteVideo);
videoRouter.get("/upload", upload);
```

정규식을 사용해 숫자만 받게되면, upload의 위치를 옮겨도 정상 작동한다.
upload는 문자이고, 파라미터는 숫자만을 입력받으니 조건에 맞지 않아
upload가 실행되는 거다

<br />

```js
루트 라우트 /에 일치시킨다
app.get('/', function (req, res) {
res.send('root');
});

req를 /about에 일치시킨다
app.get('/about', function (req, res) {
res.send('about');
});

/random.text에 일치시킨다
app.get('/random.text', function (req, res) {
res.send('random.text');
});

문자열 패턴을 기반으로 하여 acd, abcd와 일치한다 (b 선택)
app.get('/ab?cd', function(req, res) {
res.send('ab?cd');
});

abcd, abbcd, abbbcd 등과 일치한다 (여러번 가능)
app.get('/ab+cd', function(req, res) {
res.send('ab+cd');
});

abcd, abxcd, abRABOMcd 및 ab123cd 등과 일치한다 (아무런 텍스트)
app.get('/ab*cd', function(req, res) {
res.send('ab*cd');
});

/abe 및 /abcde와 일치한다 (그룹 선택)
app.get('/ab(cd)?e', function(req, res) {
res.send('ab(cd)?e');
});

라우트 이름에 "a"가 포함된 모든 항목과 일치시킨다
app.get(/a/, function(req, res) {
res.send('/a/');
});

butterfly 및 dragonfly와 일치, butterflyman 및 dragonfly man 등과 일치하지 않음 (정확)
app.get(/.*fly$/, function(req, res) {
res.send('/.*fly$/');
});

```

</body>
</html>
```
