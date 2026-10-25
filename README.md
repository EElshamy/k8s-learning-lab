# Kubernetes Learning Lab 🚀

![Kubernetes](https://img.shields.io/badge/Kubernetes-learning-326CE5?logo=kubernetes&logoColor=white)
![Minikube](https://img.shields.io/badge/Environment-Minukube%20%7C%20macOS-2F6DB3)
![Hands-on labs](https://img.shields.io/badge/Labs-01--13-success)

A practical Kubernetes learning journal. Each lab includes manifests, commands, explanations, expected results, diagrams, and troubleshooting notes.

## Learning roadmap

~~~mermaid
flowchart TD
  A["01 · NGINX basics"] --> B["02 · Docker static website"]
  B --> C["03 · ConfigMaps"]
  C --> D["04 · NestJS"]
  D --> E["05 · NestJS + PostgreSQL"]
  E --> F["06 · Health probes"]
  F --> G["07 · Secrets"]
  G --> H["08 · RBAC"]
  H --> I["09 · Namespaces & quotas"]
  I --> J["10 · Services & networking"]
  J --> K["11 · DNS & Service Discovery"]
  K --> L["12 · Ingress"]
~~~

## Labs

| Lab | Topic | What you practice |
|---|---|---|
| [01 — NGINX on Kubernetes](labs/01-nginx-kubernetes/) | First workload | Deployment, Pods, replicas, Service, labels |
| [02 — Docker static website](labs/02-docker-kubernetes-static-website/) | Custom image | Dockerfile, build/load image, Deployment, Service |
| [03 — ConfigMaps](labs/03-configmap-environment-variables/) | Configuration | Non-sensitive settings, environment variables |
| [04 — NestJS](labs/04-nestjs-kubernetes/) | API deployment | Docker, replicas, Service networking |
| [05 — NestJS + PostgreSQL](labs/05-nestjs-postgres-kubernetes/) | Database integration | Secrets, ConfigMaps, Service DNS, PVC |
| [06 — Health checks](labs/06-health-checks-self-healing/) | Reliability | Startup, readiness, liveness, self-healing |
| [07 — Secrets & security](labs/07-kubernetes-secrets-security/) | Sensitive configuration | Secret references, safe handling |
| [08 — RBAC](labs/08-rbac-service-accounts/) | Authorization | ServiceAccount, Role, RoleBinding, least privilege |
| [09 — Namespaces](labs/09-namespaces-resource-isolation/) | Resource boundaries | Namespace, ResourceQuota, LimitRange |
| [10 — Services & networking](labs/10-services-networking/) | Traffic routing | ClusterIP, NodePort, selectors, EndpointSlices |
| [11 — DNS & Service Discovery](labs/11-kubernetes-dns-service-discovery/) | In-cluster name resolution | CoreDNS, Service DNS, FQDN, nslookup |
| [12 — Kubernetes Ingress](labs/12-kubernetes-ingress/) | HTTP routing | Ingress Controller, path-based routing, rewrite-target, ConfigMaps |\n| [13 — Persistent Volumes & PVCs](labs/13-persistent-volumes-pv-pvc/) | Persistent storage | StorageClass, PV/PVC binding, volume mounts, data persistence after Pod recreation |

## How Kubernetes traffic flows

~~~mermaid
flowchart LR
  U["Client"] --> I["Ingress Controller"]
  I --> S1["Service A"]
  I --> S2["Service B"]
  S1 --> P1["Pod A"]
  S2 --> P2["Pod B"]
  D1["Deployment A"] -. maintains .-> P1
  D2["Deployment B"] -. maintains .-> P2
  L1["Pod labels"] -. selected by .-> S1
  L2["Pod labels"] -. selected by .-> S2
~~~

A Deployment maintains the desired number of Pods. A Service offers a stable endpoint and selects backend Pods using labels. Kubernetes DNS lets workloads discover Services by name rather than depending on Pod IP addresses. An Ingress resource defines HTTP/HTTPS routing rules, while an Ingress Controller implements those rules and forwards requests to Services.

## Start the local environment

~~~bash
minikube start
kubectl config current-context
kubectl get nodes
~~~

Expected: the context points to Minikube and its node is Ready.

## General workflow

From the relevant lab directory, follow its README. Common commands:

~~~bash
kubectl apply -f <manifest>.yaml
kubectl get pods
kubectl describe <resource> <name>
kubectl logs <pod-name>
~~~

Review manifests before applying them. Avoid broad deletion commands on a cluster that contains workloads from other labs.

## Progress

- [x] Labs 01–13 completed and documented
- [ ] Lab 13 onward: storage, scaling, monitoring, and CI/CD

Diagrams are written in Mermaid and rendered directly by GitHub Markdown.
