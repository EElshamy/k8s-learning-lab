# Lab 04 — NestJS + Docker + Kubernetes

**Goal:** package a NestJS API into a container and deploy multiple replicas.

## Architecture

~~~mermaid
flowchart TD
  SRC["NestJS source"] --> IMG["Docker image"]
  IMG --> MK["Minikube image cache"]
  MK --> DEP["Deployment"]
  DEP --> RS["ReplicaSet"]
  RS --> P1["NestJS Pod 1"]
  RS --> P2["NestJS Pod 2"]
  CLIENT["Client"] --> SVC["Kubernetes Service"]
  SVC --> P1
  SVC --> P2
~~~

## Workflow

1. Build and test the image locally.
2. Load the image into Minikube.
3. Apply the Deployment and Service.
4. Verify Pod readiness and Service endpoints.
5. Access the application through Minikube.

## Build and test

~~~bash
docker build -t nestjs-k8s-app:v1 .
docker run --rm -p 3000:3000 nestjs-k8s-app:v1
~~~

In another terminal, test the route configured by the app, for example:

~~~bash
curl -i http://localhost:3000
~~~

Stop the local foreground container before proceeding.

## Deploy

~~~bash
minikube image load nestjs-k8s-app:v1
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods -l app=nestjs-k8s-app
kubectl get svc
kubectl get endpointslices
~~~

## Key concepts

- The image packages the runtime and application.
- The Deployment maintains the desired replica count.
- The Service routes traffic to Pods matching its selector.
- The application must listen on the expected container port, commonly on 0.0.0.0 inside the container.

## Troubleshooting

- Container exits: inspect kubectl logs for the Pod.
- Connection refused: check the app's listen address and port.
- No endpoints: compare Service selector with Pod labels.
