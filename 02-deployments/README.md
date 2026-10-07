# 02 - Deployment

A Deployment manages ReplicaSets and keeps the desired number of Pod replicas running.

## Create

```bash
kubectl apply -f deployment.yaml
```

## Check

```bash
kubectl get deployments
kubectl get replicasets
kubectl get pods -o wide
```

## Scale

```bash
kubectl scale deployment nginx-deployment --replicas=5
```

## Rollout

```bash
kubectl rollout status deployment/nginx-deployment
kubectl rollout history deployment/nginx-deployment
```

## Delete

```bash
kubectl delete -f deployment.yaml
```
