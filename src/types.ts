import type { Context } from "@actions/github/lib/context";
import type {
  V1ConfigMap,
  V1Deployment,
  V1Ingress,
  V1Namespace,
  V1PersistentVolumeClaim,
  V1Secret,
  V1Service,
} from "@kubernetes/client-node";

export type DeployFunctions = {
  createDeployment: (namespace: string, data: V1Deployment) => Promise<unknown>;
  createService: (namespace: string, data: V1Service) => Promise<unknown>;
  createIngress: (namespace: string, data: V1Ingress) => Promise<unknown>;
  createPersistentVolumeClaim: (
    namespace: string,
    data: V1PersistentVolumeClaim
  ) => Promise<unknown>;
  createConfigMap: (namespace: string, data: V1ConfigMap) => Promise<unknown>;
  createSecret: (namespace: string, data: V1Secret) => Promise<unknown>;
  createNamespace: (namespace: V1Namespace) => Promise<unknown>;
};

export type SecretStore = {
  get: (key: string) => Promise<string>;
  getAll: () => Promise<Record<string, string>>;
};

export type DeploymentConfig = (
  deployFunctions: DeployFunctions,
  context: Context,
  secretStore: SecretStore
) => Promise<any>;
