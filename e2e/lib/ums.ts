import * as Joi from "joi";

export const UserSchema = Joi.object().keys({
  id: Joi.string().required(),
  email: Joi.string().required(),
  active: Joi.boolean().required(),
  confirmed_at: Joi.when("active", { is: true, then: Joi.string(), otherwise: null }).required(),
  created_at: Joi.string().required(),
  updated_at: Joi.string().required(),
});
