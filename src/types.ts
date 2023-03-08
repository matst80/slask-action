import type { Context } from "@actions/github/lib/context";
import type { V1Deployment, V1Service } from "@kubernetes/client-node";

export type DeployFunctions = {
  createDeployment: (namespace: string, data: V1Deployment) => Promise<unknown>;
  createService: (namespace: string, data: V1Service) => Promise<unknown>;
};

export type DeploymentConfig = (
  deployFunctions: DeployFunctions,
  context: Context
) => Promise<any>;
