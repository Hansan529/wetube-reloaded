import User from "../models/User";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "회원가입" });
};
export const postJoin = async (req, res) => {
  const {
    body: { name, username, password, email, location },
  } = req;
  const pageTitle = "회원가입";
  const userExists = await User.exists({ username });
  if (userExists) {
    return res.render("join", {
      pageTitle,
      errorMessage: "이미 사용중인 아이디입니다.",
    });
  }
  const emailExists = await User.exists({ email });
  if (emailExists) {
    return res.render("join", {
      pageTitle,
      errorMessage: "이미 사용중인 이메일입니다",
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
    console.log(error);
    return res.render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
  return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
