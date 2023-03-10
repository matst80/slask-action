# slask-action
Deploy scripted kubernetes applications without dependencies

example `action.yaml`:

```yaml
jobs:
  slask:
    runs-on: self-hosted
    steps:
    - uses: actions/checkout@v3
    - name: Deploy scripted application
      uses: matst80/slask-action@main
      with:
        k8sConfig: ${{ secrets.K8S_CONFIG }}
        scriptPath: deploy.cjs
```
then the deployment script file `/deploy.cjs`

```js
/** @type {import('ts-kubernetes-action').DeploymentConfig} */
module.exports = async (k8s, { sha }) => {
  const namespace = "default";
  const labels = { app: "example" };

  await k8s.createDeployment(namespace, {
    metadata: {
      name: "example",
      labels,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: labels,
      },
      template: {
        metadata: {
          labels,
        },
        spec: {
          containers: [
            {
              name: "converter",
              image: `example:${sha}`,
              imagePullPolicy: "Always",
              ports: [
                {
                  containerPort: 8080,
                },
              ],
              resources: {
                requests: {
                  memory: "40Mi",
                },
              },
            },
          ],
        },
      },
    },
  });
  await k8s.createService(namespace, {
    metadata: {
      name: "example",
    },
    spec: {
      selector: labels,
      ports: [
        {
          port: 8080,
        },
      ],
    },
  });
  await k8s.createIngress(namespace, {
    metadata: {
      name: "example",
    },
    spec: {
      ingressClassName: "nginx",
      rules: [
        {
          host: "example.local",
          http: {
            paths: [
              {
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: "example",
                    port: {
                      number: 8080,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  });
};
```