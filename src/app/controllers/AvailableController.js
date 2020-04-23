import AvailableService from "../services/AvailableService";

class AvailableController {
  async index (req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);

    try {
      const available = await AvailableService.run({ provider_id: req.params.providerId, date: searchDate });
      return res.json(available);
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export default new AvailableController();