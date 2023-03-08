import * as k8s from "@kubernetes/client-node";
import core = require("@actions/core");
import { createDeployment, createService, createVolumeClaim } from "./apply";

const kc = new k8s.KubeConfig();
const config = core.getInput("k8sConfig", { required: true });
kc.loadFromString(config);

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

(async function run() {
  createDeployment(
    "default",
    {
      metadata: {
        name: "slask",
      },
      spec: {
        replicas: 1,
        template: {
          spec: {
            containers: [
              {
                name: "slask1",
                image: "nginx",
                imagePullPolicy: "Always",
                ports: [
                  {
                    name: "http",
                    containerPort: 80,
                  },
                ],
                resources: {
                  requests: {
                    memory: "18Mi",
                  },
                },
              },
            ],
          },
        },
      },
    },
    k8sApi
  ).then((res) => {
    console.log(res);
  });
})();
