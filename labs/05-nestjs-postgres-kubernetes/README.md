# Lab 05 — NestJS + PostgreSQL on Kubernetes

**Goal:** connect an API to PostgreSQL using Kubernetes networking and persistent storage.

## Architecture

~~~mermaid
flowchart TD
  CLIENT["Client"] --> API_SVC["NestJS Service"]
  API_SVC --> API["NestJS Pod"]
  API -->|"postgres:5432"| DB_SVC["PostgreSQL Service"]
  DB_SVC --> DB["PostgreSQL Pod"]
  DB --> PVC["PersistentVolumeClaim"]
  PVC --> PV["Persistent storage"]
  CM["ConfigMap: non-secret settings"] --> API
  SEC["Secret: credentials"] --> API
  SEC --> DB
~~~

## Key concepts

- The API connects to the PostgreSQL Service name, not a Pod IP.
- A Service gives the database a stable in-cluster endpoint.
- A ConfigMap stores non-sensitive settings.
- A Secret stores credential values.
- A PVC requests storage intended to persist beyond a Pod replacement.

## Important files

Review the manifests in this directory, including PostgreSQL Deployment/Service, PVC, API Deployment/Service, ConfigMap, and example Secret files.

## Apply and verify

Apply storage and configuration resources first, then the database and API workloads. If Secret files are examples, copy them to local ignored files and insert lab-only credentials; never commit real credentials.

~~~bash
kubectl get pods
kubectl get svc
kubectl get pvc
kubectl describe pod <postgres-pod>
kubectl logs deployment/<api-deployment-name>
~~~

Expected: the PVC becomes Bound, PostgreSQL becomes Ready, and the API connects using the Service DNS name and port 5432.

## Troubleshooting

- Connection refused: inspect DB readiness and Service endpoints.
- Authentication failed: compare the username/password configuration on both sides.
- DNS lookup fails: confirm the Service name and namespace.
- Data is not persistent: confirm PostgreSQL writes to the mounted volume.

**Security:** Kubernetes Secrets need appropriate RBAC and encryption-at-rest configuration; Base64 is encoding, not encryption.
