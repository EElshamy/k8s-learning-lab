# Lab 10 — Kubernetes Services & Networking

## Objectives

- Deploy two NGINX replicas.
- Expose Pods internally with a ClusterIP Service.
- Access the application with a NodePort Service.
- Inspect Service EndpointSlices.
- Verify that a mismatched selector results in no endpoints.

## Files

- `deployment.yaml` — NGINX Deployment with two replicas.
- `clusterip-service.yaml` — internal ClusterIP Service.
- `nodeport-service.yaml` — NodePort Service on port 30082.
- `selector-test.yaml` — test Service with a deliberately unmatched selector.

## 1. Deploy NGINX

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/nginx-networking
kubectl get pods -l app=nginx-networking -o wide
```

## 2. Test ClusterIP

```bash
kubectl apply -f clusterip-service.yaml
kubectl get service nginx-clusterip
kubectl get endpointslices -l kubernetes.io/service-name=nginx-clusterip
```

Test from inside the cluster:

```bash
kubectl run curl-test --image=curlimages/curl:latest --restart=Never --rm -i -- curl -sS http://nginx-clusterip
```

Expected result: the default NGINX welcome page HTML.

## 3. Test NodePort

```bash
kubectl apply -f nodeport-service.yaml
kubectl get service nginx-nodeport
```

This lab uses NodePort `30082` because `30080` was already allocated in the cluster.

On macOS with Minikube's Docker driver, the node IP may not be reachable directly from the host. Use a local Minikube service tunnel:

```bash
minikube service nginx-nodeport --url
```

Keep that terminal open and visit the URL printed by the command. The URL/port may change between runs.

## 4. Inspect EndpointSlices

```bash
kubectl get pods -l app=nginx-networking -o wide
kubectl get service nginx-clusterip nginx-nodeport
kubectl get endpointslices -l kubernetes.io/service-name=nginx-clusterip
```

The ClusterIP Service should have endpoints corresponding to the two NGINX Pods.

## 5. Test selector mismatch

```bash
kubectl apply -f selector-test.yaml
kubectl get endpointslices -l kubernetes.io/service-name=nginx-selector-test
```

The test Service is created, but its EndpointSlice has no endpoints because no Pod has the label `app: does-not-exist`.

## Service types

| Type | Purpose |
|---|---|
| ClusterIP | Internal cluster access; the default Service type |
| NodePort | Exposes a Service through a port on cluster nodes |
| LoadBalancer | Requests an external load balancer from a supporting environment/provider |

## Cleanup

Only run these commands if you want to remove the resources created by this lab. They target the named resources only.

```bash
kubectl delete service nginx-selector-test nginx-nodeport nginx-clusterip
kubectl delete deployment nginx-networking
```

## Key takeaways

- A Service provides a stable endpoint for a changing set of Pods.
- Labels and selectors determine which Pods receive Service traffic.
- EndpointSlices show the backend endpoints selected for a Service.
- Minikube networking on macOS can require `minikube service --url` instead of direct access to the node IP.
