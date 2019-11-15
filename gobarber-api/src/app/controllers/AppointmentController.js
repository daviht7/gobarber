import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";
import Notification from '../schemas/Notification'
import * as Yup from "yup";

import { startOfHour, parseISO, isBefore, format } from 'date-fns'
import pt from 'date-fns/locale/pt'

class AppointmentController {

  async index(req, res) {

    const { page = 1 } = req.query

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null
      },
      attributes: ["id", "date"],
      limit: 20,
      order: ["date"],
      offset: (page - 1) * 20,
      include: [{
        model: User,
        as: "provider",
        attributes: ["id", "name"],
        include: [{
          model: File,
          as: "avatar",
          attributes: ["id", "path", "url"]
        }]
      }]
    })

    return res.json(appointments)

  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "validation fails" });
    }

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: "you can only create appointment with a provider." });
    }

    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: "past dates are not permitted" })
    }

    const checkAvaiable = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    console.log(checkAvaiable)

    if (checkAvaiable) {
      return res.status(400).json({ error: "date does not available" })
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    });

    const user = await User.findByPk(req.userId)
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM',ás 'H:mm'h'",
      { locale: pt }
    )

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate} `,
      user: provider_id
    })

    return res.json({ appointment });
  }

}

export default new AppointmentController();