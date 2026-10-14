# Lab 07 — Kubernetes Secrets & Security

## Goals

- Create a Kubernetes Secret from a YAML manifest.
- Inject Secret keys into a Pod as environment variables.
- Verify that values are available without printing the secret values.
- Observe what happens when a Pod references a Secret that does not exist.
- Keep local secret manifests out of Git.

## Files

- `.gitignore`: excludes the local `secret.yaml` and environment files.
- `secret.example.yaml`: safe template only; replace the placeholder values locally before applying.
- `pod.yaml`: reads `DB_USERNAME` and `DB_PASSWORD` from the `app-secret` Secret.

## Practice

Create a local `secret.yaml` based on `secret.example.yaml`, then use lab-only values:

```bash
kubectl apply -f secret.yaml
kubectl describe secret app-secret
kubectl apply -f pod.yaml
kubectl get pod secret-demo-pod
```

Verify that the environment variables exist without printing their contents:

```bash
kubectl exec secret-demo-pod -- sh -c '
  test -n "$DB_USERNAME" &&
  test -n "$DB_PASSWORD" &&
  echo "DB_USERNAME: configured" &&
  echo "DB_PASSWORD: configured"
'
```

To observe a missing-Secret failure, create a temporary Pod manifest that references a non-existent Secret and inspect it with:

```bash
kubectl get pod <pod-name>
kubectl describe pod <pod-name>
```

The Pod may show `CreateContainerConfigError` with an event stating that the Secret was not found. Correct the Secret reference and recreate the Pod; most Pod spec fields cannot be changed in place.

## Security notes

- Kubernetes Secret values are not automatically encrypted just because the resource is a Secret. Base64 is encoding, not encryption.
- Do not commit real passwords, API keys, or local Secret manifests. This repository includes only a placeholder template.
- Restrict access with least-privilege RBAC. For production, configure encryption at rest and consider an external secret manager.
- Avoid printing secret values in terminal output or application logs.
