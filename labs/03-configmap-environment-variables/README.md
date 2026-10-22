# Lab 03 — ConfigMaps & Environment Variables

**Goal:** separate non-sensitive application configuration from the container image.

## Architecture

~~~mermaid
flowchart TD
  CM["ConfigMap: key/value settings"] -->|"env / envFrom"| POD["Application Pod"]
  DEP["Deployment"] --> POD
  POD --> APP["Application reads environment"]
~~~

## Why ConfigMaps?

Without a ConfigMap, configuration is often hard-coded into an image or manifest. A ConfigMap lets you keep settings such as feature flags and non-sensitive URLs separate from application code.

## Apply and inspect

~~~bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl get configmaps
kubectl describe configmap <configmap-name>
kubectl get pods
~~~

Check the variable names in your Deployment manifest. To inspect the environment in a specific Pod:

~~~bash
kubectl exec <pod-name> -- printenv
~~~

Avoid printing credentials or other sensitive values into terminal logs.

## ConfigMap vs Secret

| Resource | Use it for |
|---|---|
| ConfigMap | Non-sensitive settings |
| Secret | Passwords, tokens, and other sensitive values |

Environment variables are populated when a container starts. If a ConfigMap value changes, an existing container's environment does not automatically change; restart or roll out the workload when needed.

## Troubleshooting

- Missing variable: check key names and the env/envFrom reference.
- ConfigMap not found: the Pod and ConfigMap must be in the same namespace.
- Updated value not visible: restart/roll out the workload if using environment variables.
