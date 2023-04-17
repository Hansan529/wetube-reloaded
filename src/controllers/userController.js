import bcrypt from "bcrypt";
import User from "../models/User";

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

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "로그인" });

export const postLogin = async (req, res) => {
  const pageTitle = "로그인";
  const { username, password } = req.body;
  const user = await User.findOne({ username });

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
  return res.render("login", {
    pageTitle,
  });
};

export const logout = (req, res) => res.send("Logout");

export const see = (req, res) => res.send("See User");
