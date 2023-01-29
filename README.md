## nodeJS 프로젝트 생성

Github에서 repository 생성 후 remote 추가, 그 후

터미널: `npm init` 입력

```javascript
package name: (wetube)
version: (1.0.0)
description: 설명.
entry point: (index.js) /* 프로젝트의 대표 파일 */
test command:
git repository: (github.com/Hansan529/wetube-reloaded.git)
keywords:
author: /* 이름 */
license: (ISC) MIT /* 라이선스 MIT: 누구나 나의 코드를 사용 할 수 있다. */
About to write to /Users/hansan/Documents/GitHub/wetube/package.json: /* 파일 생성 위치 */
```

내용이 맞다면 엔터를, 수정하고자 하면 변경 후 엔터를 입력한다.

```json
{
  "name": "wetube",
  "version": "1.0.0",
  "description": "The best way to wtach videos.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Hansan529/wetube-reloaded.git"
  },
  "author": "",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/Hansan529/wetube-reloaded/issues"
  },
  "homepage": "https://github.com/Hansan529/wetube-reloaded#readme"
}
```

이와 같은 내용의 `package.json` 파일이 생성된다.

<br><br>

---

<br>

## Installing Express

`index.js` 파일에 `console.log("Hello NodeJS");` 를 추가한다.  
`package.json` 파일에 `scripts "scripts": { "win": "node index.js" }` 를 추가한다.  
<br>

### 1번: node를 사용한 방법

```
$ node index.js


Hello NodeJS
```

<br>

### 2번: npm을 사용해 package에서 명령어를 실행하기

```
$ npm run win


> wetube@1.0.0 win
> node index.js

Hello NodeJS
```

프로젝트 폴더 안 콘솔에서 내가 만든 스크립트를 사용 할 수 있다.

<br>

## 설치하기

`npm i express` 입력 후 기다리면 `mode_modules/`, `package-lock.json`이 생성된다.

package.json / dependencies 에 있는 것들은 <strong style="color: pink">프로젝트를 구동시키는데 필요한 모듈들이다.</strong> 설치 할 때 자동으로 설치된다.

npm이 package.json 파일에 해당 내용을 자동으로 추가한다

```
"dependencies": {
   "express": "^4.18.2"
 }
```

node_modules 파일과 package-lock.json 파일을 삭제하여도 `npm i` 만 입력해도 재설치된다.

```javascript
$ npm i /* dependencies에 작성된 모듈을 자동으로 다운로드 한다. */


added 57 packages, and audited 58 packages in 631ms

7 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

해당 기능 덕분에 node_modules를 공유하지 않아도 `package.json`과 `index.js`만 공유하면

프로젝트를 공유 할 수 있다.

<br>

## #2.3 The Tower of Babel

최신 자바스크립트를 다른 곳에서도 충돌 없이 원활하게 작동하기 위해 설치해준다.

```
$ npm install --save-dev @babel/core
```

설치하게 되면 package.json 파일에 "devDependencies" 과 같은 태그에 작성되있는 것을 확인 할 수 있다.

devDependencies는 개발자에게 필요한 dependencies라고 알면 된다.

dependencies는 프로젝트에 필요한 모듈이고, devDependencies는 개발자에 필요한 모듈이다.

`--save-dev`는 devDependencies 텍스트 안에 넣게 해주는 옵션이다.

<br>

bable을 사용하기 위한 세팅

```js
babel.config.json /* 파일 이름 */


{
  "presets": ["@babel/preset-env"] /* 최신 자바스크립트를 사용 할 수 있음 */
}
```

```
$ npm install @babel/preset-env --save-dev /* preset-env를 모듈에 추가함 (플러그인) */
$ npm install @babel/node --save -dev /* node를 모듈에 추가함 */

$ npm i @babel/preset-env @babel/node --save-dev /* 한 번에 두가지 설치하기 */
```

devDependencies에 preset, node을 추가한다.

<br>

```json
"scripts": {
    "dev": "babel-node index.js"
  }
