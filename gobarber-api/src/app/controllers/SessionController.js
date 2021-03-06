import User from "../models/User";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";
import File from "../models/File";

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: File, as: "avatar", attributes: ["id", "path", "url"] }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: "user not found!" });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(404).json({ error: "password does not match" });
    }

    const { id, name, avatar, provider } = user;

    return res.json({
      user: { id, name, email, avatar, provider },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expireIn
      })
    });
  }
}

export default new SessionController();
