# Lab 07 — Kubernetes Secrets & Security

**Goal:** provide sensitive configuration to a workload while reducing accidental exposure.

## Secret delivery flow

~~~mermaid
flowchart TD
  OP["Operator creates Secret"] --> API["Kubernetes API"]
  API --> POD["Pod references Secret"]
  POD --> ENV["Environment variable or mounted file"]
  ENV --> APP["Application reads credential"]
  RBAC["RBAC permissions"] -. limits access .-> API
~~~

## Key concepts

- A Secret stores sensitive values such as passwords and tokens.
- A Pod references a Secret by name and key.
- RBAC should limit who can read or modify Secret objects.
- Base64 encoding is not encryption.
- Never commit real credentials or print them into logs.

## Apply and inspect

Review the actual filenames in this directory and use only lab/test credentials.

~~~bash
kubectl apply -f <secret-manifest>.yaml
kubectl apply -f deployment.yaml
kubectl get secrets
kubectl describe pod <pod-name>
~~~

Avoid dumping Secret data with commands such as kubectl get secret -o yaml in shared or recorded terminals.

## ConfigMap vs Secret

| ConfigMap | Secret |
|---|---|
| Non-sensitive settings | Sensitive values |
| No confidentiality guarantee | Requires careful access controls and encryption-at-rest configuration |

## Security checklist

- Keep real values out of Git; commit templates only.
- Restrict Secret access using least-privilege RBAC.
- Enable encryption at rest where supported.
- Rotate credentials and consider an external secrets manager for production.

## Troubleshooting

- Secret not found: confirm its name and namespace.
- Missing environment value: check the key name and Pod reference.
- Do not paste production credentials into chat or commit them to source control.
