import * as k8s from "@kubernetes/client-node";
import {
  V1ConfigMap,
  V1DaemonSet,
  V1Deployment,
  V1Ingress,
  V1Job,
  V1Namespace,
  V1PersistentVolumeClaim,
  V1Service,
} from "@kubernetes/client-node";

type ListResponse<T> = { body: { items: T[] } };
type Create<T> = (namespace: string, data: T) => Promise<unknown>;
type List<T> = (namespace: string) => Promise<ListResponse<T>>;
type Update<T> = (name: string, namespace: string, data: T) => Promise<unknown>;

const unwrap = <T>(data: T | Promise<T>) =>
  data instanceof Promise ? data : Promise.resolve(data);

const updateOrCreate = <T extends { metadata?: { name?: string } }>(
  list: List<T>,
  create: Create<T>,
  update: Update<T>
) => {
  return async (
    namespace: string,
    dataInput: T | Promise<T>,
    connection: any
  ) => {
    const data = await unwrap(dataInput);
    return list.apply(connection, [namespace]).then((res: ListResponse<T>) => {
      const exists = res.body.items.find(
        ({ metadata: { name } = {} }) => name === data.metadata?.name
      );
      return exists
        ? update.apply(connection, [exists.metadata!.name!, namespace, data])
        : create.apply(connection, [namespace, data]);
    });
  };
};

const createIfNotExists = <T extends { metadata?: { name?: string } }>(
  list: List<T>,
  create: Create<T>
) => {
  return async (
    namespace: string,
    dataInput: T | Promise<T>,
    connection: any
  ) => {
    const data = await unwrap(dataInput);
    return list.apply(connection, [namespace]).then((res: ListResponse<T>) => {
      const exists = res.body.items.find(
        ({ metadata: { name } = {} }) => name === data.metadata?.name
      );
      if (!exists) {
        return create.apply(connection, [namespace, data]);
      }
    });
  };
};

export const createDeployment = (
  namespace: string,
  data: V1Deployment,
  k8sApi: k8s.AppsV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedDeployment,
    k8sApi.createNamespacedDeployment,
    k8sApi.replaceNamespacedDeployment
  )(namespace, data, k8sApi);

export const createPersistentVolumeClaim = (
  namespace: string,
  data: V1PersistentVolumeClaim,
  k8sApi: k8s.CoreV1Api
) =>
  createIfNotExists(
    k8sApi.listNamespacedPersistentVolumeClaim,
    k8sApi.createNamespacedPersistentVolumeClaim
  )(namespace, data, k8sApi);

export const createNamespace = (data: V1Namespace, k8sApi: k8s.CoreV1Api) => {
  return k8sApi.listNamespace().then(async ({ body }) => {
    const exists = body.items.find(
      ({ metadata }) => metadata?.name === data.metadata?.name
    );
    return exists ?? (await k8sApi.createNamespace(data));
  });
};

export const createService = (
  namespace: string,
  data: V1Service,
  k8sApi: k8s.CoreV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedService,
    k8sApi.createNamespacedService,
    k8sApi.replaceNamespacedService
  )(namespace, data, k8sApi);

export const createIngress = (
  namespace: string,
  data: V1Ingress,
  k8sApi: k8s.NetworkingV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedIngress,
    k8sApi.createNamespacedIngress,
    k8sApi.replaceNamespacedIngress
  )(namespace, data, k8sApi);

export const createConfigMap = (
  namespace: string,
  data: V1ConfigMap,
  k8sApi: k8s.CoreV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedConfigMap,
    k8sApi.createNamespacedConfigMap,
    k8sApi.replaceNamespacedConfigMap
  )(namespace, data, k8sApi);

export const createSecret = (
  namespace: string,
  data: V1ConfigMap,
  k8sApi: k8s.CoreV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedSecret,
    k8sApi.createNamespacedSecret,
    k8sApi.replaceNamespacedSecret
  )(namespace, data, k8sApi);

export const createJob = (
  namespace: string,
  data: V1Job,
  k8sApi: k8s.BatchV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedJob,
    k8sApi.createNamespacedJob,
    k8sApi.replaceNamespacedJob
  )(namespace, data, k8sApi);

export const createDaemonSet = (
  namespace: string,
  data: V1DaemonSet,
  k8sApi: k8s.AppsV1Api
) =>
  updateOrCreate(
    k8sApi.listNamespacedDaemonSet,
    k8sApi.createNamespacedDaemonSet,
    k8sApi.replaceNamespacedDaemonSet
  )(namespace, data, k8sApi);
