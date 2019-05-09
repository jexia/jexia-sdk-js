import * as Joi from 'joi';

export const FileUploadStatuses = ['in_progress', 'failed'];

export const FilesetRecordSchema = Joi.object({
  id: Joi.string().uuid().required(),
  status: Joi.string().allow(FileUploadStatuses).required(),
  created_at: Joi.string().isoDate().required(),
  updated_at: Joi.string().isoDate().required(),
  name: Joi.string().allow(null).required(),
  size: Joi.string().allow(null).required(),
  type: Joi.string().allow(null).required(),
  url: Joi.string().allow(null).required(),
});
