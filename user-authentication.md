# User Authentication

## Create Account

modles 경로에 스키마를 생성해주자.

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minLength: 2 },
  username: { type: String, required: true, unique: true, minlength: 4 },
  password: { type: String, required: true, minlength: 4 },
  email: { type: String, required: true, unique: true },
  emailType: { type: String, required: true },
  location: String,
});

const User = mongoose.model("User", userSchema);

export default User;
```

다음과 같은 형태로 스키마를 작성하고, User 모델을 export한다. 해당 작업은 Video와 동일하다.  
그 후, controller에서 해당 모델을 불러오고 작업을 진행한다.

유저는, userController 파일에서 불러온다.

```js
import User from "../models/User";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "회원가입" });
};

export const postJoin = async (req, res) => {
  const {
    body: { name, username, password, email },
  } = req;
  try {
    await User.create({
      name,
      username,
      password,
      email,
    });
  } catch (err) {
    console.log(err);
    return res.render("join", { pageTitle: "회원가입", errorMessage: error._messageerrorMessage: error._message, });
  }
};
```

```pug
extends base

block content
  if (errorMessage)
    span=errorMessage
  form(method="POST")
    input(name="name", placeholder="별명", required, uniquem type="text" minlength="2")
    input(name="username", placeholder="아이디", required, unique, type="text", minlength="4")
    input(name="password", placeholder="비밀번호", required, type="password" pattern="^[a-zA-Z0-9`~!@#$%^&*()\\-+{}|\;':", minlength="4")
    input(name="email", placeholder="이메일", required, type="email")
    input(type="submit", value="가입하기")

```

input들을 만들고, 해당 정보를 입력하고 submit 해보자. 그렇게 되면 데이터베이스 users에 저장된다.

```bash
$ mongosh
```

```bash
$ use wetube
```

```bash
$ db.users.find()
```

현재 users에 저장된 모든 데이터베이스 목록들이 보인다. 문제는, password도 그대로 저장된다는 게 문제다.

패스워드를 해시화를 하여 암호화를 할 것이다.

해싱은 일방향 함수라서, 해싱된 내용으로 해싱 전 입력값으로 되돌릴 수 없다는 장단점이 있다.

해싱을 해주는 패키지를 다운받자.

```bash
$ npm i bcrypt
```

해당 패키지는

```js
bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {});
```

형식으로 사용이 가능한데, myPlaintextPassword 에 password input값 대입하고, saltRounds에 n번 해싱하는 작업을 하는 일을 해준다.

만약 Hello!를 해싱한다면, `bcrypt.hash("Hello!", 5, function(err, hash){});` Hello!를 5번 해싱하는 일을 한다.  
1번 해싱한 값을, 그대로 다시 해싱하고 하는 반복작업을 한다. 이는 Rainbow table을 방지하기 위함이다.

사용자가 로그인을 할 때, 비밀번호를 입력하면, 해당 비밀번호를 n번 해싱하고, 그 결과값이 같은지 비교하는 방식이다.

모델이 만들어지기 전에 해야 하기 떄문에, User에서 다음과 같이 변경해준다.

```js
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema...

userSchema.pre('save', async function(){
  this.password = await bcrypt.hash(this.password, 5);
})
```

context, function 안에서 this는 create 되는 것들을 나타낸다. **.pre**를 이용해 'save' 하기 전에 실행되도록  
middleware를 생성해준다.

해당 미들웨어에는 this, 생성되기 전이니까 input에서 받은 req.body 값들로 User.create 하는 요소를 선택한다.  
**this.password** 해당 데이터베이스 요소의 패스워드를 가져와서, bcrpyt로 해싱을 5번 진행한 해싱값을 대입한다.

pre에 해싱 전, 후를 `console.log` 해보면 다음과 같이 확인이 가능하다.

```json
해싱전 this {
  name: '별명',
  username: '아이디-',
  password: 'password',
  email: 'asd@asd.com',
  location: '거주지',
  _id: new ObjectId("643c912930a8b223498f32a7")
}
해싱전 this.password password
```

password 값이 그대로 데이터베이스에 저장되는 모습이다.

다음은 해싱을 한 이후다.

```json
해싱이후 this {
  name: '별명',
  username: '아이디-',
  password: '$2b$05$G6GUw510rgu1XLcCmxW4v.Y80NPxqnIcNOw2z9inIk.UAY2nKCKte',
  email: 'asd@asd.com',
  location: '거주지',
  _id: new ObjectId("643c912930a8b223498f32a7")
}
해싱이후 this.password $2b$05$G6GUw510rgu1XLcCmxW4v.Y80NPxqnIcNOw2z9inIk.UAY2nKCKte
```

알아 보기 힘든 난수로 저장되어있는 모습을 볼 수 있다.

Video를 생성할 때, static을 사용한 것과 같이 모델을 생성하기 전에 작업을 진행한 것이다.

User.js의 해싱 횟수를 변경하면 같은 입력값이여도 다른 해싱값이 나온다.

---

## Form Vaildation

우리는 input에서 user를 생성하는데, 데이터베이스에서 unique 옵션을 사용해서, 중복이라면 콘솔에서는 에러라고 나오지만,  
사용자는 알 지 못하기 때문에, 이를 전달해주기 위해서 다음과 같이 작업해준다.

```js
// userController
const pageTitle = "회원가입";