```

자동으로 최신 자바스크립트를 변환해주는 스크립트이다. 이름은 임의로 지정하고 `babel-node`를 이용하여 변환시킨 뒤 실행한다.

하지만 수정 할 때 마다 이를 반복해서 실행해주어야 하기 때문에, 수정되는걸 자동으로 감지하고 재시작 해 주는 편리한 유틸리티를 사용해보자.

<br>

## #2.4 Nodemon

```json
// 적용한 나의 package.json
"scripts": {
    "dev": "nodemon --exec babel-node index.js"
  }

// 필요한 dependencies
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@babel/core": "^7.20.12",  /* 핵심 바벨 패키지 */
    "@babel/node": "^7.20.7",   /* 변환 패키지 */
    "@babel/preset-env": "^7.20.2", /* 플러그인 */
    "nodemon": "^2.0.20"  /* 자동 재시작 패키지 */
  }
```

`npm run dev`를 해보자.

<br>

```
$ npm run dev

> wetube@1.0.0 dev /* 이름@version script */
> nodemon --exec babel-node index.js /* nodemon으로 babel-node의 index.js를 실행 */

[nodemon] 2.0.20 /* nodemon Ver */
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `babel-node index.js`
Hi!
[nodemon] clean exit - waiting for changes before restart
```

nodemon을 활성화 한 경우에는 콘솔이 종료되지 않고 계속 유지된다. 이 상태에서 js의 코드를 수정하고 저장하게 되면

변경 된 점을 자동으로 인식해서 재실행하여 결과를 보여준다.

<br>

```js
// index.js
import express from "express";

1. console.log("Hi");
2. console.log("안녕");
3. console.log("아주 좋아요");

// Terminal
[nodemon] starting `babel-node index.js`
Hi
[nodemon] clean exit - waiting for changes before restart
[nodemon] restarting due to changes...
[nodemon] starting `babel-node index.js`
안녕
[nodemon] clean exit - waiting for changes before restart
[nodemon] restarting due to changes...
[nodemon] starting `babel-node index.js`
아주 좋아요
[nodemon] clean exit - waiting for changes before restart
```

node로 실행하는 게 아닌, babel-node로 실행하고 있는 결과이다. 이 덕분에 최신 자바스크립트를 사용 할 수 있는 것이다.

`node index.JS` : index.js를 NodeJS로 실행한다.

`babel-node index.js` : 최신 자바스크립트가 호환되도록 babel-node로 index.js를 실행한다.

`nodemon --exec babel-node index.js` : 매번 `$ npm run dev` 를 입력하기엔 번거로우니 이를 반복하는 nodemon을 통해 index.js를 실행한다.

<br>

## #3.0 First Server

src 폴더를 생성한 후, 코드와 로직을 가지고 있는 파일을 넣어준다.

index.js 파일의 위치가 변경되었으니, package.json 파일의 scripts 속 dev의 경로를 변경해준다. `"dev": "nodemon --exec babel-node src/server.js"`

index.js의 이름을 server.js로 변경하였다.

---

js에 `import express from "express"` 코드를 작성해 "express"라는 package를 express라는 이름으로 import를 한다.

```js
import express from "express"; /* express 패키지를 불러온다. */

const app =
  express(); /* express function을 사용하면 express application을 생성해준다. */
```

<br>

서버를 생성한 후 서버가 요청(request)을 할 때 까지 기다리는 listening에 대한 코드를 작성한다.

```js
const handleListening = () =>
  console.log(
    "Server listening on port 4000 🚀"
  ); /* 해당 코드를 listen에 한 줄에 넣어도 정상 작동한다. */

app.listen(
  4000,
  handleListening
); /* 4000번의 포트, handleListening 함수를 실행한다. */
```

로컬 서버 바로가기 <http://localhost:4000/>

서버는 nodemon을 종료하면 종료된다.

<br>

## #3.1 ~ 3.2 GET Requests

서버에 접속하면 `Cannot GET /`라는 텍스트가 보인다. 이는 브라우저가 서버에게 GET (http mathod) requests를 보내고 있는 것이다.

이 요청을 반응하기 위해서

```js
const app = express();
// 서버 생성 이후

