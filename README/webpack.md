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

mode 오류를 해결해보자. 이유는 따로 설정을 하지 않으면 production 모드가 되어, 압축이 되는데, 개발 중에는 압축이 되지 않아야  
어느 부분인지 확인이 쉽기 때문이다.

```js
const path = require("path");

module.exports = {
  entry: "./src/client/js/main.js",
  mode: "development",
  output: {
  ...
  }
};
```

mode를 development로 변경해주고 assets의 main.js를 확인해보면

```js
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ "./src/client/js/main.js":
      /*!*******************************!*\
  !*** ./src/client/js/main.js ***!
  \*******************************/
      /***/ () => {
        eval(
          'const hello = async () => {\n  alert("hi");\n  const x = await fetch("");\n};\nhello();\n\n//# sourceURL=webpack://wetube/./src/client/js/main.js?'
        );

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval devtool is used.
  /******/ var __webpack_exports__ = {};
  /******/ __webpack_modules__["./src/client/js/main.js"]();
  /******/
  /******/
})();
```

변환이 완료 되었고,서버를 실행해보면 **alert**가 실행되는 모습을 볼 수 있다. 브라우저에서 JS가 실행되는 것이다.

css를 적용해보자.

```js
// main.js
import "../scss/styles.scss";

console.log("hi");
```

```scss
// styles
@import "./variable";

body {
  background-color: $black;
  color: $white;
}
```

```scss
// variable
$black: #000;
$white: #fff;
```

변환을 한다.

```bash
$ npm run assets
$ yarn assets
```

새로고침을 하면 html에서 css가 적용된 모습을 볼 수 있다.

```html
<style>
  body {
    background-color: #000;
    color: #fff;
  }
</style>
```

현재로서 지금과 같이 진행하면, 별도의 분리된 css 파일이 아니라, javascript에서 style 태그를 생성하고, 그 안에 style 요소를 넣는거니까,  
그만큼 로딩 시간이 오래 걸리고, 보기에 좋지 않으니 style-loader를 사용하지 않을 것이다.

style-loader는 html에 스타일을 붙여넣는 역할인데, 이 대신 miniCssExtractPlugin을 사용한다.

```bash
$ yarn add -D mini-css-extract-plugin
```

```js
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/client/js/main.js",
  plugins: [new MiniCssExtractPlugin()],
  mode: "development",
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
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
```

style-loader 자리에 MiniCssExtractPlugin이 사용되었다.  
현재로서 문제는 output에 css파일도 /js/ 폴더에 저장되는 것이 문제다.

그래서 output에 대해 수정이 필요하다.

```js
new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),

output: {
    filename: "js/main.js",
  },
```

minicssextractplugin에서 저장될 파일 이름을 폴더 안에 저장하는 형식으로 하며, 마찬가지로 js 파일도 동일하게 해준다.

하지만 현재는 yarn assets를 실행하면 1회성으로 한번만 실행되는데, nodemon처럼 반복적으로 실행하도록 하기 위해서,  
watch라는 속성을 true로 추가해준다.

```js
module.exports = {
  entry: "./src/client/js/main.js",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development",
  watch: true,
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "assets"),
  },
 ...
}
```

현재 main.js의 파일 내용을 변경하고 저장하면, back-end가 재시작 된다. front-end의 내용을 편집해도 back-end는 변함 없이 실행 되도록 원하는데,  
nodemon이 해당 파일의 변화를 인식하고 재시작하기 때문이다. nodemon을 변경 하기 전에, ouput에서 `clean: true` 옵션을 추가하자.

이전 빌드의 결과물을 삭제하고, 새로운 빌드 결과물을 생성하는 옵션이다.

---

nodemon에 ignore 를 추가하는 방법은, package 파일에 직접적으로 추가하는 방법과, **nodemon.json** 별도 파일을 생성하는 법이 있는데,  
하나에 넣는것보다는 분리하는 게 좋으니까 분리하도록 하자.

```json
// nodemon.json
{
  "ignore": ["webpack.config.js", "src/client/*", "assets/*"],
  "exec": "babel-node src/init.js"
}
```

exec는 변경이 감지되면 실행할 옵션으로, 파일이 변경되면 babel-node로 src/init.js를 재실행 하도록 하는 것이다.  
감지될 파일에서 webpack.config.js와, src/client/, assets의 모든 파일이 제외된다.
