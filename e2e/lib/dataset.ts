import * as Joi from "joi";

export const DatasetRecordSchema = Joi.object().keys({
  id: Joi.string().required(),
  created_at: Joi.string().required(),
  updated_at: Joi.string().required(),
});
