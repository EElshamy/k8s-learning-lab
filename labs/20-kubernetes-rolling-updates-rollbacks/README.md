# Lab 20: Kubernetes Rolling Updates & Rollbacks

## Objectives

- Deploy an NGINX Deployment with three replicas.
- Configure RollingUpdate behavior with `maxSurge: 1` and `maxUnavailable: 0`.
- Update the NGINX image and watch the rollout.
- Verify the new ReplicaSet and Pods.
- Roll back to the previous Deployment revision and verify the image version.

## Environment

- Cluster: Minikube
- Namespace: `lab-20`

## Files

- `namespace.yaml` — creates the isolated namespace.
- `deployment.yaml` — creates the initial Deployment using `nginx:1.26`.

## 1. Create namespace and Deployment

```bash
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl rollout status deployment/rolling-demo -n lab-20
kubectl get deployment,pods -n lab-20
```

The initial Deployment has three ready Pods running `nginx:1.26`.

## 2. Perform a Rolling Update

Update the container image to `nginx:1.28`:

```bash
kubectl set image deployment/rolling-demo nginx=nginx:1.28 -n lab-20
kubectl rollout status deployment/rolling-demo -n lab-20
kubectl get deployment,rs,pods -n lab-20
kubectl get deployment rolling-demo -n lab-20 -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

Observed result: the Deployment reached `3/3` ready replicas, and the new ReplicaSet had three ready Pods while the old ReplicaSet was scaled to zero.

## 3. Roll back to the previous revision

Review revision history and undo the latest rollout:

```bash
kubectl rollout history deployment/rolling-demo -n lab-20
kubectl rollout undo deployment/rolling-demo -n lab-20
kubectl rollout status deployment/rolling-demo -n lab-20
kubectl get deployment rolling-demo -n lab-20 -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

Observed result: rollout completed successfully and the image returned to `nginx:1.26`.

## Key concepts

- A Deployment creates and manages ReplicaSets.
- A RollingUpdate replaces old Pods progressively with new Pods.
- `maxSurge: 1` permits one extra Pod above the desired replica count during an update.
- `maxUnavailable: 0` requests that no desired replicas be unavailable during the rollout, provided new Pods can become ready and cluster capacity is available.
- `kubectl rollout undo` rolls back to a previous Deployment revision.
- `kubectl rollout status` waits for rollout completion.

## Note about the rollback warning

The command may warn that `kubectl rollout undo` does not update the `kubectl.kubernetes.io/last-applied-configuration` annotation. The rollback can still succeed; be mindful of this annotation if you later apply a manifest that differs from the rolled-back live configuration.

## Cleanup

Delete only the resources created for this lab:

```bash
kubectl delete namespace lab-20
```

This removes the lab resources from the cluster, not the local files.
