import {
  createConfigMap,
  createDeployment,
  createIngress,
  createNamespace,
  createPersistentVolumeClaim,
  createSecret,
  createService,
} from "./apply";
import * as k8s from "@kubernetes/client-node";
import { DeploymentConfig, SecretStore } from "./types";

export type ActionsCore = {
  setOutput: (name: string, value: any) => void;
  setFailed: (message: string) => void;
  getInput: (name: string, options?: any) => string | undefined;
  info: (message: string) => void;
};

export const makeSlask = (
  core: ActionsCore,
  file: string,
  context: any,
  secretStore: SecretStore
) => {
  const wrap =
    <R>(type: string, fn: (...args: any[]) => Promise<R>) =>
    (...args: any[]) => {
      return fn(...args)
        .then(({ body }: any) => {
          if (body?.metadata?.name) {
            core.setOutput(body?.metadata?.name, body);
            core.info(`Applied ${type}: ${body.metadata.name}`);
          }
        })
        .catch((e) => {
          //core.warning(e);
          core.setFailed(e);
        });
    };
  import(file)
    .then((m) => m.default as DeploymentConfig)
    .then((deployment) => {
      const kc = new k8s.KubeConfig();
      const config = core.getInput("k8sConfig");

      if (config) {
        kc.loadFromString(config);
      } else {
        kc.loadFromDefault();
      }

      const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
      const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
      const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

      return deployment(
        {
          createDeployment: wrap("deployment", (namespace, deployment) =>
            createDeployment(namespace, deployment, k8sAppsApi)
          ),
          createService: wrap("service", (namespace, service) =>
            createService(namespace, service, k8sCoreApi)
          ),
          createIngress: wrap("ingress", (namespace, data) =>
            createIngress(namespace, data, k8sNetworkingApi)
          ),
          createPersistentVolumeClaim: wrap("volume claim", (namespace, data) =>
            createPersistentVolumeClaim(namespace, data, k8sCoreApi)
          ),
          createConfigMap: wrap("configmap", (namespace, data) =>
            createConfigMap(namespace, data, k8sCoreApi)
          ),
          createSecret: wrap("secret", (namespace, data) =>
            createSecret(namespace, data, k8sCoreApi)
          ),
          createNamespace: wrap("namespace", (data) =>
            createNamespace(data, k8sCoreApi)
          ),
        },
        context,
        secretStore
      );
    })
    .catch((e) => {
      core.setFailed(e);
    })
    .finally(() => {
      core.info("Done");
    });
};
