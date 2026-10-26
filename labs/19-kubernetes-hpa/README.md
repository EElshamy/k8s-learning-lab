# Lab 19: Kubernetes Horizontal Pod Autoscaler (HPA)

## Objectives

- Deploy an NGINX workload with CPU and memory requests and limits.
- Configure a HorizontalPodAutoscaler targeting 50% average CPU utilization.
- Generate CPU load and observe automatic scale-up.
- Stop the load and observe scale-down.
- Verify the final replica count and HPA configuration.

## Environment

- Kubernetes: Minikube v1.37.0
- Namespace: `lab-19`
- Metrics Server: installed and reporting node/pod metrics

## Files

- `namespace.yaml` — creates the isolated namespace.
- `deployment.yaml` — deploys NGINX with resource requests and limits.
- `hpa.yaml` — scales the Deployment from 1 to 5 replicas based on CPU.

## 1. Verify cluster metrics

```bash
kubectl get nodes
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
```

The Metrics Server must be ready and CPU metrics must be available for HPA to calculate resource utilization.

## 2. Create the namespace and Deployment

```bash
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl get deployment,pods -n lab-19
```

The Deployment uses a CPU request of `100m` and a CPU limit of `500m`. CPU utilization for HPA is calculated relative to the CPU request.

## 3. Configure HPA

```bash
kubectl apply -f hpa.yaml
kubectl get hpa -n lab-19
kubectl describe hpa hpa-demo -n lab-19
```

The HPA configuration targets 50% average CPU utilization, with a minimum of 1 replica and a maximum of 5 replicas.

## 4. Generate load

A lightweight HTTP loop against NGINX may not create enough CPU load in the target workload. For this lab, CPU load was generated inside the NGINX container:

```bash
kubectl exec -n lab-19 deployment/hpa-demo -- sh -c 'while true; do :; done'
```

Keep that command running in one terminal. In another terminal, watch the HPA:

```bash
kubectl get hpa -n lab-19 -w
```

The HPA target increased above 50%, and the Deployment scaled up automatically. During the experiment, the HPA maximum was temporarily raised to 20, and the workload scaled from 1 to 11 replicas under high CPU utilization.

## 5. Stop the load and observe scale-down

Stop the CPU loop with Ctrl+C. If a Pod continues to consume CPU because the loop was started inside it, delete that specific Pod; the Deployment will replace it with a fresh Pod without the loop. Confirm metrics:

```bash
kubectl top pods -n lab-19
kubectl get hpa -n lab-19
```

The workload scaled down from 11 replicas to 2 and then to 1 after CPU utilization returned to 0%. Scale-down can take several minutes due to the HPA stabilization window.

## 6. Final configuration and verification

The final `hpa.yaml` sets `maxReplicas: 5`. Apply it and verify:

```bash
kubectl apply -f hpa.yaml
kubectl get hpa -n lab-19
kubectl get deployment hpa-demo -n lab-19
```

Observed final state:

- HPA target: `0% / 50%`
- Minimum replicas: `1`
- Maximum replicas: `5`
- Deployment replicas: `1`
- Deployment readiness: `1/1`

## Key concepts

- HPA changes the replica count of a scalable workload based on observed metrics.
- Resource requests are required to calculate CPU utilization percentages for containers.
- Metrics Server supplies the resource metrics used by HPA.
- Scale-up and scale-down are asynchronous; scale-down is also affected by stabilization behavior.
- An HPA does not resize a Pod's CPU or memory. It changes the number of workload replicas.

## Cleanup

When finished with the lab, remove only its namespace:

```bash
kubectl delete namespace lab-19
```

This deletes the lab resources from the cluster but does not delete the local lab files.
