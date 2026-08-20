const Joi = require("joi");

const createBookingSchema = Joi.object({
  artist_id: Joi.number().integer().required(),
  event_date: Joi.string().required(),
  event_time: Joi.string().allow("", null).max(20),
  duration_hours: Joi.number().integer().min(1).max(12),
  event_type: Joi.string().allow("").max(100),
  location: Joi.string().allow("").max(100),
  notes: Joi.string().allow("").max(1000),
  amount: Joi.number().min(0),
  client_name: Joi.string().allow("", null).max(100),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .required(),
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
};
