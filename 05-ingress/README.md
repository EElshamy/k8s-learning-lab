# 05 - Ingress

Ingress exposes HTTP/HTTPS routes from outside the cluster to Services.

## Prerequisites

For Minikube:

```bash
minikube addons enable ingress
```

This lab expects the Service from the previous lab:

`nginx-service`

## Create

```bash
kubectl apply -f ../03-services/deployment.yaml
kubectl apply -f ../03-services/service.yaml
kubectl apply -f ingress.yaml
```

## Check

```bash
kubectl get ingress
kubectl describe ingress nginx-ingress
```

## Local Test

Add the host to your local hosts file using the Minikube IP:

```bash
minikube ip
sudo sh -c 'echo "<MINIKUBE-IP> nginx.local" >> /etc/hosts'
```

Then open:

`http://nginx.local`
