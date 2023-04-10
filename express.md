# Express

## 3.1 ~ 3.2 GET Requests

서버에 접속하면 Cannot GET /라는 텍스트가 보인다. 이는 브라우저가

서버에게 GET (http mathod) requests를 보내고 있는 것이다.

이 요청을 반응하기 위해서

```js
const app = express();
// 서버 생성 이후

app.get("/", () =&gt; console.log("somebody is trying to go home."));

// 외부 접속을 listen 하기 전
const handleListening = () =&gt;
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
const handleHome = (req, res) =&gt; console.log("somebody is trying to go home.");

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
const handleHome = (req, res) =&gt; console.log(req);

app.get("/", handleHome);
```

해당 결과값들이 request object이다.

브라우저가 요청하는 것이고, 쿠키나 GET, method 등등 여러 정보들을 얻을
수 있다.

    const handleHome = (req, res) =&gt; console.log(res);

브라우저가 request를 보내면 우리는 응답을 해주어야 하기에 return을
사용한다.

또한, 무한 로딩에서 벗어나기 위해 request를 종료시켜야 하므로
res.end() 메소드를 사용해서 요청을 종료시킨다.

```js
const handleHome = (req, res) =&gt; {
return res.end();
};
```

localhost에 request를 요청(`http://localhost:4000/`)하면, 브라우저가
로딩되던 이전과는 다르게 return 하여 페이지를 불러오게된다.

불러 올 수 있는 이유가, 해당 res.end()가 responses를 종료하여 서버가
request를 끝내버린 것이다.

## 3.5 Middlewares

Middleware는 request와 response 사이에 있다. 모든 함수(handle)는
controller가 될 수도 mideeleware가 될수있다.

```js
import express from "express";

const PORT = 4000;

const app = express();

const controllerHome = (req, res) =&gt; {
return res.end("&lt;h1&gt;HTML h1&lt;/h1&gt;");
};
const controllerLogin = (req, res) =&gt; {
return res.send({ message: "Login here" }
);
};

app.get("/", controllerHome);
app.get("/login", controllerLogin);

const controllerListening = () =&gt; console.log(Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, controllerListening);
```

req와 res 말고도 한 가지 요소가 더 있다. (req, res, next) next라는
것이 있다. 다음을 불러오는 함수인데

```js
const controllerHome = (req, res, next) =&gt; {
next();
};
```

이와 같이 변경하고 메인 루트로 이동해보면 "Cannot GET /" 라는 텍스트만
로딩된다.

왜냐하나면 다음 함수가 없기 때문에 불러 올 수 없는 것이다.

```js
const gossipMiddleware = (req, res, next) =&gt; {
console.log("I'm in the middle");
next();
};
const controllerHome = (req, res, next) =&gt; {
return res.end();
};

app.get("/", gossipMiddleware, controllerHome);
```

서버 터미널에 "I'm in the middle" 이라는 텍스트와 next 함수로
controllerHome 함수를 실행해 return을 한 결과를 얻을 수 있다.

gossipMiddleware 함수가 middleware가 되고, controllerHome 함수가
return을 하기 때문에 finalware가 된다.

```js
const gossipMiddleware = (req, res, next) =&gt; {
console.log(`Someone is going to:${req.url}`);
next();
};
```

console: Someone is going to: /

request의 정보를 가지고 전달해주는 것이라 middleware에서 req.url 값을
호출해보면 값을 유지하고 있는 것을 알 수 있다.

gossipMiddleware는 현재 "/" URL에서만 반응하는데, 어느 URL에도
작동하도록 만들어 주는 게 .use method이다.

```js
// use 순서는 get 보다 먼저 불러와야 한다.
app.use(gossipMiddleware);

// controllerHome =&gt; handleHome
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
const logger = (req, res, next) =&gt; {
console.log(`${req.method} ${req.url}`);
next();
};

// 새로운 middleware
const privateMiddleware = (req, res, next) =&gt; {
const url = req.url;
if (url === "/protected") {
return res.send("&lt;h1&gt;Not Allowed&lt;/h1&gt;");
}
next();
};

app.use(logger, privateMiddleware);
app.get("/", handleHome);
```

어떠한 경로를 요청하던지 logger와 privateMiddleware 함수는 실행되도록
하고, 만약 요청한 경로가 protected일 경우 Not Allowed를 html에
출력하고, 아닐 경우에는 next로 넘긴다.

## 정보, Recap<

.get은 function이 필요하다. 1+1, console.log("hi")와 같은 것은 바로
실행하기 때문에 에러가 발생하고, 이 에러를 해결하기 위해서는

별도의 function을 생성해서 불러오거나, app.get("", () =&gt;
console.log("hi"))와 같이 inline function을 지정해주어야 에러가
사라진다.

```js
  // 유지보수 차원으로 별도의 function을 생성해서 지정하는게 좋다.

// function
const handleHome = (req, res) =&gt; {
res.send("hello");
};

app.get("/", handleHome);

// inline
app.get("/", (req, res) =&gt; res.send("hello"));
```

handler의 경우 이름은 req, res로 지정 할 필요 없다. 단지 코드를 봤을
때 인지하기 쉽도록 한 것이다.

```js
// 기존 코드
const handleHome = (req, res) =&gt; {
return res.send("&lt;h1&gt;hello&lt;/h1&gt;");
};

//argument의 위치 순서만 지켜주면 어떠한 이름도 상관 없다.
//request-object, response-object 순서이다.

const handleHome = (x, y) =&gt; {
return y.send("&lt;h1&gt;hello&lt;/h1&gt;");
};
```

## morgan

GET, path, status code , 응답시간 모든 정보를 가지고있는
middleware이다.

npm i morgan 으로 설치 가능하고, import &lt;morgan&gt; from "morgan";
` &lt;morgan&gt;은 별명이기에 마음대로 지정해도 된다. &lt;morgan&gt;은
별명이기에 마음대로 지정해도 된다.

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
