# Lab 01 — NGINX on Kubernetes

**Goal:** deploy NGINX and understand how Kubernetes manages Pods and exposes an application.

## Architecture

~~~mermaid
flowchart TD
  CMD["kubectl apply"] --> DEP["Deployment"]
  DEP --> RS["ReplicaSet"]
  RS --> P1["NGINX Pod 1"]
  RS --> P2["NGINX Pod 2"]
  CLIENT["Client"] --> SVC["Service"]
  SVC --> P1
  SVC --> P2
~~~

## Concepts

- **Pod:** smallest deployable unit; runs one or more containers.
- **Deployment:** declares desired state and manages rollout/replicas.
- **ReplicaSet:** keeps the requested number of Pods running.
- **Service:** stable endpoint for matching Pods.
- **Labels and selectors:** connect a Service to the correct Pods.

## Apply and inspect

~~~bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get pods -o wide
kubectl apply -f service.yaml
kubectl get services
kubectl get pods --show-labels
~~~

Use the resource names defined in the manifests when checking rollout status or endpoints.

## Expected result

The requested Pods become Running and the Service selects the Pods with matching labels.

## Troubleshooting

- **Pending:** inspect Pod Events with kubectl describe pod.
- **ImagePullBackOff:** check the image name, tag, and registry access.
- **No Service endpoints:** compare Service selector with Pod labels.
- **Application unreachable:** confirm Service ports and the local Minikube access method.

## Cleanup

Review the files, then delete only this lab's resources using the corresponding manifests.
