# Javascript SDK End-2-end tests

## Running tests
```
# linux, macos
> NODE_TLS_REJECT_UNAUTHORIZED='0' JEXIA_DEV_DOMAIN='stag | com' E2E_PROJECT_ID='<project_id>' 
  E2E_EMAIL='<user_email>' E2E_PASSWORD='user_password' npm run test:e2e

# windows
> .\node_modules\.bin\cross-env NODE_TLS_REJECT_UNAUTHORIZED='0' JEXIA_DEV_DOMAIN='stag | com' E2E_PROJECT_ID='<project_id>' 
  E2E_EMAIL='<user_email>' E2E_PASSWORD='<user_password>' npm run test:e2e
```
