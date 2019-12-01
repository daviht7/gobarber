import Appointment from "../models/Appointment";
import User from "../models/User";

import { Op } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    });

    if (!checkUserProvider) {
      return res.status(401).json({ error: "user is not a provider." });
    }

    const { date } = req.query;
    const dateParsed = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        date: {
          [Op.between]: [startOfDay(dateParsed), endOfDay(dateParsed)]
        }
      },
      include: [{ model: User, as: "user", attributes: ["name"] }],
      order: ["date"]
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
