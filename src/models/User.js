import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minLength: 2 },
  socialLogin: { type: Boolean, default: false },
  avatarUrl: String,
  username: { type: String, required: true, unique: true, minlength: 4 },
  password: {
    type: String,
    required: function () {
      return !this.socialLogin;
    },
    minlength: 4,
  },
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function (next) {
  /* 새롭게 생성(회원가입) 하는데, 비밀번호가 있다면 해싱 처리 */
  if (this.isNew && this.password) {
    this.password = await bcrypt.hash(this.password, 5);
  } else if (this.isModified("password")) {
    /* 비밀번호가 변경되면(없으면 false, password 자체가 없으면 무조건 false) 해싱 처리 */
    this.password = await bcrypt.hash(this.password, 5);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
