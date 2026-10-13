# Lab 05 — NestJS + PostgreSQL on Kubernetes

This lab runs PostgreSQL and a NestJS API in Minikube. It demonstrates Kubernetes Deployments, Services, Secrets, ConfigMaps, PersistentVolumeClaims, in-cluster DNS, and database connectivity.

## Architecture

```text
Client -> nestjs-postgres-service (NodePort) -> NestJS Pod
                                          -> postgres:5432 -> postgres Service (ClusterIP)
                                                           -> PostgreSQL Pod -> postgres-pvc (1Gi)
```

## Files

- `postgres-deployment.yaml`: PostgreSQL Deployment.
- `postgres-service.yaml`: internal-only Service for PostgreSQL.
- `postgres-pvc.yaml`: persistent storage request.
- `postgres-secret.example.yaml`: template for PostgreSQL credentials.
- `nestjs-configmap.yaml`: non-sensitive database connection settings.
- `nestjs-secret.example.yaml`: template for credentials consumed by NestJS.
- `nestjs-deployment.yaml`: NestJS Deployment.
- `nestjs-service.yaml`: NodePort Service for the API.
- `nestjs-app/`: minimal NestJS source and Docker build files.

> The example Secret files contain demo placeholders only. Copy them to the filenames expected by the manifests, set matching credentials, and do not commit those local Secret files.

## Prerequisites

- Docker, Minikube, kubectl
- Node.js and npm (only needed to build the app)

## 1. Prepare local Secrets

From this directory:

```bash
cp postgres-secret.example.yaml postgres-secret.yaml
cp nestjs-secret.example.yaml nestjs-secret.yaml
```

Edit both files. Ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `postgres-secret.yaml` match `DB_USER`, `DB_PASSWORD`, and `DB_NAME` provided to NestJS. The committed examples use demo values and must not be used in production. The real local files are ignored by Git.

## 2. Deploy PostgreSQL

```bash
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
kubectl get pods,pvc,svc
```

Wait until the PostgreSQL Pod is `1/1 Running` and the PVC is `Bound`.

## 3. Build and load the NestJS image

```bash
cd nestjs-app
npm install
 docker build -t nestjs-postgres-app:v1 .
minikube image load nestjs-postgres-app:v1
cd ..
```

## 4. Deploy NestJS

```bash
kubectl apply -f nestjs-configmap.yaml
kubectl apply -f nestjs-secret.yaml
kubectl apply -f nestjs-deployment.yaml
kubectl apply -f nestjs-service.yaml
kubectl get deployments,services,pods
kubectl logs deployment/nestjs-postgres-app
```

The logs should include `PostgreSQL connection established successfully`.

## 5. Test database connectivity

```bash
kubectl exec deploy/postgres -- sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();"'
minikube service nestjs-postgres-service --url
```

On macOS with the Docker driver, keep the `minikube service ... --url` terminal open while testing. Use the returned URL with `/db-version`:

```bash
curl http://127.0.0.1:<PORT>/db-version
```

Expected response contains a PostgreSQL version in JSON.

## 6. Verify persistent storage

Create a sample table and row:

```bash
kubectl exec deploy/postgres -- sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE TABLE IF NOT EXISTS lab_test (id SERIAL PRIMARY KEY, message TEXT); INSERT INTO lab_test (message) VALUES ('\''Data survives Pod restart'\''); SELECT * FROM lab_test;"'
```

Delete only the PostgreSQL Pod; its Deployment will create a replacement:

```bash
kubectl delete pod -l app=postgres
kubectl get pods -l app=postgres -w
```

After the replacement Pod becomes Ready, query the data again:

```bash
kubectl exec deploy/postgres -- sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT * FROM lab_test;"'
```

The row should remain because the database uses the PVC. Do not delete the PVC if you need to keep the data.

## Concepts learned

- Deploying a stateful database and stateless API as separate workloads.
- Routing inside the cluster using a Kubernetes Service and DNS name `postgres`.
- Separating non-sensitive configuration (ConfigMap) from credentials (Secret).
- Keeping database files outside the Pod lifecycle with a PVC.
- Verifying readiness, logs, HTTP API responses, and data persistence.

## Security and production notes

- Never commit real credentials to Git. The example Secret files are templates for local learning.
- Kubernetes Secrets are not automatically encrypted merely because they are Secrets; production clusters need appropriate encryption-at-rest and RBAC controls.
- A single PostgreSQL replica on Minikube is for learning, not high availability.
- PVCs are not backups. Keep independent backups for important data.
