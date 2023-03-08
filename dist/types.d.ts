import { V1Deployment, V1Service } from "@kubernetes/client-node";
export type DeployFunctions = {
    createDeployment: (namespace: string, data: V1Deployment) => Promise<unknown>;
    createService: (namespace: string, data: V1Service) => Promise<unknown>;
};
export type DeploymentConfig = (deployFunction: DeployFunctions) => Promise<any>;
