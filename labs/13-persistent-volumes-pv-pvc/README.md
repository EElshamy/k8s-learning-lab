# Lab 13 — Persistent Volumes & PersistentVolumeClaims

## Goal

Learn how Kubernetes provisions persistent storage and verify that data survives Pod deletion and recreation when the same PersistentVolumeClaim (PVC) is reused.

## Concepts

- **PersistentVolume (PV):** storage resource made available to the cluster.
- **PersistentVolumeClaim (PVC):** a workload's request for storage.
- **StorageClass:** defines how storage is provisioned.
- **Volume mount:** makes the claimed storage available inside a container.

## Prerequisites

- A running Minikube cluster.
- A default StorageClass (this lab uses `standard`).

Check the cluster and StorageClass:

~~~bash
minikube status
kubectl get storageclass
~~~

## 1. Create the PVC

Apply the manifest:

~~~bash
kubectl apply -f pvc.yaml
kubectl get pvc lab-13-pvc
~~~

Expected status: `Bound`. The claim requests 1Gi and uses the `standard` StorageClass.

## 2. Create a Pod that writes to the volume

~~~bash
kubectl apply -f pod.yaml
kubectl get pod storage-test-pod
kubectl exec storage-test-pod -- cat /data/test.txt
kubectl exec storage-test-pod -- ls -l /data
~~~

Expected file content:

~~~text
Persistent data from Lab 13
~~~

The Pod mounts `lab-13-pvc` at `/data`. The startup command writes `/data/test.txt` and then keeps the container running.

## 3. Verify persistence after Pod recreation

Delete only the test Pod. Do **not** delete the PVC:

~~~bash
kubectl delete pod storage-test-pod
kubectl get pvc lab-13-pvc
~~~

Recreate the Pod using the same manifest and read the file:

~~~bash
kubectl apply -f pod.yaml
kubectl get pod storage-test-pod
kubectl exec storage-test-pod -- cat /data/test.txt
~~~

Expected: the file still contains `Persistent data from Lab 13`. This demonstrates persistence across Pod recreation because the new Pod mounts the same PVC.

## 4. Inspect the storage resources

~~~bash
kubectl get pvc lab-13-pvc
kubectl get pv
kubectl describe pvc lab-13-pvc
~~~

Check that the claim is `Bound`, note its PV name, and review the StorageClass and events.

## Important notes

- Do not delete unrelated claims, including any existing `postgres-pvc`.
- A PVC and its backing storage are separate from the Pod lifecycle. Deleting a Pod does not delete its PVC.
- The `standard` StorageClass in this Minikube setup uses the `k8s.io/minikube-hostpath` provisioner and reports a `Delete` reclaim policy. Deleting the claim may cause the dynamically provisioned PV and its data to be deleted.
- This is a local learning exercise, not a production backup strategy. Persistence behavior depends on the storage provisioner and reclaim policy.

## Cleanup (optional)

Only after you no longer need the test data, remove the Pod:

~~~bash
kubectl delete pod storage-test-pod
~~~

Keep `lab-13-pvc` if you want to preserve the test data for later. If you intentionally delete the PVC, understand that its PV reclaim policy is `Delete` in this environment.

## What I learned

- PVCs request storage and bind to PVs.
- Pods mount PVCs through `volumes` and `volumeMounts`.
- Data stored on the claimed volume can survive Pod deletion and recreation when the same claim is reused.
