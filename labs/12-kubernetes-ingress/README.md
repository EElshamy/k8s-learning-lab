# Lab 12: Kubernetes Ingress

## Objectives

- Enable the NGINX Ingress Controller in Minikube.
- Deploy two applications with separate ClusterIP Services.
- Configure path-based routing with an Ingress resource.
- Use ConfigMaps to serve distinct HTML pages from the two apps.
- Rewrite `/app1` and `/app2` to `/` before the request reaches each backend.
- Test the routes from inside the cluster and from macOS.

## Architecture

```mermaid
flowchart TD
    U[Mac / HTTP client] --> IC[NGINX Ingress Controller]
    IC -->|/app1; rewrite to /| S1[app1-service]
    IC -->|/app2; rewrite to /| S2[app2-service]
    S1 --> P1[app1 Pod]
    S2 --> P2[app2 Pod]
    C1[app1-content ConfigMap] -. mounts index.html .-> P1
    C2[app2-content ConfigMap] -. mounts index.html .-> P2
```

## Prerequisites

- Minikube and `kubectl` installed.
- A working Minikube cluster.
- The Docker driver on macOS may require a local tunnel command to reach the Ingress Controller from the host.

## 1. Start Minikube and enable Ingress

```bash
minikube start
minikube addons enable ingress
kubectl get pods -n ingress-nginx
kubectl get ingressclass
```

Wait until the `ingress-nginx-controller` Pod is `Running` and the `nginx` IngressClass is available.

## 2. Create the namespace

```bash
kubectl create namespace lab-12
kubectl get namespace lab-12
```

If the namespace already exists, reuse it.

## 3. Create the app ConfigMaps

Save the ConfigMap manifests in `app-content.yaml`, then apply them:

```bash
kubectl apply -f app-content.yaml
kubectl get configmap -n lab-12
```

The two ConfigMaps contain different `index.html` files: one says `Hello from App 1`, and the other says `Hello from App 2`.

## 4. Deploy the apps and Services

The `apps.yaml` manifest creates two Deployments and two ClusterIP Services. Each Deployment mounts its matching ConfigMap at NGINX's default document root, `/usr/share/nginx/html`.

```bash
kubectl apply -f apps.yaml
kubectl get deployments,pods,services -n lab-12
kubectl rollout status deployment/app1 -n lab-12
kubectl rollout status deployment/app2 -n lab-12
```

Test the Services from a temporary in-cluster client Pod:

```bash
kubectl run ingress-test-2 \
  -n lab-12 \
  --image=curlimages/curl \
  --restart=Never \
  --command -- sleep 3600

kubectl exec -n lab-12 ingress-test-2 -- curl -sS http://app1-service/
kubectl exec -n lab-12 ingress-test-2 -- curl -sS http://app2-service/
```

Expected content:

- `app1-service`: `Hello from App 1`
- `app2-service`: `Hello from App 2`

## 5. Configure Ingress path routing

Apply `ingress.yaml`:

```bash
kubectl apply -f ingress.yaml
kubectl get ingress -n lab-12
kubectl describe ingress lab-12-ingress -n lab-12
```

The Ingress has two paths:

| Path | Backend Service |
|---|---|
| `/app1` | `app1-service:80` |
| `/app2` | `app2-service:80` |

The annotation `nginx.ingress.kubernetes.io/rewrite-target: /` rewrites the matched request path to `/` before forwarding it. This matters because the default NGINX page is served at `/`; without rewriting, requests to `/app1` and `/app2` return 404 from the backend even though Ingress selected the correct Service.

## 6. Test routing from inside the cluster

```bash
kubectl exec -n lab-12 ingress-test-2 -- \
  curl -sS -i http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/app1

kubectl exec -n lab-12 ingress-test-2 -- \
  curl -sS -i http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/app2
```

Expected: both requests return `HTTP 200 OK`, with the matching app-specific HTML.

## 7. Test from macOS

With the Minikube Docker driver on macOS, the node IP or NodePort may not be directly reachable from the host. Use Minikube's Service helper:

```bash
minikube service ingress-nginx-controller -n ingress-nginx --url
```

Keep this command's terminal open while testing. It prints local URLs for HTTP and HTTPS. Use the URL whose port corresponds to HTTP (in this run, the first URL):

```bash
curl -i http://127.0.0.1:<HTTP_PORT>/app1
curl -i http://127.0.0.1:<HTTP_PORT>/app2
```

Expected responses:

- `HTTP 200 OK` with `Hello from App 1`
- `HTTP 200 OK` with `Hello from App 2`

Do not assume the generated local ports are fixed; use the URLs printed by your own Minikube command. Sending plain HTTP to the HTTPS URL returns a `400` error indicating that an HTTP request was sent to an HTTPS port.

## Troubleshooting

- **Ingress returns 404:** inspect `kubectl logs -n ingress-nginx deployment/ingress-nginx-controller --tail=50`. The access log shows which backend was selected and the backend status. A 404 from `app1-service` or `app2-service` can mean the backend received `/app1` or `/app2` without rewriting.
- **Service returns the default page:** verify the matching ConfigMap is mounted by its Deployment and check the page with `kubectl exec` through a client Pod.
- **Host cannot reach the node IP or NodePort on macOS/Docker:** use `minikube service ingress-nginx-controller -n ingress-nginx --url` and keep the helper terminal open.
- **HTTP request to HTTPS port returns 400:** use the HTTP URL for plain `http://` requests, or use HTTPS with the HTTPS URL.

## Key concepts

| Resource | Responsibility |
|---|---|
| Deployment | Maintains the app Pod |
| ConfigMap | Stores the app's HTML content |
| ClusterIP Service | Provides stable in-cluster access to matching Pods |
| Ingress | Declares HTTP path-routing rules |
| Ingress Controller | Implements the rules and forwards requests |
| Rewrite annotation | Changes the request path before it reaches the backend |

## Cleanup

Delete only the resources created for this lab:

```bash
kubectl delete pod ingress-test ingress-test-2 -n lab-12 --ignore-not-found
kubectl delete namespace lab-12
```

If you want to keep the lab running, do not run the namespace deletion command. To stop the local URL helper, use `Ctrl+C` in the terminal where `minikube service ... --url` is running.

## Results

- [x] Enabled and verified the NGINX Ingress Controller.
- [x] Deployed two apps and exposed them through ClusterIP Services.
- [x] Used ConfigMaps to serve distinct app content.
- [x] Routed `/app1` and `/app2` to the correct Services.
- [x] Fixed backend 404s using the rewrite annotation.
- [x] Verified both routes return HTTP 200 and the correct HTML from macOS.
