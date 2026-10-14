# Lab 08: Kubernetes RBAC & Service Accounts

## Objective
Learn Kubernetes ServiceAccounts, Roles, RoleBindings, and the principle of least privilege.

## Files
- `serviceaccount.yaml`: creates the `pod-reader` ServiceAccount.
- `role.yaml`: grants read-only access to Pods in the `default` namespace.
- `rolebinding.yaml`: binds the Role to the ServiceAccount.
- `test-pod.yaml`: creates a test Pod using the `pod-reader` ServiceAccount.
- `.gitignore`: excludes local environment files and secret manifests.

## Apply the manifests
```bash
kubectl apply -f serviceaccount.yaml
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml
kubectl apply -f test-pod.yaml
```

## Verify permissions

Check whether the ServiceAccount can list Pods:
```bash
kubectl auth can-i list pods --as=system:serviceaccount:default:pod-reader
``
Expected: `yes`

Check whether it can delete Pods:
```bash
kubectl auth can-i delete pods --as=system:serviceaccount:default:pod-reader
``
Expected: `no`

Check whether it can update Pods:
```bash
kubectl auth can-i update pods --as=system:serviceaccount:default:pod-reader
``
Expected: `no`

## Test API access from the test Pod
```bash
kubectl exec rbac-test-pod -- kubectl get pods
``

The command should list Pods in the namespace. Attempting to delete a Pod should be forbidden while the Role remains read-only.

## Security lessons
- A Role applies within its configured namespace.
- Permissions on Pods without resource-name restrictions may affect any Pod in that namespace, regardless of which application owns it.
- Follow least privilege and grant only the verbs and resources required.
- Use a dedicated namespace for isolated labs so tests do not affect unrelated workloads.
- Avoid testing destructive permissions against unrelated application resources.
- `.gitignore` does not remove files that are already tracked; always inspect staged changes before committing.

## Cleanup
Delete only resources created specifically for this lab:
```bash
kubectl delete -f test-pod.yaml
kubectl delete -f rolebinding.yaml
kubectl delete -f role.yaml
kubectl delete -f serviceaccount.yaml
``

Review the manifests before cleanup. Do not delete unrelated Pods or application resources.
