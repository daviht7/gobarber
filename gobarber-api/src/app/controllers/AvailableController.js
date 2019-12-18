import AvailableService from "../services/AvailableService";

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date wasn't passed. " });
    }

    const dateSearched = Number(date);

    const available = await AvailableService.run({
      provider_id: req.params.providerId,
      date: dateSearched
    });

    return res.json(available);
  }
}

export default new AvailableController();
