import Appointment from "../models/Appointment";
import User from "../models/User";
import Notification from "../schemas/Notification";
import { startOfHour, parseISO, isBefore, format } from "date-fns";
import pt from "date-fns/locale/pt";

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider) {
      throw new Error("you can only create appointment with a provider.");
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error("past dates are not permitted");
    }

    const checkAvaiable = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvaiable) {
      throw new Error("date does not available");
    }

    const appointment = await Appointment.create({
      user_id: user_id,
      provider_id,
      date
    });

    const user = await User.findByPk(user_id);
    const formattedDate = format(hourStart, "'dia' dd 'de' MMMM',ás 'H:mm'h'", {
      locale: pt
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate} `,
      user: provider_id
    });

    return appointment;
  }
}

export default new CreateAppointmentService();