("해당 위치에 작성한다");
app.get("/", () => console.log("somebody is trying to go home."));
// button.addEvenListener("click", handleClick) 와 같은 맥락이다.

// 외부 접속을 listen 하기 전
const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
```

먼저 app.get으로 "/"를 request 받으면 console.log를 반응하게 만들었다.

서버에 접속한 후, 새로고침을 해보면 페이지가 계속 로딩되면서 페이지를 불러 올 수 없을 것이다.

다른 주소를 입력할 경우 <http://localhost:4000/abcdefg> 대기 시간 없이 바로바로 페이지가 로딩되는 것을 알 수 있다.

/ 페이지(home)에 접속하면 서버에서는 console.log의 내용을 출력한 것을 확인 할 수 있다.

`somebody is tring to go home.` 홈페이지를 보면 계속해서 로딩한다. 하지만 처리는 진행했고 응답을 안하고 있는 것이다.

<br>

## #3.3 Responses

```js
const handleHome = (req, res)
=> console.log("somebody is trying to go home.");

app.get("/", handleHome);
```

EventListener에겐 event가 있고, express에선 2개의 object가 있다. `request object`, `responses object`

req, res 이름 대신 다른 이름을 사용해도 되지만 <strong>필수로 2가지를 모두 작성해주어야 한다.</strong> req 하나만 작성한다거나, res 하나만 작성하면 문제가 발생한다.

&lt;&quot;req&quot;&gt; &nbsp;&nbsp; &lt;&quot;res&quot;&gt; 형식이다.

req를 console.log를 해본다면 https://localhost:4000/ 페이지를 request 해본다면 매우 많은 값들을 콘솔에서 확인 할 수 있다

```js
// express 생략

const handleHome = (req, res) => console.log(req);

app.get("/", handleHome);
```

해당 결과값들이 request object이다.

브라우저가 요청하는 것이고, 쿠키나 GET, method 등등 여러 정보들을 얻을 수 있다.

```js
// 생략

const handleHome = (req, res) => console.log(res);
```

많은 정보들을 얻을 수 있다.

<br>

브라우저가 request를 보내면 우리는 응답을 해주어야 하기에 return을 사용한다.

```js
const handleHome = (req, res) => {
  return res.end();
};
```

다시 서버를 실행하고, localhost에 request를 요청하면, 브라우저가 로딩되던 이전과는 다르게 return하여 페이지를 불러오게된다. 해당 함수가 responses를 종료하여 서버가 request를 끝내버린 것이다,

다른 방법으로도 request를 종료시킬 수 있다.

`return res.send()` 이렇게 2가지가 있다.

<br>

## #3.5 Middlewares

Middleware는 request와 response 사이에 있다. 모든 함수(handle)는 controller가 될 수도 mideeleware가 될수있다.

```js
import express from "express";

const PORT = 4000;

const app = express();

const controllerHome = (req, res) => {
  return res.end("<h1>HTML h1</h1>");
};
const controllerLogin = (req, res) => {
  return res.send({ message: "Login here" });
};

app.get("/", controllerHome);
app.get("/login", controllerLogin);

const controllerListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, controllerListening);
```

req와 res 말고도 한 가지 요소가 더 있다. (req, res, `next`) next라는 것이 있다. 다음을 불러오는 함수인데 <br><br>

```js
const controllerHome = (req, res, next) => {
  next();
};
```

이와 같이 변경하고 메인 루트로 이동해보면 "Cannot GET /" 라는 텍스트만 로딩된다.  
왜냐하나면 다음 함수가 없기 때문에 불러 올 수 없는 것이다. <br><br>

```js
const gossipMiddleware = (req, res, next) => {
  console.log("I'm in the middle");
  next();
};
const controllerHome = (req, res, next) => {
  return res.end();
};
app.get("/", gossipMiddleware, controllerHome);
```

서버 터미널에 "I'm in the middle" 이라는 텍스트와 next 함수로 controllerHome 함수를 실행해 return을 한 결과를 얻을 수 있다.

gossipMiddleware 함수가 middleware가 되고, controllerHome 함수가 return을 하기 때문에 finalware가 된다.

<br>

```js
const gossipMiddleware = (req, res, next) => {
  console.log(`Someone is going to: ${req.url}`);
  next();
};
```

console: `Someone is going to: /`

request의 정보를 가지고 전달해주는 것이라 middleware에서 req.url 값을 호출해보면 값을 유지하고 있는 것을 알 수 있다.

<br>

`gossipMiddleware`는 현재 "/" URL에서만 반응하는데, 어느 URL에도 작동하도록 만들어 주는 게 `.use` method이다.

```js
// use 순서는 get 보다 먼저 불러와야 한다.
app.use(gossipMiddleware);

// controllerHome => handleHome
app.get("/", handleHome);
```

다른 경로로 req를 보내보면 cannot GET /@@@@ 가 표시되지만 터미널에는 해당 경로값을 볼 수 있다.

하지만 이 순서를 반대로 지정하면 콘솔에는 아무런 정보도 없다.

```js
app.get("/", handleHome);
app.use(gossipMiddleware);
```

request가 요청되어 handleHome을 실행하고, 그 후에 gossipMiddleware를 실행하도록 express는 지정을 했는데,

handleHome에서 request를 종료시켰기에 gossipMiddleware가 실행되지 않는 것이다. + `req.method`를 호출하면 어떤 method로 호출 하는지 알 수 있다. 기본으로는 'GET'이다.

<br>

```js
// gossipMiddleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};
// 새로운 middleware
const privateMiddleware = (req, res, next) => {
  const url = req.url;
  if (url === "/protected") {
    return res.send("<h1>Not Allowed</h1>");
  }
  next();
};

app.use(logger, privateMiddleware);
app.get("/", handleHome);
```

어떠한 경로를 요청하던지 logger와 privateMiddleware 함수는 실행되도록 하고, 만약 요청한 경로가 protected일 경우 Not Allowed를 html에 출력하고, 아닐 경우에는 next로 넘긴다.

<br>

## 정보, Recap

.get은 function이 필요하다. `1+1`, `console.log("hi")`와 같은 것은 바로 실행하기 때문에 에러가 발생하고, 이 에러를 해결하기 위해서는

별도의 function을 생성해서 불러오거나, `app.get("", () => console.log("hi"))`와 같이 inline function을 지정해주어야 에러가 사라진다.

```js
// 유지보수 차원으로 별도의 function을 생성해서 지정하는게 좋다.

// function
const handleHome = (req, res) => {
  res.sedn("hello");
};
app.get("/", handleHome);

// inline
app.get("/", (req, res) => res.send("hello"));
```

<br>

`handler`의 경우 이름은 req, res로 지정 할 필요 없다. 단지 코드를 봤을 때 인지하기 쉽도록 한 것이다.

```js
// 기존 코드
const handleHome = (req, res) => {
  return res.send("<h1>hello</h1>");
};

// argument의 위치 순서만 지켜주면 어떠한 이름도 상관 없다.
// request-object, response-object 순서이다.
const handleHome = (x, y) => {
  return y.send("<h1>hello</h1>");
};
```

<br>

### morgan

GET, path, status code , 응답시간 모든 정보를 가지고있는 middleware이다.

`npm i morgan` 으로 설치 가능하고, `import <morgan> from "morgan";` &lt;morgan&gt;은 별명이기에 마음대로 지정해도 된다.

```js
import morgan from "morgan";

// 생략

const logger = morgan("dev");

app.use(logger);
```

```js
// Method, Url, statusCode, 응답시간
GET / 304 2.339 ms - -
```
