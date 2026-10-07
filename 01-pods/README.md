# 01 - Pod

A Pod is the smallest deployable unit in Kubernetes.

## Create

```bash
kubectl apply -f pod.yaml
```

## Check

```bash
kubectl get pods
kubectl describe pod nginx-pod
kubectl logs nginx-pod
```

## Test

```bash
kubectl port-forward pod/nginx-pod 8080:80
```

Then open `http://localhost:8080`.

## Delete

```bash
kubectl delete -f pod.yaml
```
