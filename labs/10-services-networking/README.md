# Lab 10 — Services & Networking

**Goal:** expose Pods through stable endpoints and understand how Services discover backend Pods.

## Traffic flow diagram

~~~mermaid
flowchart TD
  CLIENT["Client / curl Pod"] --> DNS["Kubernetes DNS"]
  DNS --> SVC["ClusterIP Service :80"]
  SVC --> EP["EndpointSlice"]
  EP --> P1["NGINX Pod 10.244.0.29:80"]
  EP --> P2["NGINX Pod 10.244.0.30:80"]
  HOST["Host browser"] --> NP["NodePort Service :30082"]
  NP --> P1
  NP --> P2
~~~

## How selectors work

~~~mermaid
flowchart LR
  LABEL["Pod label: app=nginx-networking"] --> MATCH{"Matches selector?"}
  SELECTOR["Service selector: app=nginx-networking"] --> MATCH
  MATCH -->|Yes| ENDPOINTS["EndpointSlice contains Pod IPs"]
  MATCH -->|No| EMPTY["No matching endpoints"]
~~~

## Service ports

| Field | Meaning |
|---|---|
| port | Port exposed by the Service |
| targetPort | Port on the selected Pod |
| nodePort | Port exposed on the node for a NodePort Service |

## Deploy

~~~bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/nginx-networking
kubectl apply -f clusterip-service.yaml
kubectl apply -f nodeport-service.yaml
kubectl get pods -l app=nginx-networking -o wide
kubectl get svc nginx-clusterip nginx-nodeport
kubectl get endpointslices -l kubernetes.io/service-name=nginx-clusterip
~~~

## Test ClusterIP from inside the cluster

~~~bash
kubectl run curl-test --image=curlimages/curl:latest --restart=Never --rm -i -- curl -sS http://nginx-clusterip
~~~

Expected: the NGINX welcome page. The temporary Pod is removed because --rm is used.

## Test NodePort on macOS

With Minikube's Docker driver on macOS, the node IP may not be reachable directly from the host. Use:

~~~bash
minikube service nginx-nodeport --url
~~~

Keep the command terminal open and visit the local URL it prints. The local port can change between runs.

## Selector mismatch test

~~~bash
kubectl apply -f selector-test.yaml
kubectl get endpointslices -l kubernetes.io/service-name=nginx-selector-test
~~~

Expected: the test Service exists but has no backend endpoints because its selector matches no Pods.

## Troubleshooting checklist

1. Are Service and Pods in the same namespace?
2. Does the selector exactly match the Pod labels?
3. Are the Pods Ready?
4. Does targetPort match the app's listening port?
5. Does the EndpointSlice list backend addresses?
6. Is the access method suitable for the Minikube driver?

## Cleanup

~~~bash
kubectl delete service nginx-selector-test nginx-nodeport nginx-clusterip
kubectl delete deployment nginx-networking
~~~
