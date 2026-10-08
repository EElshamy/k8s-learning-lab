# Lab 04 — NestJS + Docker + Kubernetes

This lab deploys a NestJS application to Kubernetes using a custom Docker image.

## Architecture

```
NestJS source code
       ↓
   Dockerfile
       ↓
Docker image: nestjs-k8s-app:v1
       ↓
     Minikube
       ↓
   Deployment
       ↓
   2 Pods
       ↓
    Service
       ↓
   Browser
```

## What I learned

- Create and run a NestJS application locally
- Containerize NestJS with Docker
- Build a custom Docker image
- Run the image as a Docker container
- Load a local Docker image into Minikube
- Create a Kubernetes Deployment
- Run multiple NestJS Pods with replicas
- Use labels and selectors
- Create a Kubernetes NodePort Service
- Route traffic from the Service to the NestJS Pods
- Test the application through Minikube

## Docker

Build the image:

```bash
docker build -t nestjs-k8s-app:v1 .
```

Run locally:

```bash
docker run -d \
  --name nestjs-k8s-test \
  -p 3000:3000 \
  nestjs-k8s-app:v1
```

Test:

```bash
curl http://localhost:3000
```

Clean up:

```bash
docker stop nestjs-k8s-test
docker rm nestjs-k8s-test
```

## Minikube

Load the image:

```bash
minikube image load nestjs-k8s-app:v1
minikube image ls | grep nestjs-k8s-app
```

## Kubernetes Deployment

Apply:

```bash
kubectl apply -f deployment.yaml
```

Check the Deployment:

```bash
kubectl get deployment
```

Check the Pods:

```bash
kubectl get pods -l app=nestjs-k8s-app
```

The Deployment runs two Pods.

## Kubernetes Service

Apply:

```bash
kubectl apply -f service.yaml
```

Check the Service:

```bash
kubectl get svc nestjs-service
```

Check the endpoints:

```bash
kubectl get endpoints nestjs-service
```

Open the application:

```bash
minikube service nestjs-service
```

The application should return:

```
Hello World!
```

## Important Concepts

### Deployment

The Deployment manages the desired number of NestJS Pods.

### Pods

The Pods run the NestJS Docker container.

### Service

The Service provides a stable network endpoint and sends traffic to Pods matching:

```yaml
selector:
  app: nestjs-k8s-app
```

### NodePort

NodePort exposes the Service outside the Kubernetes cluster. Minikube provides a local URL/tunnel when using:

```bash
minikube service nestjs-service
```
