# slask-action
## Deploy scripted kubernetes applications without dependencies

if you need to test the action without github actions you can use `npx ts-kubernetes-action deploy.cjs '{"sha":"1231234"}'` last parameter is the github context if that is used in the deployment file, f.ex. git sha and it's not needed.

variables can be set with `npx ts-kubernetes-action deploy.cjs sha=1231234`

configurations and secrets can be also be used, first store with `npx ts-kubernetes-action set key value` or `npx ts-kubernetes-action set-secret key value`

to override config file use `--secrets-file=filename` and to override default encryption key `--secrets-key=32byte-key`


to convert your yaml deployments to json/slask deployments you can try https://yaml-converter.knatofs.se/

## Deploy with github actions

example `action.yaml`:

```yaml
jobs:
  slask:
    runs-on: ubuntu-latest
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