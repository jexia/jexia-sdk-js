import * as Joi from "joi";

export const BackendRequestSchema = Joi.object().keys({
  headers: Joi.object(),
  method: Joi.string().allow("GET", "POST", "PUT", "PATCH", "DELETE").required(),
  body: Joi.any()
});

export const BackendErrorSchema = Joi.object().keys({
  id: Joi.string().uuid().required(),
  request: BackendRequestSchema,
  httpStatus: Joi.object().keys({
    code: Joi.number().required(),
    status: Joi.string().required(),
  }).required(),
  message: Joi.string().required(),
});