const userExists = await User.exists({ username });
if (userExists) {
  return res.render("join", {
    pageTitle,
    errorMessage: "이미 사용중인 아이디입니다",
  });
}
```

pageTitle은 반복적으로 사용하니, 아예 상수로 선언해서 호출하도록 하고,  
exits를 사용해서, 데이터베이스의 username이 post 한 값과 일치한다면 errorMessage 값을 전달한다.

이메일도 마찬가지인데, 이걸 $or 을 사용해서 하나의 코드로 작성할 수 있다.

```js
const exists = await User.exists({
  $or: [{ username }, { email }],
});

if (exists) {
  return res.render("join", {
    pageTitle,
    errorMessage: "이미 사용중인 아이디/이메일 입니다.",
  });
}
```

만약, 데이터베이스에서 확인했을 때, exists에서 true라면, 에러메시지를 보내며 이후 코드를 실행하지 않도록 한다.

비밀번호는 오기 할 수 있기 때문에, 확인차 하나의 input을 더 생성하고, 확인해주어야한다.  
그래서, password와 passoword2로 지정하고 Controller에서 비교를 한다.

```js
if (password !== password2) {
  return res.render("join", {
    pageTitle,
    errorMessage: "비밀번호가 일치하지 않습니다",
  });
}
```

!== 연산자로, 일치하지 않을 경우 실행하도록 한다. return을 통해, 종료시킨다.

<br>

## Status Code

POST로 서버로 Join의 값을 전달하는데, 브라우저는 해당 아이디와, 비밀번호를 저장할 지에 대한 팝업을 띄운다.  
하지만, 이는 데이터베이스에 저장되지 않아도 발생하는데, 이를 해결하기 위해서 상태 코드를 알아볼 것이다.

처음에는 **200** 을 나타내지만, 새로고침하면 304로 나온다. 이는 캐싱 되어 기존에 로딩한 요소를 재사용하는 것이다.  
덕분에 속도가 빠른 것이다

2xx 코드는, 성공을 의미한다.  
200은 OK를 뜻한다.

3xx은 리다이렉션 완료 - 캐싱을 이용한 것이다

4xx은 요청 오류 - 클라이언트에 오류가 있음을 나타낸다.
400(잘못된 요청): 서버가 요청의 구문을 인식하지 못했다.

패스워드 미일치문에 다음과 같이 status를 추가하여 브라우저에서 해당 팝업이 나오지 않도록 한다.

```js
if (exists) {
  return res.status(400).render("join", {
    pageTitle,
    errorMessage: "이미 사용중인 아이디/이메일 입니다.",
  });
}
```

팝업이 나오지 않도록 하는 이유도 있지만. 4xx 코드를 브라우저에서 받는다면, 해당 URL은 히스토리에 남기지 않는다. 그래서 알맞은 status 를 작성해주는게 좋다.

<br>

## Login

username, password가 일치하면 로그인에 성공하는 단계이다.  
입력받은 비밀번호에다가, hash를 5번 하고, 대입한 뒤에 비교해보자 하고 코딩을 했다.

```js
import bcrypt from "bcrypt";

