import { isBefore, subHours } from 'date-fns';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import CreateAppointmentService from '../services/CreateAppointmentService';

class AppointmentController {
  async index (req, res) {

    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancellable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            }
          ]
        }
      ]
    })

    return res.json(appointments);
  }

  async store (req, res) {
    const { provider_id, date } = req.body;

    try {
      const appointment = await CreateAppointmentService.run({ provider_id, user_id: req.userId, date });
      return res.json(appointment);
    } catch (error) {      
      return res.status(400).json({ error: error.message })
    }    
  }

  async delete (req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ]
    })

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permision to cancel this appointment."
      })
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointment 2 hours in advance'
      })
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment)
  }
}

export default new AppointmentController();