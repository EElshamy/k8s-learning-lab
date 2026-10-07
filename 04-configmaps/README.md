# 04 - ConfigMap

A ConfigMap stores non-sensitive configuration that can be consumed by Pods.

## Create

```bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
```

## Check

```bash
kubectl get configmap
kubectl describe configmap app-config
kubectl exec deploy/configmap-demo -- printenv | grep APP_
```

## Important

Do not store passwords, tokens, or other sensitive values in a ConfigMap. Use a Secret for sensitive data.