export const postLogin = async (req, res) => {
  const pageTitle = "로그인";
  const { username } = req.body;
  let { password } = req.body;
  password = bcrypt.hash(password, 5);

  const exists = await User.exists({
    $and: [{ username }, { password }],
  });
};
```

아쉽지만 실패했다. brpy.hash는 매번 실행 할 때마다 결과가 다른 hash값을 생성하기 때문에,  
compare 함수로 변경해서 사용해야했다.

```js
export const postLogin = async (req, res) => {
  const pageTitle = "로그인";
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: " 아이디 또는 비밀번호를 잘못 입력했습니다.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: " 아이디 또는 비밀번호를 잘못 입력했습니다.",
    });
  }
  return res.render("login", {
    pageTitle,
    errorMessage: "??",
  });
};
```

**User** Collection에서, 입력받은 username을 찾고, 해당 배열을 user에 저장한다.  
user가 null이라면, 에러를 표시하고, user.password로 해당 배열의 비밀번호 해시값과 입력받은  
password를 비교하여, true, false로 나온다 그래서 ok가 false라면 에러 페이지, true라면 정상 render

<br>

## Session and Cookies

로그인 한 정보를 기억하려면 어떻게 할 까? 유저에게 쿠키를 전송하는 방법이 있다.

브라우저에서 요청을 하면, 서버에서는 응답을 하고, 종료한다. 즉 서버에서는 누가 요청한지 기억하지 못한다.
브라우저도 더이상 서버가 필요하지 않아 잊어버린다. 해당 상황을 stateles(무상태)라고 한다

그래서 유저가 로그인 할 때마다 해당 정보를 주고 기억하도록 하는 것이 쿠키이다.  
쿠키를 갖고, 서버에 요청을 하면, 서버에서는 해당 쿠키를 읽고, 누군지 확인이 가능하다.

```bash
$ npm i express-session
```

세션을 설치한다.  
그 후, server에서 불러오고, Router 앞에 session을 사용한다.

```js
import session from "express-session";

app.use(
  session({
    secret: "Hello",
  })
);
```

```bash
express-session deprecated undefined resave option; provide resave option src/server.js:24:40
express-session deprecated undefined saveUninitialized option; provide saveUninitialized option src/server.js:24:40
```

section에 다음과 같이 추가해준다.

```js
  secret: "Hello",
  resave: true,
  saveUninitialized: true,
