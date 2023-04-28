# Express

## 3.1 ~ 3.2 GET Requests

서버에 접속하면 Cannot GET /라는 텍스트가 보인다. 이는 브라우저가

서버에게 GET (http mathod) requests를 보내고 있는 것이다.

이 요청을 반응하기 위해서

```js
const app = express();
// 서버 생성 이후

app.get("/", () => console.log("somebody is trying to go home."));

// 외부 접속을 listen 하기 전
const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
```

먼저 app.get으로 "/"를 request 받으면 console.log를 반응하게 만들었다.

서버에 접속한 후, 새로고침을 해보면 페이지가 계속 로딩되면서 페이지를
불러 올 수 없을 것이다.

다른 주소를 입력할 경우 `http://localhost:4000/abcdefg` 대기 시간 없이 바로바로 페이지가 로딩되는 것을 알 수 있다.

/ 페이지(home)에 접속하면 서버에서는 console.log의 내용을 출력한 것을
확인 할 수 있다.

somebody is tring to go home. 홈페이지를 보면 계속해서 로딩한다.
하지만 처리는 진행했고 응답을 안하고 있는 것이다.

## 3.3 Responsess

```js
const handleHome = (req, res) => console.log("somebody is trying to go home.");

app.get("/", handleHome);
```

EventListener에겐 event가 있고, express에선 2개의 object가 있다.
request object, responses object

req, res 이름 대신 다른 이름을 사용해도 되지만
**필수로 2가지를 모두 작성해주어야 한다.** req 하나만
작성한다거나, res 하나만 작성하면 문제가 발생한다.

&lt;req&gt;&lt;res&gt; 형식이다.

req를 console.log를 해본다면 매우 많은 값들을 터미널에서 확인 할 수
있다.

```js
const handleHome = (req, res) => console.log(req);

app.get("/", handleHome);
```

해당 결과값들이 request object이다.

브라우저가 요청하는 것이고, 쿠키나 GET, method 등등 여러 정보들을 얻을
수 있다.

    const handleHome = (req, res) => console.log(res);

브라우저가 request를 보내면 우리는 응답을 해주어야 하기에 return을
사용한다.

또한, 무한 로딩에서 벗어나기 위해 request를 종료시켜야 하므로
res.end() 메소드를 사용해서 요청을 종료시킨다.

```js
const handleHome = (req, res) => {
  return res.end();
};
```

localhost에 request를 요청(`http://localhost:4000/`)하면, 브라우저가
로딩되던 이전과는 다르게 return 하여 페이지를 불러오게된다.

불러 올 수 있는 이유가, 해당 `res.end()`가 responses를 종료하여 서버가
request를 끝내버린 것이다. `res.end()` 말고도 `res.send()`를 사용해서 요청을 종료시킬 수 있다.

```js
const handleHome = (req, res) => {
  console.log("메인 루트에 request가 들어왔습니다.");
  return res.send("<h1>res send</h1>");
};
```

텍스트 만이 아닌 HTML 태그를 직접 입력해도 적용이 된다. 마치 innerHTML 처럼 말이다.

{ message: "Home here" } json 과 같은 방법도 가능하다.

<br>

## 3.5 Middlewares

Middleware는 request와 response 사이에 있다. 모든 함수(handle)는
controller가 될 수도 mideeleware가 될수있다.

그래서 handle 대신 control이 맞다.

```js
const controllerHome = (req, res) => {
  return res.end("&lt;h1>HTML h1</h1>");
};

const controllerLogin = (req, res) => {
  return res.send({ message: "Login here" }
  );
};

app.get("/", controllerHome);
app.get("/login", controllerLogin);

const controllerListening = () => console.log(Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, controllerListening);
```

<br>

req와 res 말고도 한 가지 요소가 더 있다. **next**라는 것이 있다. 다음을 불러오는 argument 이다.

```js
const controllerHome = (req, res, next) => {
  next();
};
```

이와 같이 변경하고 메인 루트로 이동해보면 "Cannot GET /" 라는 텍스트만
로딩된다.

왜냐하나면 **다음 함수**가 없기 때문에 불러 올 수 없는 것이다.

```js
const gossipMiddleware = (req, res, next) => {
  console.log("I'm in the middle");
  next();
};
const controllerHome = (req, res) => {
  return res.send("controller Home이 실행됐어");
};

app.get("/", gossipMiddleware, controllerHome);
```

메인 루트에 접속해보면, 화면에는 "controller Home이 실행됐어" 라는 문구를 볼 수 있을 것이다.

서버 터미널에서는 "I'm in the middle" 이라는 텍스트와 next 함수로
controllerHome 함수를 실행해 return을 한 결과를 얻을 수 있다.

> -> gossipMiddleware 실행  
> -> next 메소드를 통해 다음 함수를 실행  
> -> get의 gossipMiddleware의 다음에 있는 함수인 controllerHome가 실행된다.

그래서 모든 함수가 middleware이 될 수 있다는 것이다.

gossipMiddleware 함수가 middleware가 되고,  
controllerHome 함수가 **return**을 하기 때문에 finalware가 된다.

```js
const gossipMiddleware = (req, res, next) => {
  console.log(`Someone is going to:${req.url}`);
  next();
};
```

    console: Someone is going to: /

request의 정보를 가지고 전달해주는 것이기에 middleware에서 req.url 값을
호출해보면 값을 유지하고 있는 것을 알 수 있다.

gossipMiddleware는 **현재 "/" URL에서만 반응**하는데, 어느 URL에도
작동하도록 만들어 주는 게 **use** method이다.

global로 만들어 주는 작업이라고 생각하면 된다.

