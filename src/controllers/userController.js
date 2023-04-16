export const getJoin = (req, res) => {
  console.log(req.body);
  return res.render("join", { pageTitle: "회원가입" });
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
