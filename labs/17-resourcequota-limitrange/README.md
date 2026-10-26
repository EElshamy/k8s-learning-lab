# Lab 17 — ResourceQuota & LimitRange

## Objective

Learn how Kubernetes ResourceQuota and LimitRange control resource allocation within a namespace.

## Concepts Covered

- ResourceQuota: Limits total resource consumption across a namespace.
- LimitRange: Defines minimum, maximum, and default resources for containers.
- Default resource requests and limits.
- Rejecting Pods that exceed LimitRange constraints.
- Rejecting Pods that exceed ResourceQuota constraints.

## Namespace

`lab-17`

## ResourceQuota Configuration

File: `resourcequota.yaml`

| Resource | Maximum |
|---|---:|
| CPU Requests | 500m |
| Memory Requests | 512Mi |
| CPU Limits | 1 |
| Memory Limits | 1Gi |
| Pods | 5 |

## LimitRange Configuration

File: `limitrange.yaml`

| Resource | Minimum | Maximum | Default Request | Default Limit |
|---|---:|---:|---:|---:|
| CPU | 50m | 500m | 100m | 200m |
| Memory | 32Mi | 256Mi | 64Mi | 128Mi |

## Test 1 — Default Resources

File: `pod-defaults.yaml`

Created a Pod without explicitly specifying container resources.

Kubernetes automatically applied these defaults:

- CPU Request: `100m`
- Memory Request: `64Mi`
- CPU Limit: `200m`
- Memory Limit: `128Mi`

Result: Pod created successfully and reached `Running`.

## Test 2 — Exceeding LimitRange

File: `pod-exceed-limit.yaml`

Attempted to set the container memory limit to `512Mi`, exceeding the configured maximum of `256Mi`.

Result: Kubernetes rejected the Pod creation.

Error:

`maximum memory usage per Container is 256Mi, but limit is 512Mi`

## Test 3 — Exceeding ResourceQuota

File: `pod-exceed-quota.yaml`

The existing Pod used `100m` CPU requests. A second Pod requested `450m`, which would increase the namespace total to `550m`, exceeding the quota of `500m`.

Result: Kubernetes rejected the Pod creation because `requests.cpu` would exceed the namespace quota.

## Verification

```bash
kubectl get pods -n lab-17
kubectl describe resourcequota lab-quota -n lab-17
kubectl describe limitrange lab-limits -n lab-17
```

Final observed state:

- `defaults-demo`: Running
- CPU requests used: `100m / 500m`
- Memory requests used: `64Mi / 512Mi`
- CPU limits used: `200m / 1`
- Memory limits used: `128Mi / 1Gi`
- Pods used: `1 / 5`

## Key Takeaways

- ResourceQuota controls aggregate resource usage at the namespace level.
- LimitRange controls resource settings for individual containers.
- LimitRange can inject default requests and limits when they are omitted.
- Kubernetes admission checks reject Pods that violate either policy.
