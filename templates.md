# Templates

## Return HTML

메시지를 출력 할 때, HTMl 태그도 사용이 가능하다고 했다.

    res.send("<!DOCYTYPE html><html lang="ko><head><title>제목</title></head>");

하지만 매 번 엄청난 길이의 코드를 입력하는 건 ... 말이 안되는 작업이다. 게다가 common으로 사용되는 header,footer에 변동이 생긴다면  
모든 페이지에서 수정 사항에 대해 작업을 해주어야 하기에 매우매우매우 비효율 적인 작업이다.

해당 작업을 개선해주는 도구로, `Pug`가 있다.

```
$ npm i pug
```

설치한 뒤, express에서 한 가지 코드만 추가해주면 된다.  
`app.set("view engine", "pug");`

여기서 app은 express를 불러올 때 지정한 변수 이름이다.

pug 작성법은 다음과 같다.

1. home.pug 파일을 생성시킨다.
2. html을 소문자로 작성하며, 속성은 괄호 안에 작성하도록 한다.
3. 부모 속성보다 안쪽에 있어야 한다. 2칸 공백이거나, 탭을 사용한다.
4. 닫는 태그는 사용하지 않는다.

express의 공식 문서를 보면 views는 process.cwd() + '/views' 폴더에서  
인식되는 것을 알 수 있다. 하지만 우리의 폴더는 다음과 같지 않다.

cwd는 current work directory로 현재 작업 디렉토리를 뜻한다.  
현재 작업 디렉토리를 확인 하는 법은 node를 실행하는 곳은 어디일까?

```js
/* package.json */
"scripts": {
    "dev": "nodemon --exec babel-node src/server.js"
  },
```

package.json 파일이다. 해당 위치는, 홈 다 이렉토리에 있고, home.pug은 /src/views 폴더 안에 있어서 express가 불러올 수 없다고 하는 오류를 내뱉는 것이다.

오류:  
`"/Users/사용자명/Documents/폴더/wetube/views"` : express가 참조하는 곳

그렇다면 2가지 해결책이 있다.  
views 폴더를 wetube로 옮기는 방법과 디폴트 참조 루트를 변경하는 법

1. 파일 관리에 문제가 생김
2. `app.get("views", process.cwd() + "/src/views");` 참조 경로를 변경함

pug는 자바스크립트이기에, 변수를 사용 할 수 있다.  
`#{}` 태그를 사용해서 괄호 안에 작성하면 된다.

자바스크립트 코드가 유저가 보기 전에 텍스트로 변환이 되는, 렌더링 작업을 한다.

현재 작업한 방법으로 pug를 작성하면 아래와 같다.

```pug
doctype html
html(lang="ko")
  head
    meta(charset="UTF-8")
    meta(http-equiv="X-UA-Compatible", content="IE=edge")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title Wetube
  body
    h1 Watch Video!
    footer &copy; #{new Date().getFullYear()} Webtube
```

문제가 있다. footer에 대한 내용을 변경했다면, 모든 페이지에서도 자동으로 적용되게 해야하는게 작업 시간을 줄일 텐데,  
지금과 같이 한다면 모든 페이지에서도 복사 붙여넣기 작업을 해야한다.

그 문제를 해결해주는게 `partial` 이다.  
pug의 강력한 기능인데, sass의 include 처럼 불러올 수 있다.

views/partials/ 폴더 안에 footer.pug를 생성후,
기존 footer 내용을 옮긴다.

그리고 home.pug 에서 `include partials/footer.pug` 를 하면 footer의 내용이 불러와진다!

pug로 얻을 수 있는 점에 깔끔한 코드, html에 자바스크립트 사용, 반복하지 않아도 되는 점을 얻을 수 있다.

<br>

더 발전해서, 매 파일마다 docytype ~ body, include 하는 내용이 모두 같은 점을 통해 inheritance(상속)이라는 개념으로 접근해보자.

home.pug, watch.pug, edit.pug, base.pug 파일을 생성하고 base.pug 에서  
베이스가 될 코드를 입력한다.

```pug
doctype html
html(lang="ko")
  head
    meta(charset="UTF-8")
    meta(http-equiv="X-UA-Compatible", content="IE=edge")
    meta(name="viewport", content="width=device-width , initial-scale=1.0")
    title Wetube
  body
    h1 Base!
  include partials/footer.pug
```

해당 파일을 home,watch,edit 에서 `extend base.pug`만 하면 해당 파일에 상속된다.

상속되기에 모든 파일에서 Base! 라는 제목 태그를 볼 수 있는데, `h1 Base!` 코드 대신,  
`block content` 라는 코드로 변경하길 바람

```pug
extends base.pug

block content
  h1 Home
```

결과는 base 기반에, Home 이라는 h1태그를 볼 수 있다.  
@mixin @content와 방식이 비슷하다고 생각된다.

`@include name { style }`, `block content tag 내용`

blcok content가 body가 된다. `block` 는 필수이고, content는 사용자 마음대로 변경해도 된다.

title를 Home | Wetube, Edit | Wetube 형식으로 하려면 변수를 이용해야한다.

```pug
  title #{pageTitle} | Wetube
body
  block content
  include partials/footer.pug
```

pageTitle 이라는 변수를 주었고, 해당 변수에 대한 값을 보내기 위해서는 Controller에서  
`res.render("이름", { pageTitle: "변수명" })` 을 설정해주면 된다.

```js
export const trending = (req, res) => res.render("home", { pageTitle: "Home" });
export const see = (req, res) => res.render("watch", { pageTitle: "Watch" });
export const edit = (req, res) => res.render("edit", { pageTitle: "Edit" });
```

홈페이지를 접속해보면 적용이 된 것을 볼 수 있다!
