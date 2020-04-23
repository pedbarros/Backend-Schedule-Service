import * as Yup from 'yup';

export default async (req, res, next) => {
  try {    
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      canceled_at: Yup.date(),
    });

    await schema.validate(req.body, { abortEarly: false })
    return next();
  } catch (error) {
    return res.status(400).json({ error: 'Validation fails', messages: error.inner });
  }
}