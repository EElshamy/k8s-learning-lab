# Lab 16 — Resource Requests, Limits & QoS

## Objectives

- Understand CPU and memory requests versus limits.
- Configure resources on a Deployment.
- Identify Kubernetes QoS classes: Guaranteed, Burstable, and BestEffort.
- Reproduce an `OOMKilled` container and verify how a larger memory limit changes the result.

## Files

- `deployment.yaml` — two-replica NGINX Deployment with resource requests and limits.
- `qos-demo.yaml` — three Pods demonstrating each QoS class.
- `oom-demo.yaml` — memory stress test; the committed version uses a 100Mi limit so it can run successfully.

## 1. Requests and limits

Apply the Deployment:

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/resource-demo
kubectl get pods -l app=resource-demo -o wide
kubectl describe deployment resource-demo
```

The NGINX container requests `100m` CPU and `64Mi` memory. Its limits are `200m` CPU and `128Mi` memory.

- **Request**: used by the scheduler when deciding whether a Node has enough allocatable resources for a Pod.
- **CPU limit**: CPU use is throttled when the container reaches its limit.
- **Memory limit**: exceeding the limit can result in the container being killed for out-of-memory (OOM).

The Deployment has two replicas, so its total requested resources are `200m` CPU and `128Mi` memory; its aggregate limits are `400m` CPU and `256Mi` memory.

## 2. QoS classes

Apply the example Pods:

```bash
kubectl apply -f qos-demo.yaml
kubectl get pods qos-guaranteed qos-burstable qos-besteffort \
  -o custom-columns='NAME:.metadata.name,QOS:.status.qosClass'
```

Expected classes:

| Pod | QoS class | Configuration |
|---|---|---|
| `qos-guaranteed` | `Guaranteed` | Every container has CPU and memory requests equal to their limits. |
| `qos-burstable` | `Burstable` | Resource requests/limits are configured, but the Guaranteed conditions are not met. |
| `qos-besteffort` | `BestEffort` | No container has CPU or memory requests or limits. |

QoS class influences eviction priority when a Node experiences resource pressure; it does not replace setting appropriate resource values.

## 3. Reproduce OOMKilled

The final `oom-demo.yaml` uses a 100Mi memory limit so the 50M stress allocation can run in this lab environment:

```bash
kubectl apply -f oom-demo.yaml
kubectl get pod oom-demo -w
kubectl describe pod oom-demo
```

To reproduce the failure, edit `oom-demo.yaml` and temporarily change:

```yaml
limits:
  memory: "100Mi"
```

to:

```yaml
limits:
  memory: "20Mi"
```

Recreate the Pod and observe the status:

```bash
kubectl delete pod oom-demo
kubectl apply -f oom-demo.yaml
kubectl get pod oom-demo -w
kubectl describe pod oom-demo
```

With the 20Mi limit, the stress process tries to allocate 50M and the container was observed to terminate with `Reason: OOMKilled` and exit code `137`. Kubernetes restarts the container because the Pod uses the default `restartPolicy: Always`, and repeated failures can lead to `CrashLoopBackOff`.

Restore `memory: "100Mi"`, then recreate the Pod again. In this lab, the Pod reached `Running` with zero restarts.

## 4. Verification commands

```bash
kubectl get pods -o wide
kubectl get pods -o custom-columns='NAME:.metadata.name,QOS:.status.qosClass'
kubectl describe deployment resource-demo
kubectl describe pod oom-demo
```

If metrics-server is enabled, resource usage can also be inspected with `kubectl top pods`. Metrics are not required for the requests/limits and QoS exercises.

## 5. Cleanup

Remove only the lab resources created by these manifests:

```bash
kubectl delete -f oom-demo.yaml --ignore-not-found
kubectl delete -f qos-demo.yaml --ignore-not-found
kubectl delete -f deployment.yaml --ignore-not-found
```

## Key takeaways

- Requests help Kubernetes schedule Pods; limits constrain container resource usage.
- CPU limit enforcement generally throttles CPU, while memory-limit breaches can cause OOM termination.
- QoS classes are `Guaranteed`, `Burstable`, and `BestEffort`.
- Verify actual Pod status and container termination reason rather than assuming a failure mode.
