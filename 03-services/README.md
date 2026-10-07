# 03 - Service

A Service provides a stable network endpoint for a set of Pods selected by labels.

## Create

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Check

```bash
kubectl get svc
kubectl get endpoints
```

## Test

```bash
kubectl port-forward service/nginx-service 8080:80
```

Then open `http://localhost:8080`.

## Service Type

This lab uses `ClusterIP`, the default internal Kubernetes Service type.
