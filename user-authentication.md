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
