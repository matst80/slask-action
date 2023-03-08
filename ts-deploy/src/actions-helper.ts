import core = require("@actions/core");
import * as k8s from "@kubernetes/client-node";
const kc = new k8s.KubeConfig();
const config = core.getInput("k8sConfig");
if (!config) {
  kc.loadFromDefault();
} else {
  kc.loadFromString(config);
}
//const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
export const getCoreClient = () => kc.makeApiClient(k8s.CoreV1Api);
export const getAppsClient = () => kc.makeApiClient(k8s.AppsV1Api);
