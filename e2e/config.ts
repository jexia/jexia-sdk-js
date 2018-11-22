export const api = {
  login: `https://services.jexia.${process.env.JEXIA_DEV_DOMAIN}/auth/signin`,
  dataset: {
    create: `https://services.jexia.${process.env.JEXIA_DEV_DOMAIN}/management/${process.env.E2E_PROJECT_ID}/mimir/ds`
  }
};
