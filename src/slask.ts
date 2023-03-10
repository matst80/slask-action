import * as core from "@actions/core";
import * as github from "@actions/github";
import * as k8s from "@kubernetes/client-node";
import { DeploymentConfig } from "./types";
import { join } from "path";
import {
  createDeployment,
  createIngress,
  createPersistentVolumeClaim,
  createService,
} from "./apply";

const scriptFile =
  core.getInput("scriptPath") ??
  process.env.SCRIPT_PATH ??
  "operations/deploy.js";

const localPath = process.env.GITHUB_WORKSPACE ?? ".";
core.info("Loading deployment script: " + scriptFile);

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
        core.warning(e);
      });
  };

const file = join(localPath, scriptFile);
core.info(file);

export default import(file)
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
      },
      github.context
    );
  })
  .catch((e) => {
    core.setFailed(e);
  })
  .finally(() => {
    core.info("Done");
  });
