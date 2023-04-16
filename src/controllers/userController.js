import User from "../models/User";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "회원가입" });
};
export const postJoin = async (req, res) => {
  const {
    body: { name, username, password, email, emailType },
  } = req;
  console.log(emailType);
  try {
    await User.create({
      name,
      username,
      password,
      email,
      required,
    });
  } catch (error) {
    console.log(error);
    return res.render("404", { pageTitle: "오류가 발생했습니다" });
  }
  return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
