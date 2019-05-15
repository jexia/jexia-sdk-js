import * as Joi from "joi";

export const RTCMessageSchema = Joi.object().keys({
  action: Joi.string().valid("created", "updated", "deleted").required(),
  resource: Joi.object().keys({
    type: Joi.string().valid(["ds", "fs"]).required(),
    name: Joi.string().required()
  }).required(),
  modifier: Joi.object().keys({
    id: Joi.string().required()
  }).required(),
  timestamp: Joi.string().required(),
  data: Joi.array().required()
});
