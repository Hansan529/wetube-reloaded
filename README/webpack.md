# Webpack

백엔드 JS에서는 babel-node에서 다 처리해주기 때문에 괜찮지만 front-end js는 이 작업을 다시 해주어야한다.

SCSS를 사용하면, VSC에서 Live Sass Compler를 사용하는 것과 같이, WEBPACK을 직접적으로 사용하는 것 보다

Webpack이 포함된 툴을 사용하는 것이 대부분이다. 웬만한 프레임워크에는 다 포함되어 있다.

```bash
$ npm i webpack webpack-cli -D
$ yarn add --dev webpack webpack-cli
```

**webpack.config.js** 파일을 생성한다. 마치 babel.config.json 처럼 속성을 입력해줄 것이다.

```js
module.exports = {
  entry: "./src/client/js/main.js",
  output: {
    filename: "main.js",
    path: "./assets/js",
  },
};
```

entry는 소스파일, 우리가 처리하고 싶은 파일을 뜻한다. output은 변환된 요소가 출력되는 것이다.

package.json에서 webpack을 실행하는 스크립트를 만들자.

```json
"scripts": {
    "dev": "nodemon --exec babel-node src/init.js",
    "assets": "webpack --config webpack.config.js"
  },
```

assets라는 스크립트를 생성했고, 이를 실행해보면 오류가 발생한다! ..? 그 이유는 path에 있다.  
configuration은 절대 경로로 지정되어야 한다고 한다.

그래서 우리는 js에서 제공하는 \_\_dirname을 사용한다.

```bash
/root/lab/wetube-reloaded
```

작업하는 파일까지의 경로 전체를 뜻하는 것이다. 추가적인 경로 설정을 위해서

path.resolve를 사용한다.

```js
const path = require("path");

...
path: path.resolve(__dirname, "assets", "js");
```

다시 한번 assets를 실행해보면 해당 폴더를 생성한다.

```js
const hello = async () => {
  alert("hi");
  const x = await fetch("");
};

hello();
```

해당 코드가

```js
(async () => {
  alert("hi"), await fetch("");
})();
```

다음과 같이 압축되어 변경되었다.

**콘솔에는 mode 설정이 안되었다고 오류가 발생한다.**

<br>

webpack에는 rules가 있는데, 우리가 각각의 파일 종류에 따라 어떤 전환을 할 건지 결정하는 것이다.

webpack 용어로 loader이라고 하는 것이 파일을 변환한다.

우리는 js를 babel을 사용할 것이니 babel-loader를 설치하자

```bash
$ npm i babel-loader -D
$ yarn add --dev babel-loader
```

그리고 webpack.config.js를 업데이트한다.

```js
const path = require("path");

module.exports = {
  entry: "./src/client/js/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
};
```

bable-loader를 사용하기 위해 약간의 옵션을 추가한다.

test에 변환하고자 하는 확장자를 작성해준다.

그리고 assets를 실행하면 변환이 된다.

현재는 async, await이 브라우저에서 지원해서 별 다른게 없을 것이다.
