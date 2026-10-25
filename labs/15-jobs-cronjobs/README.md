# Lab 15 — Kubernetes Jobs & CronJobs

## Objective

Practice running one-off tasks with Kubernetes Jobs, running multiple completions sequentially or in parallel, and scheduling tasks with CronJobs.

## 1. Job — run a task once

Create `job.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-job
spec:
  completions: 1
  parallelism: 1
  template:
    spec:
      containers:
        - name: hello
          image: busybox:1.36
          command: ["sh", "-c", "echo Hello from Kubernetes Job; date"]
      restartPolicy: Never
```

Apply and inspect:

```bash
kubectl apply -f job.yaml
kubectl get jobs
kubectl get pods
kubectl logs <pod-name>
```

Expected result: the Job reaches `Complete` with `1/1` successful completion. Its Pod becomes `Completed` because the task has finished.

## 2. Completions and parallelism

Sequential example:

```yaml
metadata:
  name: hello-job-multiple
spec:
  completions: 3
  parallelism: 1
```

Parallel example:

```yaml
metadata:
  name: hello-job-parallel
spec:
  completions: 3
  parallelism: 3
```

Use the same Pod template from the first Job.

- `completions: 3` means three successful task completions are required.
- `parallelism: 1` aims to run one Pod at a time.
- `parallelism: 3` allows up to three Pods to run concurrently.

Inspect:

```bash
kubectl get jobs
kubectl get pods -l job-name=hello-job-multiple
kubectl logs -l job-name=hello-job-multiple --prefix
```

In this lab run, the sequential Job completed 3/3 in about 9 seconds, while the parallel Job completed 3/3 in about 4 seconds. Actual timings vary.

## 3. CronJob — run on a schedule

Create `cronjob.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cronjob
spec:
  schedule: "*/1 * * * *"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 2
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      completions: 1
      parallelism: 1
      template:
        spec:
          containers:
            - name: hello
              image: busybox:1.36
              command: ["sh", "-c", "echo Hello from CronJob; date"]
          restartPolicy: Never
```

Apply and verify:

```bash
kubectl apply -f cronjob.yaml
kubectl get cronjobs
kubectl get jobs
kubectl describe cronjob hello-cronjob
kubectl logs <pod-name>
```

### Important settings

- `schedule: "*/1 * * * *"`: run every minute.
- `concurrencyPolicy: Forbid`: skip starting a new Job if a previous Job is still active.
- `successfulJobsHistoryLimit: 2`: retain up to two successful Jobs.
- `failedJobsHistoryLimit: 1`: retain up to one failed Job.

The CronJob controller creates Jobs on schedule; each Job creates Pods to run the task. History limits apply to Jobs owned by this CronJob, not unrelated manually created Jobs.

## 4. Troubleshooting and verification

```bash
kubectl get cronjobs
kubectl describe cronjob hello-cronjob
kubectl get jobs --show-labels
kubectl get pods --show-labels
```

During this lab, a selector using `batch.kubernetes.io/cronjob-name=hello-cronjob` returned no resources in the observed cluster. The CronJob Events confirmed successful Job creation, completion, and cleanup of older Jobs. Inspect the actual labels on your resources rather than assuming a label exists.

## 5. Real-world use cases

- **Job:** one-time database migration, data import, or batch processing.
- **CronJob:** scheduled report, periodic cleanup, or scheduled backup.
- **Deployment:** a continuously running application such as an API or frontend.

For production migrations and backups, handle credentials and storage securely, and make tasks safe to retry. A retry does not guarantee that a partially completed task is harmless to repeat.

## 6. Cleanup

Remove the resources created for the lab:

```bash
kubectl delete -f cronjob.yaml
kubectl delete -f job.yaml
kubectl delete job hello-job hello-job-multiple
```

The lab resources were removed from the cluster. The YAML files were kept locally in `~/minikube/k8s-lab-15` for reference.

## Key takeaways

- A Job runs tasks until the required successful completions are achieved.
- `completions` controls required successful runs; `parallelism` controls concurrent work.
- A CronJob creates Jobs according to a cron schedule.
- History limits clean up old Jobs owned by the CronJob.
- `Complete` is the expected final state for a task that finished successfully.
