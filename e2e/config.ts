const MAESTRO = `https://services.jexia.${process.env.JEXIA_DEV_DOMAIN}`;
const MANAGEMENT = `${MAESTRO}/management`;

export const api = {
  login: `${MAESTRO}/auth/signin`,
  dataset: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/mimir/ds`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/mimir/ds/{dataset_id}`,
    field: {
      create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/mimir/ds/{dataset_id}/field`
    },
    relation: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/mimir/ds/relation`
  },
  fileset: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/bestla/fs`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/bestla/fs/{fileset_id}`,
    field: {
      create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/bestla/fs/{fileset_id}/field`
    }
  },
  channel: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/sharky/channel`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/sharky/channel/{channel_id}`
  },
  apikey: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/utgard/`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/utgard/{key}`
  },
  policy: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/rakshak/`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/rakshak/{policy_id}`
  },
  ums: {
    schema: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/midgard/schema`,
  },
  gateways: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/enigma/gateways`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/enigma/gateways/{gateway_id}`,
  },
  flows: {
    create: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/enigma/actions`,
    delete: `${MANAGEMENT}/${process.env.E2E_PROJECT_ID}/enigma/actions/{flow_id}`,
  }
};
