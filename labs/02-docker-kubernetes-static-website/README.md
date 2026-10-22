# Lab 02 — Docker + Kubernetes Static Website

**Goal:** package a static website into a custom NGINX image and run it in Kubernetes.

## Architecture

~~~mermaid
flowchart LR
  HTML["index.html"] --> BUILD["docker build"]
  DF["Dockerfile"] --> BUILD
  BUILD --> IMG["Custom image"]
  IMG --> LOAD["Load image into Minikube"]
  LOAD --> DEP["Deployment"]
  DEP --> P1["Pod 1"]
  DEP --> P2["Pod 2"]
  SVC["Service"] --> P1
  SVC --> P2
  CLIENT["Browser"] --> SVC
~~~

## What happens?

1. The Dockerfile copies website files into the web-server image.
2. Docker builds a versioned image.
3. Minikube receives the image so the node can use it.
4. A Deployment creates Pods from that image.
5. A Service routes requests to the Pods.

## Build and deploy

~~~bash
docker build -t k8s-project-02:v1 .
minikube image load k8s-project-02:v1
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods -o wide
kubectl get services
minikube service <service-name>
~~~

Use the exact Service name in service.yaml. With the Docker driver on macOS, the command may provide a local URL or tunnel.

## Image updates

For a new website version, build a new image tag, load it into Minikube, update the Deployment image, and verify the rollout. Versioned tags make rollbacks easier.

## Troubleshooting

- Old content: confirm you rebuilt and loaded the image and updated the Deployment tag.
- ImagePullBackOff: inspect image name, tag, and imagePullPolicy.
- No endpoints: check labels and selectors.
