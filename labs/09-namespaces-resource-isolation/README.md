# Lab 09 — Kubernetes Namespaces & Resource Isolation

## Objectives

- Create a dedicated namespace for lab resources.
- Deploy an NGINX application in that namespace.
- Apply a ResourceQuota to cap aggregate namespace resource usage.
- Apply a LimitRange to set default and permitted per-container resources.
- Verify namespace scoping and test quota enforcement.

## Files

- `deployment.yaml` — NGINX Deployment with two replicas and explicit resources.
- `resourcequota.yaml` — aggregate namespace quota.
- `limitrange.yaml` — default, minimum, and maximum container resources.
- `test-pod.yaml` — Pod without explicit resources to test LimitRange defaults.
- `quota-test.yaml` — additional Pod with explicit resources.
- `quota-exceed-test.yaml` — deliberate quota-exceed test; expected to be rejected.

## Run the lab

Create the namespace:

```bash
kubectl create namespace lab-09
```

Apply the resources:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f resourcequota.yaml
kubectl apply -f limitrange.yaml
kubectl apply -f test-pod.yaml
kubectl apply -f quota-test.yaml
```

Inspect the resources:

```bash
kubectl get all -n lab-09
kubectl describe resourcequota lab-09-quota -n lab-09
kubectl describe limitrange lab-09-limits -n lab-09
kubectl describe pod nginx-default-resources -n lab-09
```

## ResourceQuota test

Apply the deliberate exceed-test:

```bash
kubectl apply -f quota-exceed-test.yaml
```

Expected result: Kubernetes rejects the Pod with a `Forbidden` / `exceeded quota` message when its resource requests or limits would exceed the namespace's remaining quota. This rejection is the expected outcome of the test, not an application failure.

## LimitRange test

The Pod in `test-pod.yaml` does not specify resources. The LimitRange should assign these defaults:

| Resource | Default |
|---|---:|
| CPU request | 100m |
| Memory request | 64Mi |
| CPU limit | 250m |
| Memory limit | 128Mi |

Verify with:

```bash
kubectl describe pod nginx-default-resources -n lab-09
```

## Namespace isolation check

```bash
kubectl get pods -n default
kubectl get pods -n lab-09
```

Pods created in `lab-09` appear in that namespace and are not listed by a query scoped to `default`.

## Cleanup

Only run this if you want to remove all resources created for this lab:

```bash
kubectl delete namespace lab-09
```

**Warning:** deleting the namespace deletes all resources inside it.

## Key takeaways

- Namespaces provide logical scoping for Kubernetes resources.
- ResourceQuota limits aggregate resource consumption within a namespace.
- LimitRange can assign defaults and enforce per-container resource bounds.
- RBAC and NetworkPolicies provide additional controls; a namespace alone is not a complete security boundary.
