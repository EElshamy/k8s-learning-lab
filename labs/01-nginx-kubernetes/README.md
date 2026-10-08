# Lab 01 — Nginx on Kubernetes

Beginner Kubernetes lab using Minikube.

## Topics
- Deployment
- Pods
- Replicas
- Service
- NodePort
- Labels and selectors
- Self-healing

## Run

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods -l app=nginx
kubectl get svc nginx-service
minikube service nginx-service
```
