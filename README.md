nodeJS 프로젝트 생성

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
