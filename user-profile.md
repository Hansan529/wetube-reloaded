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

post에 추가해주어 input의 name을 ()에 적어주어 미들웨어의 역할을 적용한다.

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

<br>

## Video Owner

`owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },` 비디오 모델에 다음과 같이 추가한다.

type: String, Date, Number와 같은 요소는 자바스크립트 내장 객체이고, objectID는 mongoose에서 사용하는 것이기에,  
mongoose.Schema.Types.ObjectId를 사용해야한다. 그리고 해당 ID가 어디서 참조되는지 모델명을 작성해주어야 한다. **ref: "User"**가 모델이다.

ID를 전송하기 위해서, postUpload에서 session.user값을 불러온다.

```pug
if String(video.owner) === String(loggedInUser._id)
    a(href=`${video.id}/edit`) Edit Video &rarr;
    br
    a(href=`${video.id}/delete`) Delete Video &rarr;
```

video에 owner가 추가되었으니, 로그인한 유저의 아이디와 비교해서 같으면 동영상에 대한 편집 버튼을 부여한다.  
video.owner는 ObjectId이기 때문에, === 타입도 일치하는지 비교하는 연산자에서는 일치하지 않아 같은 타입으로 변환시켜 비교한다.  
== 연산자로 비교해도 같은 결과를 얻을 수 있다.

video를 생성한 유저의 ID를 video에 추가하므로 유저의 정보를 알 수 있다.

```js
export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  const owner = await User.findById(video.owner);
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  return res.render("videos/watch", { pageTitle: video.title, video, owner });
};
```

video 객체에 owner의 유저 아이디가 있기 때문에, User 객체에서 해당 ID를 찾고, 정보를 페이지에 전달한다.

근데 우리는 Video에서 ref를 통해 ObjectId가 User에서 가져온걸 아는데 한번 더 찾아야할까?

mongoose를 활용해서 다음과 같이 변경해주었다.

```js
export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id).populate("owner");
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  return res.render("videos/watch", { pageTitle: video.title, video });
};
```

**populate**는 objectId 부분을 실제 **User 데이터**로 채워준다. 즉 다른 컬렉션의 문서를 참조할 수 있는 메소드이다. relaationship으로 컬렉션 속 스키마에 작성된 이름을 넣어준다.

Before

```
video:  {
  meta: { views: 0, rating: 0 },
  _id: new ObjectId("64493ce45160ecfc1b3711ce"),
  title: 's',
  fileUrl: 'uploads/videos/5ad7537b0f282b4c3d9bf8cafccbf6ce',
  description: 's',
  hashtags: [ '#s' ],
  owner: '64493c38aa89132d1a730f4d'
  createdAt: 2023-04-26T15:01:56.842Z,
  __v: 0
}
```

After

```
video:  {
  meta: { views: 0, rating: 0 },
  _id: new ObjectId("64493ce45160ecfc1b3711ce"),
  title: 's',
  fileUrl: 'uploads/videos/5ad7537b0f282b4c3d9bf8cafccbf6ce',
  description: 's',
  hashtags: [ '#s' ],
  owner: {
    _id: new ObjectId("64493c38aa89132d1a730f4d"),
    name: 'saan',
    socialLogin: true,
    avatarUrl: 'https://avatars.githubusercontent.com/u/115819770?v=4',
    username: 'Hansan529',
    email: 'hansan0529@gmail.com',
    location: 'Republic of Korea',
    __v: 0
  },
  createdAt: 2023-04-26T15:01:56.842Z,
  __v: 0
}
```

owner 부분에 user 데이터가 적용된 걸 볼 수 있다!!

이제 해당 비디오를 올린 사람의 프로필에 들어가면, 해당 유저가 올린 모든 비디오를 볼 수 있도록 해보자.

<br>

## User's Videos

```js
// userRouter
userRouter.get("/:id", see);

// userController
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const videos = await Video.find({ owner: id });
  if (!user) {
    return res.status(404).render("404", {
      pageTitle: "404",
      errorMessage: "존재하지 않는 유저입니다",
    });
  }
  const pageTitle = `${user.name}의 프로필`;
  return res.render("/users/profile", {
    pageTitle,
    user,
    videos,
  });
};
```

해당 유저의 ID값으로 데이터베이스에서 해당 유저를 찾아서 화면에 띄워주고, Video 객체에서 owner가 params의 id와 동일한 데이터 모두를 갖고온다.

```pug
extends ../base
include ../mixins/video

block content
  each video in videos
    +video(video)
  else
    div 어떠한 동영상도 없습니다.
```

해당 값을 profile.pug에서 비디오들을 불러낸다.

User 객체와 Video 객체 모두 각각 id로 찾는 방법 말고 다른 방법도 있는데, 해당 방법이 효율적이므로 코드를 교체한다.

```js
export const see = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("videos");
  ...
}
```

videos에 ObjectId를 갖고, videos에서 해당 Objectid를 찾고 맞는 객체를 도출한다.

```
{
  _id: new ObjectId("644a2dc2db6c415620ade2fc"),
  name: 'saan',
  socialLogin: true,
  avatarUrl: 'https://avatars.githubusercontent.com/u/115819770?v=4',
  username: 'Hansan529',
  email: 'hansan0529@gmail.com',
  location: 'Republic of Korea',
  videos: [
    {
      meta: [Object],
      _id: new ObjectId("644a2df4db6c415620ade2ff"),
      title: 'a',
      fileUrl: 'uploads/videos/54a523fa46e45584c446936b4d4eeb1a',
      description: 'a',
      hashtags: [Array],
      owner: new ObjectId("644a2dc2db6c415620ade2fc"),
      createdAt: 2023-04-27T08:10:28.670Z,
      __v: 0
    }
  ],
  __v: 1
}
```

User객체에 videos 객체가 들어온 모습을 볼 수 있다.

### **스키마에서 ref를 사용해 참조할 객체를 지정하고, 컨트롤러에서 해당 프로퍼티를 입력하면, ref에 있는 객체에서 일치하는 것을 찾아 가져온다.**

---

## BugFix

현재 User 모델에서는 pre 메소드로 저장되기 전에 실행하는 함수가 있는데,

```js
userSchema.pre("save", async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  next();
});
```

저장되기 전에 비밀번호가 있다면 (소셜 로그인 체크) 해싱하는 함수인데, 문제가 Upload할 때, Video의 id를 User에 저장하는 작업을 해서  
User 객체가 저장이 된다. 그러면 해당 함수가 실행되서 비밀번호가 또 다시 해싱되는 문제가 발생한다.

그래서 업로드하고 로그아웃 한뒤 다시 동일한 비밀번호로 로그인을 시도해도 이미 해싱되어서 해당 비밀번호로 로그인 할 수 없는 문제가 생긴다.

```js
userSchema.pre("save", async function (next) {
  if (this.isNew && this.password) {
    this.password = await bcrypt.hash(this.password, 5);
  } else if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  next();
});
```

isNew를 사용해서, Document가 새로 생기는지 체크 (소셜네트워크 체크) 해서 맞다면 (회원가입) 비밀번호를 해싱하고,  
password가 변경되면 true, 아닐경우 false를 출력하는 isModified를 사용한다. password가 변경되면 해싱되도록 (비밀번호 변경) 설정했다.
