import * as core from "@actions/core";
import * as github from "@actions/github";
import * as k8s from "@kubernetes/client-node";
import { DeploymentConfig } from "./types";
import { createDeployment, createService } from "./apply";

const scriptFile = core.getInput("scriptPath");

core.info("Loading deployment script: " + scriptFile);

import(scriptFile)
  .then((m) => m.default as DeploymentConfig)
  .then((deployment) => {
    core.info(JSON.stringify(github.context, null, 2));
    const kc = new k8s.KubeConfig();
    const config = core.getInput("k8sConfig");
    if (config) {
      kc.loadFromString(config);
    } else {
      kc.loadFromDefault();
    }

    const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

    deployment({
      createDeployment: (namespace, deployment) =>
        createDeployment(namespace, deployment, k8sAppsApi).then(({ body }) => {
          core.info(`Applied deployment: ${body.metadata.name}`);
        }),
      createService: (namespace, service) =>
        createService(namespace, service, k8sCoreApi).then(({ body }) => {
          core.info(`Applied service: ${body.metadata.name}`);
        }),
    });
  });
