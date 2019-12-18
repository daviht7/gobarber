import Appointment from "../models/Appointment";
import User from "../models/User";
import Queue from "../../lib/Queue";
import CancellationMail from "../jobs/CancellationMail";
import { isBefore, subHours } from "date-fns";

class CancelAppointmentService {
  async run({ provider_id, user_id }) {
    console.log("log", provider_id, user_id);
    const appointment = await Appointment.findByPk(provider_id, {
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["name", "email"]
        },
        {
          model: User,
          as: "user",
          attributes: ["name"]
        }
      ]
    });

    if (appointment.user_id !== user_id) {
      throw new Error("you don't have permission to cancel this appoinment");
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error("you only cancel appointment 2 hours in advanced");
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment });
  }
}

export default new CancelAppointmentService();