```

해당 미들웨어가, 사이트로 들어오는 모두를 기억하게 된다.

```js
app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});
```

백엔드가 기억하고 있는 모든 사람을 콘솔에 띄우는 명령이다.

<br>

쿠키를 유저에게 전송해준다.

주소에 접속해보고, 개발자 도구의 애플리케이션에서 쿠키를 확인해보면, 이름, 값이 적혀있는 걸 알 수 있다.  
해당 쿠키 Value가, 터미널의 콘솔에서도 마찬가지로 동일하게 나오는 것을 볼 수 있다.

시크릿 모드로 접속해보면, 새로운 쿠키 값을 받고, 서버에는 2개의 세션을 볼 수 있다.

```
[Object: null prototype] {
  pTGFu2EnVUOQ1eRr0dBkBKY6mZjUVfA6: {
    cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
  },
  HizGTiTsk1eAezqIyZFEXeUokEIj1frD: {
    cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
  }
}
```

: 콜론 앞 ID가 백엔드가 기억하는 유저이다.

1. 브라우저 서버에 접근한다.
2. session(): 서버에서 브라우저에게 텍스트가 담긴 쿠키를 준다.
3. 브라우저가 서버에 다시 접근하면 쿠키를 건네준다
4. sessionStore: 서버는 쿠키를 통해서 브라우저를 구분할 수 있다.

현재 문제는, 서버를 재시작하면 세션이 모두 사라진다. 메모리에만 저장 되어 있기 때문이다.  
그러면 쿠키를 보고 누구인지 알 수 없다.

**session-secret**으로 쿠키를 생성하고, **sessionStore.all**로 세션에 저장된 정보를 출력한다.

`req.session.id` 를 보면, 서버에서 브라우저에게 준 쿠키 값이 동일한 것을 알 수 있다.  
해당 세션에 별도의 정보를 넣을 수 있다.

정리해서, 우리 집(서버)에 오는 사람들에게 ID 카드(쿠키)를 주고, 다음에도 오려면 ID 카드를 들고 오라고 하는 것과 같다.

<br>

## Logged In User

postLogin에 session 값을 추가한다.

```js
req.session.loggedIn = true;
req.session.user = user;
return res.redirect("/");
```

post를 하면, console에서는 cookie: {@@@}, loggedIn: true, user: {@@@} 가 저장된다.

세션에 쿠키, 로그인유무, 유저 정보가 담겨있다.

pug에서 if !req.session.loggedIn 로 함수를 지정해도, pug는 세션을 찾을 수 없다.  
하지만 pug는 locals object를 기본적으로 가져다가 쓸 수 있다.  
결국에는 locals object는 모든 pug에 import 되어 있는 것이다.

```pug
//- base
title #{pageTitle} | #{siteName}
```

base에서 siteName 이라는 변수를 사용하는데,  
`res.locals.siteName = "Wetube";` 로 지정하면, base에 siteName에 Wetube가 적용된다.

```js
// middlewares
export const localsMiddleware = (req, res, next) => {
  console.log(req.session);
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  console.log(res.locals);
  next();
};
```

locals 값을 지정하는 미들웨어를 별도의 파일로 지정했다.

실행되면 `req.session` 세션에 있는 내용을 확인해보고, locals.loggedIn이라는 내용을 추가하는데, req.session에 있는 loggedIn 내용을 추가한다.

그런 다음 Login을 한 다음 터미널에 res.locals를 확인해보면, 다음과 같다
`[Object: null prototype] { loggedIn: true, siteName: 'Wetube' }`

<br>

### 복습

cookie는 정보를 주고받는 방법이고, 자동으로 작동한다. session Id는 cookie 안에 저장된다.  
cookie는 session ID를 전송한다.

session store는 session들을 저장하는 공간이다. 서버를 재시작되면 초기화된다.
추후에 DB와 연결하면 해결된다. 브라우저들이 n개만큼 접속해서 쿠키를 생성하면,  
session Store에는 n개의 session들이 저장되는 것이다!

쿠키가 저장된 브라우저들마다 sessionID값들을 살펴보면, 모두 다른 걸 알 수 있다.
미들웨어에 `console.log(req.sessionID)`를 한 뒤, 서로 다른 브라우저 혹은 시크릿모드에서 확인해보면 된다.

login을 하면, req.session의 loggedIn 값을 true로 지정하는데, 이게 가능한 이유가  
session은 object이기 때문에 가능하다

<br>

## MongoStore

sessionStore를 DB에 저장하기 위해서, 패키지를 설치한다. (npm -> yarn 변경)

```bash
$ yarm add connect-mongo
```

**server** 파일에서 import 하고, MongoStore의 함수를 살펴보면, 기본 store 말고, 별도의 store도 가능하다는 사실을 알 수 있다.

```js
app.use(
  session({
    secret: "Hello",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: connectUrl }),
  })
);
```

collections를 추가하여, `db.sessions.find()` 를 통해 \_id 값, expires, session 속 cookie 가 저장된 걸 볼 수 있다. 이제 서버를 재시작 해도, 데이터베이스에 정보가 저장되어 있기 때문에 잊어버리지 않는다

로그인을 해보면, 해당 값들이 db에 저장이 된다.

<br>

## Uninitialized Session

<small>모바일에서는 Token을 사용하지만 웹에서는 통상적으로 Cookie를 사용한다. 물론 token도 사용 가능하다</small>

현재는 웹페이지에 방문하는 모든 브라우저에게 쿠키를 주고, 해당 쿠키를 DB에 모조리 저장하고 있다. 결코 좋지 않은 상황이다.

우리는 로그인을 한 사람에게만 쿠키를 주어서, 재 로그인 할 필요 없도록 하는 로그인 유지 시스템을 만들도록 할 것이다.

```js
// server
app.use(
  session({
    secret: "Hello",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: connectUrl }),
  })
);
```

resave, saveUninitialized를 true &rarr; false 변경해준다. 저장한 다음, 브라우저에서 쿠키를 제거하고 새로고침을 해보면  
쿠키가 생기지 않는다.

resave는 모든 요청마다 세션의 변경사항이 있든 없든 세션을 다시 저장한다.  
true: 스토어에서 세션 만료일자를 업데이트 해주는 기능이 따로 없으면 true로 설정하며 매 요청마다 세선을 업데이트 해주게 한다.  
false: 변경사항이 없음에도 세션을 저장하면 비효율적이므로 동작 효율을 높이기 위해 사용한다.  
각각 다른 변경사항을 요구하는 두 가지 요청을 동시에 처리할때 세션을 저장하는 과정에서 충돌이 발생할 수 있는데, 이를 방지하기 위해 사용한다.

Uninitialized는, 요청에 의해 세션이 새로 만들어지고, 수정된 적 없을 때를 뜻한다.  
true: 클라이언트들이 서버에 방문한 총 횟수를 알고자 할 때 사용한다.  
false: unintialized 상태인 세션을 강제로 저장하면 내용도 없는 빈 세션이 스토리지에 계속 쌓일 수 있어 방지 및 저장공간을 아끼기 위해 사용한다.

**Controllers** 에서 req.session을 통해 세션을 initialized 상태로 만든다.  
정리하면, 세션을 수정할 때만 세션을 DB에 저장하고, 쿠키를 넘겨주는 일을 한다.

세션이 변경되려면, 로그인을 해야 하니까, 로그인 후 데이터베이스를 확인하면 loggedIn, user, user 속 쿠키가 생성되었다.

> 로그인 전 새로고침을 계속 해보면, 세선 ID가 계속해서 변경한다. 서버에 저장되지 않아서 계속해서 새로운 ID를 생성하는 것이다.
>
> 로그인을 하고 새로고침을 해보면, sessionID가 같은 값을 나타낸다.

<br>

## Expiration and Secrets

### 쿠키에는 어떠한 정보들이 있는지 알아보는 섹션

- secret

  - 쿠키에 sign 할 때 사용하는 string 이다. secret이 왜 있냐면, 백엔드가 쿠키를 줬다는걸 보여주기 위함이다.
  - 해당 이유는 **session hijack** 라는 공격 유형이 있기 때문에 존재한다.

- Domain

  - 쿠키를 만든 백엔드가 누구인지 알려준다.
  - hxan.net에서는 **hxan.net**이 Domain 값으로 들어있다.
  - github 페이지에서 로그인을 한 뒤, 쿠키를 살펴보면 Domain에 github.com이 있다.
  - 요청을 하면 쿠키가 Domain 주소로 전송된다.

- Path

  - 단순 URL이다

- Expires
  - **Session** 이라고 적혀있고, 만료 날짜가 적혀있지 않다.
  - session cookie는 만료되는데, 만료 날짜가 없다면 session cookie로 설정한다.
  - 사용자가 닫으면 session cookie는 종료된다. 즉 사라진다
  - 데이터베이스에서 expires를 확인할 수 있는데, 웹 브라우저와 달리, 만료되는 날짜가 정해져있다.

```js
app.use(
  session({
    secret: "abc",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10000,
    },
    store: MongoStore.create({ mongoUrl: connectUrl }),
  })
);
```

cookie의 만료 시간을 정해줄 수 있다.. maxAge로 1/1000 m/s 초로, 즉 10초 이후에는 쿠키가 사라진다.

<br>

우리는 API Key, secret, DB Url 과 같은 민감한 정보는, 공유하면 안되기 때문에, 환경변수라는 것을 사용할 것이다.

**.env** 파일을 생성하고, **.gitignore** 에서 .env를 추가해준다. 분리해놓고 env파일을 업로드하면 안되니까.

```env
COOKIE_SECRET=asdsad
DB_URL=url
```

다음과 같이 값을 넣어주고, 서버, db 파일에 대입해준다. 이름은 대문자로 하는 것이 규칙

환경 변수값을 사용하기 위해 패키지가 필요하다.

```bash
$ npm i dotenv
$ yarn add dotenv
```

dotenv는 최상단에 선언해야한다. 그래야 환경변수에 대한 값을 불러올 수 있기 때문이다.

사용법은 다음과 같다.

```js
require("dotenv").config();
```

문제가 있는데, 호출한 파일 말고, 다른 파일에서는 환경변수 값을 찾을 수 없다. 그래서 모든 파일에 해당 코드를 입력해야한다.  
하지만 다른 방법이 있는데 import를 하는 방법이 있는데, 이 방법을 사용한다.

```js
import dotenv from "dotenv";
dotenv.config();

