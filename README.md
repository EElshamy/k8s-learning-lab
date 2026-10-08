# Kubernetes Learning Lab

Hands-on Kubernetes learning repository.

This repository documents my Kubernetes journey with practical manifests, commands, and notes that I can run locally with Minikube and kubectl.

## Current Topics

- [x] Pods
- [x] Deployments
- [x] Services
- [x] ConfigMaps
- [x] Ingress
- [x] Storage

## Environment

- Kubernetes
- kubectl
- Minikube
- Docker
- macOS

## Learning Path

```text
Pod
  ↓
Deployment
  ↓
Service
  ↓
ConfigMap
  ↓
Ingress
  ↓
Storage
  ↓
Secrets
  ↓
Requests & Limits
  ↓
Health Probes
  ↓
Namespaces
  ↓
HPA
  ↓
RBAC
  ↓
StatefulSet
  ↓
DaemonSet
  ↓
Monitoring
```

## Labs

### Lab 01 — Nginx on Kubernetes
- Deployment
- Pods and replicas
- Service / NodePort
- Labels and selectors
- Self-healing

### Lab 02 — Docker + Kubernetes Static Website
- Dockerfile
- Custom Docker image
- Minikube image loading
- Kubernetes Deployment
- Service / NodePort
- Rolling update and rollback

## Repository Structure

```text
k8s-learning-lab/
├── labs/
│   ├── 01-nginx-kubernetes/
│   └── 02-docker-kubernetes-static-website/
├── 01-pods/
├── 02-deployments/
├── 03-services/
├── 04-configmaps/
├── 05-ingress/
└── 06-storage/
```


```text
k8s-learning-lab/
├── 01-pods/
├── 02-deployments/
├── 03-services/
├── 04-configmaps/
├── 05-ingress/
└── 06-storage/
```

## Basic Commands

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get ingress
kubectl get pvc

kubectl apply -f <file>.yaml
kubectl delete -f <file>.yaml
```

## Goal

Build a practical Kubernetes reference from fundamentals to production-oriented concepts, with every topic backed by a working lab.
