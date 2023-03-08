import * as k8s from "@kubernetes/client-node";
import core = require("@actions/core");
import {
  createDeployment,
  createService,
  createVolumeClaim,
} from "../test/apply";

const kc = new k8s.KubeConfig();
const config = core.getInput("k8sConfig", { required: true });
//kc.loadFromDefault();
kc.loadFromString(config);

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

(async function run() {
  createDeployment(
    "default",
    {
      metadata: {
        name: "slask",
        labels: {
          elefant: "1",
          app: "slask",
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: "slask",
          },
        },
        template: {
          metadata: {
            labels: {
              app: "slask",
            },
          },
          spec: {
            containers: [
              {
                name: "slask2",
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
                    memory: "28Mi",
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
