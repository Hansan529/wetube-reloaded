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