//

import "dotenv/config";
```

1번 방식은 환경변수를 참조하는 파일이 적을 경우 사용하면 좋다. 왜냐하냐면 환경변수를 사용하는 파일마다 모두 선언해주어야 하기 떄문이다.  
2번 방식은 환경변수를 preload 하여 미리 불러오고, 다른 모든 파일에서도 사용이 가능하다.

<br>

## Github Login

oauth로 소셜네트워크 로그인을 구현한다.

깃허브로 로그인 하는 방법은, 요청하면 깃허브 정보 입력 페이지로 이동하고, 입력을 마치면 정보 공유하는 것에 대해 승인을 구하고,  
수락한다면 유저를 우리 웹사이트로 token와 함께 redirect 시킨다. 토큰은 매우 빠르게 만료된다.

---

깃허브에 접속하여, 설정에 개발자 설정 &rarr; oAuth application &rarr; 새로 만들기

- Application name \*

  - 이름 설정

- Hompage URL \*

  - 홈페이지 링크

- Application description - 설명

- Authorization callback URL \*
  - 어떠한 주소로 해도 상관 없지만, 사용해야하기에 기억하기

생성을 완료 한 후, login 페이지에 가서 깃허브로 이동해서, 로그인하는 과정을 진행한다.

주소는 `https://github.com/login/oauth/authorize` 가 기본이고, 그 뒤에, client_id 속성으로 뒤에는 아까 생성한 페이지에 보면  
client ID 라고 있다. 복사해서 붙여넣기 하면 성공

