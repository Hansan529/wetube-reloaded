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
