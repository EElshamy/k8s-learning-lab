# Lab 14 — Kubernetes StatefulSets

## Goal

Understand how StatefulSets provide stable Pod identities, stable per-Pod storage, and predictable DNS names.

## Prerequisites

- A running Minikube cluster.
- A `standard` StorageClass.
- `kubectl` configured for Minikube.

Check:

~~~bash
kubectl get nodes
kubectl get storageclass
~~~

## 1. Create a Headless Service

Apply the service:

~~~bash
kubectl apply -f service.yaml
kubectl get service web
~~~

The service uses `clusterIP: None`, so it is headless. It selects Pods labeled `app: web` and is referenced by the StatefulSet through `serviceName: web`.

## 2. Create the StatefulSet

~~~bash
kubectl apply -f statefulset.yaml
kubectl get pods -w
~~~

Wait until `web-0` and `web-1` are `Running` and ready. Press Ctrl+C to stop watching; this does not stop the Pods.

The StatefulSet creates ordered Pod names. Its `volumeClaimTemplates` creates a separate PVC for each Pod.

Expected names:

- Pods: `web-0`, `web-1`
- PVCs: `data-web-0`, `data-web-1`

## 3. Verify per-Pod data

~~~bash
kubectl exec web-0 -- cat /usr/share/nginx/html/index.html
kubectl exec web-1 -- cat /usr/share/nginx/html/index.html
kubectl get pvc
kubectl get pv
~~~

Expected file contents:

~~~text
Hello from web-0
Hello from web-1
~~~

Each container writes its hostname to a file on its own PVC.

## 4. Verify stable DNS identities

Create a temporary test Pod:

~~~bash
kubectl run dns-test --image=busybox:1.36 --restart=Never --command -- sleep 3600
kubectl get pod dns-test
~~~

Resolve the StatefulSet Pod names:

~~~bash
kubectl exec dns-test -- nslookup web-0.web.default.svc.cluster.local
kubectl exec dns-test -- nslookup web-1.web.default.svc.cluster.local
~~~

Each name should resolve to the IP address of its respective Pod. Pod IPs may change when recreated; the StatefulSet DNS identity remains stable.

## 5. Delete and recreate one Pod

Delete only `web-0`:

~~~bash
kubectl delete pod web-0
kubectl get pods -w
~~~

The StatefulSet controller should recreate `web-0`. Once it is ready, verify its file and PVC:

~~~bash
kubectl exec web-0 -- cat /usr/share/nginx/html/index.html
kubectl get pvc
kubectl describe pod web-0
~~~

Expected: `Hello from web-0` remains, and the recreated Pod uses `data-web-0` again.

## Key takeaways

- StatefulSet Pods have stable ordinal names such as `web-0` and `web-1`.
- A Headless Service provides DNS discovery for individual StatefulSet Pods.
- `volumeClaimTemplates` provisions a distinct PVC per Pod.
- Deleting a Pod does not normally delete the StatefulSet's PVC, so the replacement Pod can reuse the same storage.

## Cleanup (optional)

Remove only the temporary DNS test Pod when finished:

~~~bash
kubectl delete pod dns-test
~~~

To remove the lab workload later, delete the StatefulSet and Service deliberately. Review the PVCs and reclaim policy before deleting any PVC, because the dynamically provisioned volumes in this Minikube setup use the `Delete` reclaim policy. Do not delete unrelated resources from other labs.
