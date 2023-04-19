import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minLength: 2 },
  socialLogin: { type: Boolean, default: false },
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
});

userSchema.pre("save", async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
