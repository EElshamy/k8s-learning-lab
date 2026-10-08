# Lab 02 — Docker + Kubernetes Static Website

Build a custom Nginx Docker image and deploy it to Kubernetes with Minikube.

## Flow

```text
HTML
  ↓
Dockerfile
  ↓
Docker Image
  ↓
Minikube
  ↓
Kubernetes Deployment
  ↓
Pods
  ↓
Service
  ↓
Website
```

## Build

```bash
docker build -t k8s-project-02:v1 .
minikube image load k8s-project-02:v1
```

## Deploy

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods -l app=k8s-project-02
minikube service k8s-project-02-service
```
