import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "회원가입" });
};
export const postJoin = async (req, res) => {
  const {
    body: { name, username, password, password2, email, location },
  } = req;
  const pageTitle = "회원가입";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  const exists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "이미 사용중인 아이디/이메일입니다.",
    });
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
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
  return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");

export const remove = (req, res) => res.send("Delete User");

export const getLogin = (req, res) => {
  // const { errorMessage } = req.session;
  // req.session.errorMessage = "";
  return res.render("login", { pageTitle: "로그인" });
};

export const postLogin = async (req, res) => {
  const pageTitle = "로그인";
  const { username, password } = req.body;

  /* 아이디, socialLogin이 false인 배열 찾기 */
  const user = await User.findOne({ username, socialLogin: false });

  // 존재하지 않은 아이디를 입력했을 경우
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: " 아이디 또는 비밀번호를 잘못 입력했습니다.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  /* 비밀번호가 입력한 것과 일치하지 않을 경우 */
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: " 아이디 또는 비밀번호를 잘못 입력했습니다.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

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
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  /** tokenRequest.json 안에 access_token이 있는지 체크 */
  if ("access_token" in tokenRequest) {
    /** access_token:value를 access_token에 저장하고, tokenRequest의 access_token 프로퍼티에
    값을 access_token에 저장한다 */
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    /** api.github.com/user 에서 headers 객체를 가져오는데 Authorization의 값을 token ${access_token}으로 변경해서 불러온다.
     *  그 후, json으로 저장한다.
     */
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(emailData);
    /** 이메일 배열에서 primary와 verified가 모두 true 인 배열만 찾기 */
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );

    /** 만약 email이 없다면, 오류 메시지와 함께 로그인으로 이동시킴 */
    if (!emailObj) {
      return res.redirect("/login");
    }

    /* 유저 데이터베이스에 email이 primary,verified가 true인 배열과 일치하는 배열만 찾기 */
    const user = await User.findOne({ email: emailObj.email });

    /* 유저 데이터베이스에 name이 깃허브 로그인 아이디와 같은지 체크 */
    const userName = await User.exists({ username: userData.login });
    console.log("userName: ", userName);
    /* 일치하는 이메일이 있다면, login 성공 */
    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }

    if (!userName) {
      /* 일치하는 이메일과 아이디가 없다면 새로 생성하기 */
      const user = await User.create({
        name: userData.name,
        avatarUrl: userData.avatar_url,
        socialLogin: true,
        username: userData.login,
        email: emailObj.email,
        location: userData.location,
      });
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    } else {
      /* 중복된 아이디로 생성 불가 */
      return res.render("/login", {
        pageTitle: "로그인",
        errorMessage:
          "계정이 없어 계정을 생성하려고 했지만, 중복되는 아이디가 있습니다.",
      });
    }
  } else {
    /* access_token이 없을 경우 */
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();

  /* 백엔드에서는 제거되었지만, 브라우저에서도 제거함 */
  res.clearCookie("connect.sid");
  return res.redirect("/");
};

export const see = (req, res) => res.send("See User");