```pug
a(href="https://github.com/login/oauth/authorize?client_id=28943eecad729ee6f5ba") 깃허브 로그인
```

[깃허브 로그인 &rarr;](https://github.com/login/oauth/authorize?client_id=28943eecad729ee6f5ba)

다만, 전달하는 정보가 ID, 프로필 사진 등등 너무 적다. 그래서 추가적으로 작성해야 할 것이 있다.

scope로 추가적으로 사용자에게 얻고자 하는 정보들을 넣을 수 있고. allow_signup으로 깃허브 계정이 없다면 생성할 수 있는 옵션이다.

매게 변수의 종류는 많다

1. client_id - 등록시 받은 아이디
2. redirect_url - 공유하고 이동할 URL
3. login - 앱에 로그인하고 권한을 부여하는데 사용할 특정 계정 제안
4. scope - 권한 범위 목록
5. state - 임의 문자열, 교차 사이트 요청 위조 공격 보호
6. allow_signup - 깃헙 회원가입 사항

---

웹주소를 짧게 만들어 보면

```js
export const startGithubLogin = (req, res) => {
  const config = {
    clientID: "28943eecad729ee6f5ba",
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new
};
```

config 안에 있는 내용들을 new URLSearchParams(config).toString() 하면, 안에 있던 요소들이 String으로 풀리면서 나열된다.

```js
const baseUrl = "https://github.com/login/oauth/authorize";
const config = {
  client_id: "28943eecad729ee6f5ba",
  allow_signup: false,
  scope: "read:user user:email",
};
const params = new URLSearchParams(config).toString();
const reDirectUrl = `${baseUrl}?${params}`;
return res.redirect(reDirectUrl);
```

경로를 분리해서 하나로 합친다. 페이지에서 요청하는 권한을 허락하면 redirect된다.  
아까 설정한 callback URL로, `https://hxan.net/users/github/callback` 한번 수락하면, 다시 접속할 때 물어보지 않고  
토큰이 포함된 값을 전송한다.

쿼리값이 있는 상태로 받는데, 여기서 client secret을 사용한다.

환경변수에 **GH_CLIENT=클라이언트 아이디, GH_SECRETS=클라이언트 비밀 값**을 입력한다.

callback 되는 주소에 POST된 값이 들어와서 해당 값을 입력해주어야한다.

```js
export const finishGithubLogin = async (req, res) => {
  const baseUrl = `https://github.com/login/oauth/access_token`;
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const data = await fetch(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const json = await data.json();
  res.send(JSON.stringify(json));
};
```

callback &rarr; finish  
/github/finish 경로로 정보를 받기로 했고, finish 경로로 이동하면, finishGithubLogin 함수가 실행된다.

베이스 url에 config 내용을 붙여넣고, fetch를 사용하여 가져오는데, nodejs에서는 fetch의 사용이 어렵기 때문에 다음과 같은  
패키지를 설치해주어야 한다.

```bash
$ npm i node-fetch
$ yarn add node-fetch
```

단, NodeJS 18.0.0 버전부터는 fetch 기능이 탑재되어있다.

```json
{
  "access_token": "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",
  "token_type": "bearer",
  "scope": "read:user,user:email"
}
```

깃허브 로그인을 시도하면, 다음과 같이 POST 값을 받을 수 있다.

code &rarr; access token &rarr; github API를통해 user의 정보를 가져올 수 있다.

access_token은, scpoe에서 지정한 정보만 가져올 수 있다.
