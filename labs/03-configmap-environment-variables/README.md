# Lab 03 — ConfigMap + Environment Variables

This lab demonstrates how Kubernetes ConfigMaps can provide application configuration to Pods as environment variables.

## What I learned

- Creating and using a ConfigMap
- Using `envFrom` with `configMapRef` to load all ConfigMap keys
- Using `env` with `configMapKeyRef` to load a specific key
- Updating a ConfigMap
- Restarting a Deployment so new Pods receive updated environment variables
- Separating application configuration from the container image

## Files

- `configmap.yaml` — defines the application configuration
- `deployment.yaml` — runs two BusyBox Pods and injects `APP_NAME` from the ConfigMap

## Commands used

```bash
kubectl apply -f configmap.yaml
kubectl get configmaps
kubectl describe configmap app-config

kubectl apply -f deployment.yaml
kubectl get pods -l app=config-demo

kubectl exec <pod-name> -- env | grep APP_

kubectl rollout restart deployment config-demo
kubectl rollout status deployment/config-demo
```

## envFrom vs configMapKeyRef

### envFrom

Loads all keys from the referenced ConfigMap:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

### env + configMapKeyRef

Loads only the selected key:

```yaml
env:
  - name: APP_NAME
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_NAME
```

## Important note

Changing a ConfigMap does not automatically change environment variables inside already-running Pods. The Pods need to be recreated/restarted to receive the new values.
