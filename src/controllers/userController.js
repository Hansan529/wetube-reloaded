import User from "../models/User";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import Video from "../models/Video";
import axios from "axios";

// * 회원가입 페이지
export const getJoin = (req, res) => {
  return res.render("users/join");
};

// * 회원가입
export const postJoin = async (req, res) => {
  const {
    body: { name, username, password, password2, email, location },
  } = req;
  if (password !== password2) {
    req.flash("error", "비밀번호가 일치하지 않습니다.");
    return res.status(400).render("users/join");
  }
  const exists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (exists) {
    req.flash("error", "이미 사용중인 아이디/이메일입니다.");
    return res.status(400).render("users/join");
  }
  try {
    await User.create({
      name,
      username,
      password,
      email,
      location,
    });
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).render("users/join");
  }
  return res.redirect("/");
};

// * 프로필 수정 페이지
export const getEdit = (req, res) => {
  return res.render("users/edit-profile");
};

// * 프로필 수정
export const postEdit = async (req, res) => {
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
      req.flash("error", "이미 존재하는 아이디, 이메일, 별명입니다.");
      return res.status(400).render("users/edit-profile");
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? `/${file.path}` : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("edit");
};

// * 비밀번호 변경 페이지
export const getChangePassword = (req, res) => {
  return res.render("users/change-password");
};

// * 비밀번호 변경
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPassword1 },
  } = req;
  const user = await User.findById(_id);

  /* 비밀번호가 일치하는지 체크 */
  const passwordExists = await bcrypt.compare(oldPassword, user.password);
  if (!passwordExists) {
    req.flash("error", "기존 비밀번호가 일치하지 않습니다.");
    return res.status(400).render("users/change-password");
  }

  /* 변경하고자 하는 비밀번호 체크 */
  if (newPassword !== newPassword1) {
    req.flash("error", "변경하고자 하는 비밀번호가 일치하지 않습니다.");
    return res.status(400).render("users/change-password");
  }

  /* 기존 비밀번호와 동일한지 체크 */
  if (oldPassword === newPassword) {
    req.flash("error", "기존의 비밀번호와 동일한 비밀번호입니다");
    return res.status(400).render("users/change-password");
  }

  /* 비밀번호 업데이트 */
  user.password = newPassword;
  user.save();
  req.flash("success", "비밀번호 변경에 성공했습니다.");
  return res.redirect("logout");
};

export const remove = (req, res) => res.send("Delete User");

//* 로그인 페이지
export const getLogin = (req, res) => {
  return res.render("users/login");
};

//* 로그인 절차
export const postLogin = async (req, res) => {
  const { username, password } = req.body;

  /* 아이디, socialLogin이 false인 배열 찾기 */
  const user = await User.findOne({ username, socialLogin: false });

  // 존재하지 않은 아이디를 입력했을 경우
  if (!user) {
    req.flash("error", "존재하지 않는 유저입니다.");
    return res.status(400).render("users/login");
  }
  const ok = await bcrypt.compare(password, user.password);
  /* 비밀번호가 입력한 것과 일치하지 않을 경우 */
  if (!ok) {
    req.flash("error", "아디이 혹은 비밀번호가 일치하지 않습니다.");
    return res.status(400).render("users/login");
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// * 깃허브 로그인 토큰 발부
export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

// * 깃허브 엑세스 토큰을 통해 로그인 및 회원가입
export const finishGithubLogin = async (req, res) => {
  const baseUrl = `https://github.com/login/oauth/access_token`;
  /** Github에서 보낸 값은 GET 값이기에 query에 저장된다. query의 매개변수라 참조한다. */
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };

  /** config의 프로퍼티들을 일렬로 병합한다. */
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  /** fetch로 POST하여 서버에서 JSON 형태로 정보를 받고, tokenRequest를 JSON으로 저장한다. */
  const tokenResponse = await axios(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  /** tokenRequest.json 안에 access_token이 있는지 체크 */
  if (tokenResponse) {
    /** access_token:value를 access_token에 저장하고, tokenRequest의 access_token 프로퍼티에
    값을 access_token에 저장한다 */
    const { access_token } = tokenResponse.data;
    const apiUrl = "https://api.github.com";

    /** api.github.com/user 에서 headers 객체를 가져오는데 Authorization의 값을 token ${access_token}으로 변경해서 불러온다.
     *  그 후, json으로 저장한다.
     */
    const userData = await axios(`${apiUrl}/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    const emailData = await axios(`${apiUrl}/user/emails`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    /** 이메일 배열에서 primary와 verified가 모두 true 인 배열만 찾기 */
    const emailObj = emailData.data.find(
      (email) => email.primary === true && email.verified === true
    );

    /** 만약 email이 없다면, 오류 메시지와 함께 로그인으로 이동시킴 */
    if (!emailObj) {
      return res.redirect("/login");
    }

    /* 유저 데이터베이스에 email이 primary,verified가 true인 배열과 일치하는 배열만 찾기 */
    const userAlready = await User.findOne({ email: emailObj.email });

    /* 일치하는 이메일이 있다면, login 성공 */
    if (userAlready) {
      req.session.loggedIn = true;
      req.session.user = userAlready;
      return res.redirect("/");
    } else {
      const userNameExists = await User.exists({
        username: userData.data.login,
      });
      const nameExists = await User.exists({ name: userData.data.name });
      let username = userData.data.login;
      let name = userData.data.name;

      /* 일치하는 아이디가 있으면 랜덤 아이디로 지정 */
      userNameExists ? (username = nanoid(10)) : username;

      /* 일치하는 닉네임이 있으면 랜덤 닉네임으로 지정 */
      nameExists ? (name = nanoid(10)) : name;

      /* 유저 생성 */
      const user = await User.create({
        name,
        avatarUrl: userData.data.avatar_url,
        socialLogin: true,
        username,
        email: emailObj.email,
        location: userData.data.location,
      });

      /* login 처리 */
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  } else {
    /* access_token이 없을 경우 */
    return res.redirect("/login");
  }
};

// * 로그아웃
export const logout = (req, res) => {
  /* 세션 값 삭제 */
  req.session.destroy();

  /* 백엔드에서는 제거되었지만, 브라우저에서도 제거함 */
  res.clearCookie("connect.sid");
  return res.redirect("/");
};

// * 유저 업로드 목록 확인
export const see = async (req, res) => {
  const { id } = req.params;

  /* User 객체에서 videos 객체를 가져옴 */
  const user = await User.findById(id).populate({
    path: "videos",
    populate: { path: "owner" },
  });
  if (!user) {
    req.flash("error", "존재하지 않는 유저입니다.");
    return res.status(404).render("404");
  }
  return res.render("users/profile", {
    user,
  });
};
