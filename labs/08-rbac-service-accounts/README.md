# Lab 08 — RBAC & ServiceAccounts

**Goal:** give a workload only the Kubernetes API permissions it requires.

## Authorization diagram

~~~mermaid
flowchart TD
  POD["Test Pod"] --> SA["ServiceAccount: pod-reader"]
  SA --> RB["RoleBinding"]
  RB --> ROLE["Role: read Pods"]
  ROLE --> API["Kubernetes authorization"]
  API --> ALLOW["get / list / watch: allowed"]
  API --> DENY["delete Pods: denied"]
~~~

## Concepts

- **ServiceAccount:** identity used by a workload.
- **Role:** defines permissions within one namespace.
- **RoleBinding:** attaches a Role to a user, group, or ServiceAccount.
- **Least privilege:** grant only the verbs and resources required.

## Files and apply order

- serviceaccount.yaml — creates the workload identity.
- role.yaml — defines read-only Pod permissions.
- rolebinding.yaml — binds the Role to the ServiceAccount.
- test-pod.yaml — test Pod using the ServiceAccount.

~~~bash
kubectl apply -f serviceaccount.yaml
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml
kubectl apply -f test-pod.yaml
~~~

## Verify permissions

~~~bash
kubectl auth can-i list pods --as=system:serviceaccount:default:pod-reader
kubectl auth can-i get pods --as=system:serviceaccount:default:pod-reader
kubectl auth can-i delete pods --as=system:serviceaccount:default:pod-reader
~~~

For the lab's read-only Role, expected results are yes, yes, and no. The impersonation checks also require your current identity to be allowed to impersonate the ServiceAccount.

## Why it matters

A workload that only needs to list Pods should not be allowed to delete Pods, modify Deployments, or read Secrets.

## Cleanup

Review resource names before deleting only the resources created for this lab.
