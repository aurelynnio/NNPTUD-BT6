var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let {
  RegisterValidator,
  ChangePasswordValidator,
  handleResultValidator,
} = require("../utils/validatorHandler");
let bcrypt = require("bcrypt");
let { signToken } = require("../utils/jwtHandler");
let { checkLogin } = require("../utils/authHandler");
/* GET home page. */
router.post(
  "/register",
  RegisterValidator,
  handleResultValidator,
  async function (req, res, next) {
    let newUser = userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      "69aa8360450df994c1ce6c4c",
    );
    await newUser.save();
    res.send({
      message: "dang ki thanh cong",
    });
  },
);
router.post("/login", async function (req, res, next) {
  let { username, password } = req.body;
  let getUser = await userController.FindByUsername(username);
  if (!getUser) {
    res.status(403).send("tai khoan khong ton tai");
  } else {
    if (getUser.lockTime && getUser.lockTime > Date.now()) {
      res.status(403).send("tai khoan dang bi ban");
      return;
    }
    if (bcrypt.compareSync(password, getUser.password)) {
      await userController.SuccessLogin(getUser);
      let token = signToken({
        id: getUser._id,
      });
      res.send(token);
    } else {
      await userController.FailLogin(getUser);
      res.status(403).send("thong tin dang nhap khong dung");
    }
  }
});
router.get("/me", checkLogin, function (req, res, next) {
  res.send(req.user);
});

router.patch(
  "/changepassword",
  checkLogin,
  ChangePasswordValidator,
  handleResultValidator,
  async function (req, res, next) {
    let { oldpassword, newpassword } = req.body;
    let user = req.user;
    if (!bcrypt.compareSync(oldpassword, user.password)) {
      res.status(400).send("oldpassword khong dung");
      return;
    }
    await userController.ChangePassword(user, newpassword);
    res.send({
      message: "doi mat khau thanh cong",
    });
  },
);

module.exports = router;