```js
// use 순서는 get 보다 먼저 불러와야 한다.
app.use(gossipMiddleware);

// controllerHome => handleHome
app.get("/", handleHome);
```

다른 경로로 req를 보내보면 cannot GET /@@@@ 가 표시되지만 터미널에는
해당 경로값을 볼 수 있다.

하지만 이 순서를 반대로 지정하면 콘솔에는 아무런 정보도 없다.

```js
app.get("/", handleHome);
app.use(gossipMiddleware);
```

request가 요청되어 handleHome을 실행하고, 그 후에 gossipMiddleware를
실행하도록 express는 지정을 했는데,

handleHome에서 request를 종료시켰기에 gossipMiddleware가 실행되지 않는
것이다. + req.method를 호출하면 어떤 method로 호출 하는지 알 수 있다.
기본으로는 GET이다.

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

const handlePritected = (req, res) => {
  return res.send("접근이 제한된 페이지입니다");
};

app.use(logger, privateMiddleware);
app.get("/", handleHome);
app.get("/protected", handlePritected);
```

어떠한 경로를 요청하던지 logger와 privateMiddleware 함수는 실행되도록
하고, 만약 요청한 경로가 protected일 경우 Not Allowed를 html에
출력하고, 아닐 경우에는 next로 넘긴다.

그렇기에, handlePritected를 실행시키지 못하고, privateMiddleware에서 request가 종료되어 더이상 진행하지 않게 된다.

<br>

## Recap 복습

```js
import express from "express";
```

여기서 "express"는 `node_modules/express` 이지만, node_modules를 생략을 하여도
지장이 없다.

<br>

```js
const PORT = 4000;

const listenServer = () => {
  console.log(`http://localhost:${PORT}`);
};

app.listen(PORT, listenServer);
```

포트를 지정하는 이유는, 서버는 컴퓨터 전체를 listen 할 수 없기 때문이다.  
특정 포트를 listen을 통해서, 해당 포트를 호스팅하는 것이다.

현 상태에서 접속을 해 보면, 홈페이지 로딩이 계속해서 하는 것을 볼 수 있을 것이다.

> 내가 문 밖에서 열어달라고(req) 했는데, 문 안에서 열어주지(res) 않는 것이다.

브라우저에서 페이지에 대한 요청을 하면, 서버는 페이지를 브라우저에게 준다.

즉 브라우저가 이동하는 것이 아닌, 스크린에 페이지를 가져 오는 것이다.

<br>

요청에 따른 반응(res)을 해주기 위해서 `get()`를 사용한다.  
get에는 실행 될 함수가 필요하다. `1+1, console.log("hi")`와 같은 것은 바로
실행하기 때문에 에러가 발생하고, 이 에러를 해결하기 위해서는

별도의 function을 생성해서 불러오거나,  
`app.get("", () =&gt; console.log("hi"))` 와 같이 inline function을 지정해주어야 에러가 사라진다.

> 재사용을 해야 한다면 **함수**를 생성하고,  
> 일회성인 경우 **인라인**으로 실행시킨다.

```js
/* function */
const handleHome = (req, res) => {
  res.send("hello");
};

app.get("/", handleHome);
```

```js
/* inline */
app.get("/", (req, res) => res.send("hello"));
```

handler의 경우 이름은 req, res로 지정 할 필요 없다. 단지 코드를 봤을
때 인지하기 쉽도록 한 것이다.

반응을 하기 위해 필요한 get을 사용했으니, 브라우저에게 요청을 중지시키도록 하는 메소드인  
`res.send()`, `res.end()`가 있다.

send는 메시지를 출력하는 것이고, end는 말 그대로 종료시켜버린다.

```js
// 기존 코드
const handleHome = (req, res) => {
  return res.send("<h1></h1>hello</h1>");
};

//argument의 위치 순서만 지켜주면 어떠한 이름도 상관 없다.
//request-object, response-object , next 순서이다.

const handleHome = (x, y) => {
  return y.send("<h1></h1>hello</h1>");
};
```

만약에 모든 접속에 middleware를 사용해야 한 다면, get 대신 use를 사용한다.

```js
// Before
app.get("/", middleware, home);
app.get("/login", middleware, login);
```

```js
// After
app.use(middleware);
app.get("/", login);
app.get("/login", login);
```

**주의 할 점은 use의 선언 위치가 get 보다 뒤에 있다면, get에서 request를 종료시키기 때문에, use가 실행되지 않는다!**

<br>

## morgan

GET, path, status code , 응답시간 모든 정보를 가지고있는
node.js용 middleware이다.

`npm i morgan` 으로 설치 가능하고, import 한 뒤에 사용하면 된다.

morgan에는 combined, common, dev, short, tiny 가 있다.

```js
import morgan from "morgan";

const logger = morgan("dev");

app.use(logger);
```

- dev

```js
// Method, Path, StatusCode, 응답시간
GET / 304 2.339 ms - -
```

- common

```js
// 시간, method, path, http 버전, statusCode
::1 - - [11/Apr/2023:03:21:50 +0000] "GET / HTTP/1.1" 304 -
```

- combined

```js
// 시간, method, path, http 버전, statuscode, os, 브라우저, 브라우저버전

/* chrome */
::1 - - [11/Apr/2023:03:18:13 +0000] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"

/* safari */
::1 - - [11/Apr/2023:03:18:33 +0000] "GET / HTTP/1.1" 200 17 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15"
```

- short

```js
// method, path, http-v, statuscode, 응답시간
::1 - GET / HTTP/1.1 304 - - 1.359 ms
```

- tiny

```js
// method, path, statuscode, 응답시간
GET / 304 - - 2.396 ms
```
