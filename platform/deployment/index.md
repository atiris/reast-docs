# Deployment

## Environments

| Environment | Domain         | Purpose           | Branch |
| ----------- | -------------- | ----------------- | ------ |
| `dev`       | localhost:999x | Local development | any    |
| `test`      | test.reast.app | Staging / QA      | main   |
| `prod`      | reast.app      | Production        | tags   |

## Deployment Process

1. Push to `main` → GitHub Actions builds containers
2. Runner on the target server pulls and restarts via `deploy/auto-deploy.sh`
3. Health checks confirm all services respond

## Security Checklist

- [ ] All secrets in `.env` (never committed)
- [ ] HTTPS everywhere (Caddy auto-TLS)
- [ ] Keycloak realm exported without secrets
- [ ] PostgreSQL only accessible from internal network
- [ ] SeaweedFS S3 credentials rotated per environment
- [ ] CSP headers configured in Caddy and nginx
- [ ] Rate limiting enabled on API (ThrottlerModule)
- [ ] Service Worker served over HTTPS only

## Compose Files

| File                                | Purpose                           |
| ----------------------------------- | --------------------------------- |
| `config/dev/compose.yaml`           | Local development stack           |
| `deploy/compose.test.yaml`          | Test/staging deployment           |
| `deploy/compose.prod.yaml`          | Production deployment             |
| `deploy/runner/compose.runner.yaml` | GitHub Actions self-hosted runner |
