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

<br>

---

## Change Password

```js
const {
  session: {
    user: { _id },
  },
  body: { oldPassword, newPassword, newPassword1 },
} = req;
const pageTitle = "비밀번호 변경";
const user = await User.findById(_id);

/* 비밀번호가 일치하는지 체크 */
const passwordExists = await bcrypt.compare(oldPassword, user.password);
if (!passwordExists) {
  return res.status(400).render("users/change-password", {
    pageTitle,
    errorMessage: "기존 비밀번호가 일치하지 않습니다.",
  });
}

/* 변경하고자 하는 비밀번호 체크 */
if (newPassword !== newPassword1) {
  return res.status(400).render("users/change-password", {
    pageTitle,
    errorMessage: "변경하고자 하는 비밀번호가 일치하지 않습니다.",
  });
}

/* 기존 비밀번호와 동일한지 체크 */
if (oldPassword === newPassword) {
  return res.status(400).render("users/change-password", {
    pageTitle,
    errorMessage: "기존의 비밀번호와 동일한 비밀번호입니다",
  });
}

/* 비밀번호 업데이트 */
user.password = newPassword;
user.save();
return res.redirect("logout");
```

현재 접속중인 유저의 id값을 불러와서, 데이터베이스에서 해당 id를 찾고, password를 업데이트하는 방식이다.

만약 기존 비밀번호가 일치하지 않거나, 기존과 변경하고자하는 비밀번호가 같거나, 비밀번호와 비밀번호 확인이 일치하지 않는다면  
오류 메세지를 갖고 재렌더링함.

<br>

## File Uploads

```pug
input(name="avatarUrl" type="file" accept="image/*")
```

이미지 타입만 업로드할 수 있도록 지정

```bash
$ npm i multer
$ yarn add multer
```

파일을 업로드할 수 있도록 하는 middleware 패키지이다.

`form(method="POST" enctype="multipart/form-data")` encode하여 업로드가 가능하기 때문에,

즉 multer는 enctype을 지정해주어야만 해당 폼에 대해 업로드를 한다.

```js
// middlewares
import multer from "multer";

export const uploadFile = multer({ dest: "uploads/" });
```

하드 드라이브에 직접 업로드한 파일을 저장하는 방법이다.

```js
// userRouter
import { uplaodFile } from "../middelwares";

userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(uploadFile.single("avatarUrl"), postEdit);
```

any, array, fiels, none, single 가 있는데, 업로드할 파일의 개수에 대한 메소드이다.  
단일만 받을거니까 single로 설정하고, input의 name을 String으로 입력한다.

uploadFile의 역할은 template의 input 요소에서 오는 avatarUrl 파일을 가지고 uploads 파일에 저장한 뒤,  
postEdit에 파일 정보를 전달하는 역할을 한다.

```js
export const postEdit = (req, res) => {
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
    file,
  } = req;
};
```

그렇게 되면, req.file를 사용할 수 있다. req.file를 console에서 확인해보면

```
file:  {
  fieldname: 'avatarUrl',
  originalname: 'payment__appleCard.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '2d9dea7f53c167f0f0ac5e8122b5ffc4',
  path: 'uploads/2d9dea7f53c167f0f0ac5e8122b5ffc4',
  size: 50193
}
```

이름, 원본 이름, 저장이름, 저장경로 등등 값들이 저장되어있다. 작업파일에 uploads 폴더에  
**2d9dea7f53c167f0f0ac5e8122b5ffc4** 라는 파일 명으로 저장되어있다.

특이하게 이미지 확장자가 없는 걸 알 수 있다.

Controller에서 path값을 사용해서 업데이트를 하면 될 것 같다.

`file: { path } = req;` 잘 되는거 같지만 문제가 있다.

만약에 유저가 이미지를 변경하지 않는다면? 즉 파일을 업로드하지 않는다면?  
서버에서 에러가 발생하게 될 것이다.

그래서 결국 `file`만 불러오도록 한 뒤, 업데이트하는 코드에 삼항연산자를 사용한다.

```js
const {
  session: {
    user: {
      _id,
      avatarUrl,
      name: sessionName,
      email: sessionEmail,
      username: sessionUsername,
    },
  },
  body: { name, email, username, location },
  file,
} = req;

const updatedUser = await User.findByIdAndUpdate(
  _id,
  {
    avatarUrl: file ? file.path : avatarUrl,
    name,
    email,
    username,
    location,
  },
  { new: true }
);
```

file 값이 undefiend가 아니라면 path값을 입력하고, undefiend일 경우 avatarUrl을 그대로 업데이트한다.

session.user에 avatarUrl이 업데이트되어, pug에서 img 태그로 확인해보려고 하면,  
보이지 않는다. 브라우저가 서버의 어떠한 폴더라도 접근이 가능하면 보안상 취약해지기 때문에

static을 사용한다. 해당 폴더는 브라우저에게 노출되어 접근이 가능하다.

```js
// server
app.use("/uploads", express.static("uploads"));
```

static()에는 노출할 폴더명을 입력하면 된다.

DB에는 경로를 저장하고, 파일은 별도로 저장해야한다.

```js
// middlewares
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 1000000,
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
});
```

fileSize의 단위는 byte로 **1000000**, 1MB로 설정했다. 만약 해당 파일보다 큰 이미지 혹은 비디오를 업로드하면  
`File too large` 라는 오류가 난다.

속성은 여러가지가 있다.

| 키            | 설명                                                                          | 기본값    |
| ------------- | ----------------------------------------------------------------------------- | --------- |
| fieldNameSize | Max field name size                                                           | 100 bytes |
| fieldSize     | Max field value size (in byte)                                                | 1MB       |
| fields        | Maa number of non-file fields                                                 | Infinity  |
| fileSize      | For multipart forms, the max file size (in bytes)                             | Infinity  |
| files         | For multipart forms, the max number of file fields                            | Infinity  |
| parts         | For multipart forms, the max number of parts(fields + files)                  | Infinity  |
| headerPairs   | For multipart forms, the max number of <br>header key => value pairs to parse | 2000      |

<br>

해당 미들웨어를 적용시켜준다.

```js
// videoRouter
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

// userRouter
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatarUrl"), postEdit);
```

post에 추가해주어 미들웨어의 역할을 적용한다.

---

<br>

## Video Upload

```pug
//- upload
form(method="post" enctype="multipart/form-data")
  input(name="video" type="file" accept="video/*")
```

파일을 업로드할 수 있도록 enctype 설정을 해준다.

```pug
//- watch
video(src=`/${{video.fileUrl}}` controls)
```

video를 해당 경로에서 찾아서 출력한다.

```js
// postUpload
const {
  file: { path: fileUrl },
} = req;

await Video.create({
  title,
  fileUrl,
  description,
  hashtags: Video.formatHashtags(hashtags),
});
```

postUpload에서 multer를 통해 file 값을 사용할 수 있으므로, file 의 path 값을 fileUrl에 저장하고,  
Video를 생성할 때, fileUrl(path값)을 저장한다.

uploads/videos에 저장된 걸 볼 수 있다.
