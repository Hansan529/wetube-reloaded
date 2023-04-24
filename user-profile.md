# User Profile

## Edit Profile

```pug
extends base

block content
  form(method="POST")
    if loggedInUser.socialLogin
      label 아이디:
        input(name="username" placeholder="아이디" type="text" value=`${loggedInUser.username}`)
      label 비밀번호:
        input(name="name" placeholder="********" required type="password" minlength="4" disabled)
      p 비밀번호 변경하기
    else
      label 아이디:
        input(name="username" placeholder="아이디" type="text" value=`${loggedInUser.username}` disabled)
      label 비밀번호:
        input(name="name" placeholder="********" required type="password" minlength="4" disabled)
      p 비밀변고 변경하기
    label 별명
      input(name="name" placeholder="별명" value=`${loggedInUser.name}` required unique type="text" minlength="2")
    label 이메일
      input(name="email" placeholder="이메일" value=`${loggedInUser.email}` required type="email")
    label 지역
      input(name="location" placeholder="지역" value=`${loggedInUser.location}` required type="text")
```

유저가 소셜로그인 상태라면, id를 변경할 수 있도록 함, 아이디가 중복일 경우 랜덤으로 생성하기 때문에 이와 같이 설정함.

locals에 저장된 값을 활용해 User의 프로필을 form에 미리 value값에 넣어 둘 수 있음.

만약 로그인이 되어 있지 않아, loggedInUser의 값이 undefined일 경우 해당 페이지에 접속하면 어떻게 될 까?  
해당 속성을 불러 올 수 없어, 에러가 난다.

이와 같은 상황에서 벗어나기 위해, middleware를 생성한다.

```js
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};
```

만약, 로그인이 되어있다면, 다음으로 router로 이동하는 protectorMiddleware와,  
로그인이 안되어 있다면, 다음 router로 이동하는, 로그인 한 유저는 사용할 수 없도록 하는 publicOnlyMiddleware를 생성했다.

```js
// userRouter
import { protectorMiddleware } from "../middlewares";

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/remove", protectorMiddleware, remove);
```

미들웨어를 불러온 뒤에, 먼저 적용한다. get과 post에 대한 route에 동시에 부여하기 위해서 간편하게 all() 를 사용해서 적용해준다.  
all은 get,post, put, delete 등 모든 http method에 적용된다.

---

## Edit Profile POST

edit 페이지에서 변경할 요소를 form에 입력하고 post를 하면 변경이 되지 않는다.  
데이터베이스를 확인해보면, 데이터베이스상에서는 업데이트가 되었다.  
하지만 loggedInUser는 req.session.user가 되는데, **req.session.user**는 로그인할 때 갱신된다.

그러므로, 수정을 한 다음에도 req.session.user를 업데이트를 해주어야 정상적으로 form에서도 변경된 값이 나올 것이다.

findByIdAndUpdate 옵션에는 new 가 있는데, 기본은 업데이트 하기 전의 데이터베이스 정보를 갖고오는 것이라,  
**new: true**를 해주면 가장 최근에 업데이트한 값을 가져온다.

<br>

```js
export const postEdit = async (req, res) => {
  const {
    session: {
      user: {
        _id,
        name: sessionName,
        email: sessionEmail,
        username: sessionUsername,
      },
    },
    body: { name, email, username, location },
  } = req;
  let searchParams = [];
  if (name !== sessionName) {
    searchParams.push({ name });
  }
  if (email !== sessionEmail) {
    searchParams.push({ email });
  }
  if (username !== sessionUsername) {
    searchParams.push({ username });
  }
  if (searchParams.length > 0) {
    const findUser = await User.findOne({ $or: searchParams });
    if (findUser && findUser._id.toString() !== _id) {
      return res.status(400).render("edit-profile", {
        pageTitle: "edit Profile",
        errorMessage: "이미 존재하는 아이디, 이메일, 별명입니다.",
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};
```

세션에서 기존 데이터베이스에 존재하는 값을 찾고, 폼의 데이터와 일치하지 않는다면 (중복체크, 변경하려고 함) 데이터베이스에서 내가 변경하고자 하는 데이터를 갖고 있는  
데이터베이스를 찾는다. 만약 있다면 unique 사항때문에, 실패를 렌더링, 다만 id가 같다면 통과, id가 다르면 오류

업데이트하는 코드는 그대로 두고, 실패를 먼저 계산하고 오류가 발생하면 코드 진행을 멈추어서 업데이트 코드가 실행되지 않도록 함
