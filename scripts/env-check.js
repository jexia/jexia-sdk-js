const availableVars = [
  "E2E_PROJECT_ID",
  "E2E_PROJECT_ZONE",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "JEXIA_DEV_DOMAIN",
  "E2E_PROJECT_URL",
  "E2E_EMAIL",
  "E2E_PASSWORD",
  "RECAPTCHA_TOKEN",
/* these are only for jfs module tests
   "AWS_KEY",
  "AWS_SECRET",
  "AWS_BUCKET", */
];

const docUrl = "https://github.com/jexia/jexia-sdk-js/blob/master/e2e/README.md";

const notAvailableVars = availableVars
  .filter(env => !process.env[env])
  .join(", ");

if (notAvailableVars.length) {
  console.error(`[ Error ] Missing environment variables: ${notAvailableVars}. See ${docUrl}`);
  process.exit(1);
}

process.exit(0);
