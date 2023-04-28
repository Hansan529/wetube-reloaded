# Setup

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
```

    Hello NodeJS

<br>

### 2번: npm을 사용해 package에서 명령어를 실행하기

```
$ npm run win
```

    > wetube@1.0.0 win
    > node index.js

    Hello NodeJS

프로젝트 폴더 안 콘솔에서 내가 만든 스크립트를 사용 할 수 있다.

이름은 사용자가 마음대로 지정하여 사용하면 된다.

<br>

## 설치하기

`npm i express` 입력 후 기다리면 `mode_modules/`, `package-lock.json`이 생성된다.

package.json / dependencies 에 있는 것들은 <strong style="color: pink">프로젝트를 구동시키는데 필요한 모듈들이다.</strong> 설치 할 때 자동으로 설치된다.

npm이 package.json 파일에 해당 내용을 자동으로 추가한다

```js
"dependencies": {
   "express": "^4.18.2"
 }
```

dependencies라는 것은, 해당 npm이 정상적으로 작동되게 하려면 필요한 패키지들을 말한다.

```js
// express의 package.json
"accepts": "~1.3.8",
"array-flatten": "1.1.1",
"body-parser": "1.20.1",
"content-disposition": "0.5.4",
"content-type": "~1.0.4",
"cookie": "0.5.0",
...
```

그래서 express를 설치하면서 dependencies에 있는 패키지들도 함께 설치가 되는 것이다.

<br>

`package.json`에 있는 dependencies 내용 덕분에, node_modules 파일과 package-lock.json 파일이 없더라도

`npm i` 만 입력해도 필요한 모듈을 설치한다.

```javascript
$ npm i /* dependencies에 작성된 모듈을 자동으로 다운로드 한다. */


added 57 packages, and audited 58 packages in 631ms

7 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

해당 기능 덕분에 node_modules를 공유하지 않아도 `package.json`과 `index.js`(실행될 스크립트)만 공유하면

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

```
$ touch babel.config.json
```

```json
// babel.config.json
{
  "presets": ["@babel/preset-env"] /* 최신 자바스크립트를 사용 할 수 있음 */
}
```

<br>

preset-env를 모듈에 추가함 (플러그인), node를 모듈에 추가

```
$ npm install @babel/preset-env --save-dev
$ npm install @babel/node --save -dev
```

한 번에 두가지 설치하기

```
$ npm i @babel/preset-env @babel/node --save-dev
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

자바스크립트에서 일일이 변환을 하는 작업을 하고 싶지 않기에, 이를 package.json에서 처리할 수 있는 패키지를 추가로 설치한다.

수정을 한 다음에 다시 npm run dev 를 매 번 입력하기는 불 필요한 반복이기에 이를 대신해주는 작업을 한다.

```
$ npm i nodemon --save-dev
```

```json
// 적용한 나의 package.json
"scripts": {
    "dev": "nodemon --exec babel-node index.js"
  }
```

점차 수식어가 추가로 생기는 것을 볼 수 있다.

node -> babel-node -> nodemon --exec

```json
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

## [Express 기초](https://github.com/Hansan529/wetube-reloaded/blob/main/README/express.md)

## [Router](http://github.com/Hansan529/wetube-reloaded/blob/main/README/router.md)

## [Templates](http://github.com/Hansan529/wetube-reloaded/blob/main/README/templates.md)

## [mongoDB](http://github.com/Hansan529/wetube-reloaded/blob/main/README/mongodb.md)

## [User Authentication](http://github.com/Hansan529/wetube-reloaded/blob/main/README/user-authentication.md)

## [User Profile](http://github.com/Hansan529/wetube-reloaded/blob/main/user-profile.md)
