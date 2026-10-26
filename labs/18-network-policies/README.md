# Lab 18: Kubernetes NetworkPolicies

## Objectives

- Understand how Kubernetes NetworkPolicies control Pod traffic.
- Create a backend Service and verify baseline connectivity.
- Deny ingress traffic to backend Pods.
- Allow ingress only from frontend Pods on TCP port 80.
- Verify that an unauthorized Pod cannot connect.

## Environment

- Kubernetes: v1.37.0
- Cluster: Minikube
- Namespace: `lab-18`

## Files

- `namespace.yaml` — creates the lab namespace.
- `pods.yaml` — creates frontend and backend NGINX Pods.
- `backend-service.yaml` — exposes the backend Pod internally.
- `deny-backend.yaml` — denies all ingress traffic to backend Pods.
- `allow-frontend.yaml` — allows frontend Pods to reach backend on TCP/80.
- `unauthorized-pod.yaml` — creates a Pod used to test denied access.

## Run the lab

Apply the namespace and workloads:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f pods.yaml
kubectl apply -f backend-service.yaml
kubectl get pods,svc,endpoints -n lab-18
```

Verify baseline connectivity before applying policies:

```bash
kubectl exec -n lab-18 frontend -- curl --connect-timeout 5 -sS -o /dev/null -w 'HTTP %{http_code}\n' http://backend
```

Expected: `HTTP 200`.

Apply the deny-all ingress policy to the backend:

```bash
kubectl apply -f deny-backend.yaml
```

Test again from the frontend. The request should time out because no ingress traffic is allowed by this policy:

```bash
kubectl exec -n lab-18 frontend -- curl --connect-timeout 5 -sS -o /dev/null -w 'HTTP %{http_code}\n' http://backend
```

Apply the policy that allows only Pods labeled `app: frontend` to connect to backend TCP/80:

```bash
kubectl apply -f allow-frontend.yaml
```

Retest from frontend. Expected: `HTTP 200`.

Finally, create and test an unauthorized Pod:

```bash
kubectl apply -f unauthorized-pod.yaml
kubectl wait --for=condition=Ready pod/unauthorized -n lab-18 --timeout=90s
kubectl exec -n lab-18 unauthorized -- curl --connect-timeout 5 -sS -o /dev/null -w 'HTTP %{http_code}\n' http://backend
```

Expected: timeout / `HTTP 000`.

## Observed results

| Test | Result |
| --- | --- |
| Frontend → backend before policies | `HTTP 200` |
| Frontend → backend after deny ingress | Connection timed out; `HTTP 000` |
| Frontend → backend after allow policy | `HTTP 200` |
| Unauthorized Pod → backend | Connection timed out; `HTTP 000` |

These tests confirmed that NetworkPolicy enforcement is active in the lab cluster.

## Key concepts

- A NetworkPolicy selects Pods using labels.
- A policy with `policyTypes: [Ingress]` controls inbound traffic to selected Pods.
- An empty `ingress: []` list denies all ingress traffic to the selected Pods.
- Multiple NetworkPolicies are additive: the allow policy grants the matching frontend traffic while the backend remains isolated from other ingress sources.
- NetworkPolicy enforcement depends on the cluster's network plugin; validating traffic is essential.

## Cleanup

Delete the lab resources when finished:

```bash
kubectl delete namespace lab-18
```
