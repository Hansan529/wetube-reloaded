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
