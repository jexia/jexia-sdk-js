import * as Joi from "joi";

export const RTCActionSchema = Joi.string().valid("created", "updated", "deleted");

export const RTCResourceSchema = Joi.object().keys({
  type: Joi.string().valid("ds", "fs").required(),
  name: Joi.string().required()
});

export const RTCRecordSchema = Joi.object().keys({
  id: Joi.string().uuid().required()
});

export const RTCMessageSchema = Joi.object().keys({
  action: RTCActionSchema.required(),
  resource: RTCResourceSchema.required(),
  modifier: Joi.object().keys({
    id: Joi.string().required()
  }).required(),
  timestamp: Joi.string().isoDate().required(),
  data: Joi.array().items(RTCRecordSchema).required()
});

export const RTCChannelMessageSchema = Joi.object().keys({
  action: Joi.string().valid("published"),
  resource: Joi.object().keys({
    type: Joi.string().valid("channel").required(),
    name: Joi.string().required()
  }),
  modifier: Joi.object().keys({
    id: Joi.string().required()
  }).required(),
  timestamp: Joi.string().isoDate().required(),
  data: Joi.any().required()
});
