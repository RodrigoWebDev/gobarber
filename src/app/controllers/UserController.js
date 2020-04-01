import User from "../models/User"

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } })

    //Check if the email that the user want to create already exsit
    if (userExists) {
      return res.status(400).json({ erro: "User already exist" })
    }

    const { id, name, email, provider } = await User.create(req.body)
    return res.json({ id, name, email, provider })
  }

  async update(req, res) {
    const { email, oldPassword } = req.body

    const user = await User.findByPk(req.userId)

    // check if the email that the user want to change to already exist
    if (email && email != user.email) {
      const userExists = await User.findOne({ where: { email } })
      if (userExists) {
        return res.status(400).json({ error: "User already exist" })
      }
    }

    //Chekc if the old password matches
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "Password does not match" })
    }

    const { id, name, provider } = await user.update(req.body)

    console.log(id, name, email, provider)

    return res.json({ id, name, email, provider })
  }
}

export default new UserController()
