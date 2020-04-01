import User from "../models/User"
import * as Yup from "yup"

class UserController {
  async store(req, res) {
    //Validations with Yup
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(3)
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails" })
    }

    const userExists = await User.findOne({ where: { email: req.body.email } })

    //Check if the email that the user want to create already exsit
    if (userExists) {
      return res.status(400).json({ erro: "User already exist" })
    }

    const { id, name, email, provider } = await User.create(req.body)
    return res.json({ id, name, email, provider })
  }

  async update(req, res) {
    //Validations with Yup
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(3),
      password: Yup.string()
        .min(3)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails" })
    }

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
