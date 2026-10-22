# Lab 09 — Namespaces & Resource Isolation

**Goal:** logically scope resources and enforce resource budgets in a namespace.

## Architecture

~~~mermaid
flowchart TD
  CL["Kubernetes Cluster"] --> NS1["default namespace"]
  CL --> NS2["lab-09 namespace"]
  NS2 --> DEP["NGINX Deployment"]
  DEP --> P1["Pod 1"]
  DEP --> P2["Pod 2"]
  NS2 --> RQ["ResourceQuota: namespace totals"]
  NS2 --> LR["LimitRange: container defaults and bounds"]
  RQ -. admission check .-> P1
  LR -. applies defaults .-> P1
~~~

## What each resource does

- **Namespace:** logical scope for namespaced resources.
- **ResourceQuota:** caps aggregate resource usage and/or object counts.
- **LimitRange:** sets default requests/limits and per-container minimum/maximum values.

## Apply

If lab-09 already exists, do not recreate it.

~~~bash
kubectl create namespace lab-09
kubectl apply -f deployment.yaml
kubectl apply -f resourcequota.yaml
kubectl apply -f limitrange.yaml
kubectl apply -f test-pod.yaml
kubectl apply -f quota-test.yaml
~~~

## Verify

~~~bash
kubectl get pods -n lab-09
kubectl describe resourcequota lab-09-quota -n lab-09
kubectl describe limitrange lab-09-limits -n lab-09
kubectl describe pod nginx-default-resources -n lab-09
kubectl get pods -n default
~~~

The Pod without explicit resource settings should receive the configured LimitRange defaults: CPU request 100m, memory request 64Mi, CPU limit 250m, and memory limit 128Mi.

## Test quota enforcement

~~~bash
kubectl apply -f quota-exceed-test.yaml
~~~

Expected: Kubernetes rejects the Pod with an exceeded quota message if the request would exceed the quota. This is a successful negative test.

## Important distinction

Namespaces provide logical scoping, not complete security isolation. Use RBAC for API authorization and NetworkPolicies with a supporting network plugin for network controls.

## Cleanup

Deleting the lab namespace deletes all namespaced resources inside it. Only run this if you intend to remove the entire lab:

~~~bash
kubectl delete namespace lab-09
~~~
