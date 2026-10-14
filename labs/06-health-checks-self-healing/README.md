# Lab 06: Kubernetes Health Checks & Self-Healing

## Objective

Learn how Kubernetes health probes work and how they help maintain application availability.

## Technologies

- Kubernetes
- Minikube
- kubectl
- Nginx
- YAML

## Kubernetes Probes

### 1. Liveness Probe

Checks whether the application is alive.

- Uses an HTTP GET request to `/` on port `80`.
- Runs every 10 seconds.
- After 3 consecutive failures, Kubernetes restarts the container.

### 2. Readiness Probe

Checks whether the application is ready to receive traffic.

- Uses an HTTP GET request to `/` on port `80`.
- Runs every 5 seconds.
- When the check fails, the Pod is marked as not ready and is excluded from normal Service traffic.

### 3. Startup Probe

Allows an application time to start before Kubernetes begins relying on the liveness and readiness probes.

- Uses an HTTP GET request to `/` on port `80`.
- Runs every 5 seconds.
- Allows up to 12 consecutive failures before startup is considered unsuccessful.

## Resource Requests and Limits

| Resource | Request | Limit |
|---|---:|---:|
| CPU | 50m | 200m |
| Memory | 32Mi | 64Mi |

## Kubernetes Resources

- `deployment.yaml`: Defines the Nginx Deployment, resource requests and limits, and all three probes.
- `service.yaml`: Exposes the application through a NodePort Service on port `30081`.

## Experiments Performed

1. Deployed Nginx using a Kubernetes Deployment manifest.
2. Added and verified the liveness probe.
3. Tested a failing liveness path and observed container restarts.
4. Added and verified the readiness probe.
5. Tested a failing readiness path and observed the Pod become not ready without readiness-triggered restarts.
6. Created a Service and inspected its Endpoints and EndpointSlice readiness conditions.
7. Added the startup probe and verified the Deployment configuration.

## Apply the Manifests

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Verify the Deployment

```bash
kubectl get deployments
kubectl get pods -l app=health-check-demo
kubectl describe deployment health-check-demo
kubectl get endpointslices -l kubernetes.io/service-name=health-check-service
```

## Key Takeaways

- Liveness probes help Kubernetes recover from an unhealthy container.
- Readiness probes control whether a Pod receives normal Service traffic.
- Startup probes protect slow-starting applications from premature liveness failures.
- Resource requests and limits help Kubernetes manage container resources.
