# Javascript SDK End-2-end tests

## Running tests
```
> npm run cross-env NODE_TLS_REJECT_UNAUTHORIZED='0' JEXIA_DEV_DOMAIN='stag | com' E2E_PROJECT_ID='<project_id>'
  E2E_PROJECT_ZONE='<project_zone>' E2E_EMAIL='<user_email>' E2E_PASSWORD='<user_password>' RECAPTCHA_TOKEN='E2E.Tests.Recaptcha.Token'
  npm run test:e2e
```

## For running Fileset Module tests you need to provide additional env variables
```
AWS_KEY
AWS_SECRET
AWS_BUCKET
```
