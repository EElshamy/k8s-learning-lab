# Lab 06 — Health Checks & Self-Healing

**Goal:** use Kubernetes probes to detect startup, health, and readiness conditions.

## Probe decision diagram

~~~mermaid
flowchart TD
  START["Container starts"] --> SP{"Startup probe?"}
  SP -- Yes --> WAIT["Wait until startup succeeds"]
  SP -- No --> LIVE["Liveness checks"]
  WAIT --> LIVE
  LIVE -->|"Repeated failures"| RESTART["Restart container"]
  LIVE --> READY["Readiness checks"]
  READY -->|"Success"| TRAFFIC["Eligible for Service traffic"]
  READY -->|"Failure"| OUT["Not ready; removed from normal Service traffic"]
~~~

## Probe types

| Probe | What it asks | Effect of repeated failure |
|---|---|---|
| Startup | Has the app started? | Keeps checking during startup; can eventually restart the container |
| Liveness | Is the app alive? | Container is restarted |
| Readiness | Can the app receive traffic? | Pod is marked not ready |

Readiness failure does not itself restart a container. A startup probe can protect slow-starting applications from premature liveness failures.

## Apply and inspect

~~~bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl describe pod <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp
~~~

Inspect the Pod Events for probe failures, restarts, and readiness changes.

## Observe self-healing

In this lab only, delete a Pod managed by the lab Deployment and watch the replacement:

~~~bash
kubectl delete pod <lab-pod-name>
kubectl get pods -w
~~~

Do not delete unrelated Pods from other labs.

## Troubleshooting

- Repeated restarts: inspect kubectl logs <pod-name> --previous.
- Readiness fails: verify HTTP path, port, and application startup.
- Slow startup: tune initial delays and startup probe thresholds.
