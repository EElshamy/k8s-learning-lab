# 06 - Storage

This lab demonstrates a PersistentVolume (PV), PersistentVolumeClaim (PVC), and mounting persistent storage into a Pod.

## Create

```bash
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
```

## Check

```bash
kubectl get pv
kubectl get pvc
kubectl get pods
```

## Test Persistence

```bash
kubectl exec deploy/storage-demo -- sh -c 'echo "persistent data" > /usr/share/nginx/html/data/test.txt'
kubectl exec deploy/storage-demo -- cat /usr/share/nginx/html/data/test.txt
```

Delete and recreate the Pod:

```bash
kubectl rollout restart deployment/storage-demo
kubectl exec deploy/storage-demo -- cat /usr/share/nginx/html/data/test.txt
```

The data should still exist because it is stored on the persistent volume.

## Cleanup

```bash
kubectl delete -f deployment.yaml
kubectl delete -f pvc.yaml
kubectl delete -f pv.yaml
```
