import * as k8s from "@kubernetes/client-node";
import { createDeployment, createService, createVolumeClaim } from "./apply";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
//const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

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
// const namespace = "solr";

// const handleClaimsError = (e: any) => {
//   if (e?.body?.code === 422) {
//     console.log("Volume claim already exists, and cannot be updated");
//   } else {
//     throw e;
//   }
// };

// createVolumeClaim(
//   namespace,
//   {
//     metadata: {
//       name: "solrcore-master",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         "app.kubernetes.io/instance": "solr",
//         instance_type: "master",
//         type: "solr",
//       },
//     },
//     spec: {
//       storageClassName: "nfs-client",
//       accessModes: ["ReadWriteOnce"],
//       resources: {
//         requests: {
//           storage: "1Gi",
//         },
//       },
//     },
//   },
//   k8sCoreApi
// ).catch(handleClaimsError);

// createVolumeClaim(
//   namespace,
//   {
//     metadata: {
//       name: "solrcore-slave",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         "app.kubernetes.io/instance": "solr",
//         instance_type: "slave",
//         type: "solr",
//       },
//     },
//     spec: {
//       storageClassName: "nfs-client",
//       accessModes: ["ReadWriteOnce"],
//       resources: {
//         requests: {
//           storage: "1Gi",
//         },
//       },
//     },
//   },
//   k8sCoreApi
// ).catch(handleClaimsError);

// createDeployment(
//   namespace,
//   {
//     metadata: {
//       name: "solr-master",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         instance_type: "master",
//         type: "solr",
//       },
//     },
//     spec: {
//       replicas: 1,
//       selector: {
//         matchLabels: {
//           "app.kubernetes.io/name": "solr-master",
//           "app.kubernetes.io/instance": "solr-master",
//         },
//       },
//       strategy: {
//         type: "Recreate",
//       },
//       template: {
//         metadata: {
//           labels: {
//             "app.kubernetes.io/name": "solr-master",
//             "app.kubernetes.io/instance": "solr-master",
//           },
//         },
//         spec: {
//           volumes: [
//             {
//               name: "solrcore",
//               persistentVolumeClaim: {
//                 claimName: "solrcore-master",
//               },
//             },
//           ],
//           containers: [
//             {
//               name: "hybris-solr",
//               image: "solr",
//               imagePullPolicy: "Always",
//               args: ["MASTER"],
//               volumeMounts: [
//                 {
//                   name: "solrcore",
//                   mountPath: "/opt/solr/server/solr/cores",
//                 },
//               ],
//               env: [
//                 {
//                   name: "SOLR_HEAP",
//                   value: "2G",
//                 },
//                 {
//                   name: "TZ",
//                   value: "Europe/Oslo",
//                 },
//                 {
//                   name: "LOG4J_FORMAT_MSG_NO_LOOKUPS",
//                   value: "true",
//                 },
//               ],
//               ports: [
//                 {
//                   name: "http-8983",
//                   containerPort: 8983,
//                 },
//               ],
//               livenessProbe: {
//                 httpGet: {
//                   path: "/solr/admin/info/system",
//                   port: 8983,
//                 },
//               },
//               readinessProbe: {
//                 httpGet: {
//                   path: "/solr/admin/info/system",
//                   port: 8983,
//                 },
//               },
//               resources: {
//                 limits: {
//                   memory: "64Mi",
//                 },
//                 requests: {
//                   memory: "18Mi",
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//   },
//   k8sApi
// );

// createDeployment(
//   namespace,
//   {
//     metadata: {
//       name: "solr-slave",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         instance_type: "slave",
//         type: "solr",
//       },
//     },
//     spec: {
//       replicas: 1,
//       selector: {
//         matchLabels: {
//           "app.kubernetes.io/name": "solr-slave",
//           "app.kubernetes.io/instance": "solr-slave",
//         },
//       },
//       strategy: {
//         type: "Recreate",
//       },
//       template: {
//         metadata: {
//           labels: {
//             "app.kubernetes.io/name": "solr-slave",
//             "app.kubernetes.io/instance": "solr-slave",
//           },
//         },
//         spec: {
//           volumes: [
//             {
//               name: "solrcore",
//               persistentVolumeClaim: {
//                 claimName: "solrcore-slave",
//               },
//             },
//           ],
//           containers: [
//             {
//               name: "hybris-solr",
//               image: "solr",
//               imagePullPolicy: "Always",
//               args: ["SLAVEOF:solr-master:8983"],
//               volumeMounts: [
//                 {
//                   name: "solrcore",
//                   mountPath: "/opt/solr/server/solr/cores",
//                 },
//               ],
//               env: [
//                 {
//                   name: "SOLR_HEAP",
//                   value: "2G",
//                 },
//                 {
//                   name: "TZ",
//                   value: "Europe/Oslo",
//                 },
//                 {
//                   name: "LOG4J_FORMAT_MSG_NO_LOOKUPS",
//                   value: "true",
//                 },
//               ],
//               ports: [
//                 {
//                   name: "http-8983",
//                   containerPort: 8983,
//                 },
//               ],
//               livenessProbe: {
//                 httpGet: {
//                   path: "/solr/admin/info/system",
//                   port: 8983,
//                 },
//               },
//               readinessProbe: {
//                 httpGet: {
//                   path: "/solr/admin/info/system",
//                   port: 8983,
//                 },
//               },
//               resources: {
//                 limits: {
//                   memory: "64Mi",
//                 },
//                 requests: {
//                   memory: "16Mi",
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//   },
//   k8sApi
// );

// createService(
//   namespace,
//   {
//     metadata: {
//       name: "solr-master",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         "app.kubernetes.io/instance": "solr",
//         instance_type: "master",
//         type: "solr",
//       },
//     },
//     spec: {
//       type: "ClusterIP",
//       ports: [
//         {
//           port: 8983,
//           targetPort: 8983,
//           protocol: "TCP",
//           name: "http-8983",
//         },
//       ],
//       selector: {
//         "app.kubernetes.io/name": "solr-master",
//         "app.kubernetes.io/instance": "solr-master",
//       },
//     },
//   },
//   k8sCoreApi
// );

// createService(
//   namespace,
//   {
//     metadata: {
//       name: "solr-slave",
//       labels: {
//         "app.kubernetes.io/name": "solr",
//         "app.kubernetes.io/instance": "solr",
//         instance_type: "slave",
//         type: "solr",
//       },
//     },
//     spec: {
//       type: "ClusterIP",
//       ports: [
//         {
//           port: 8983,
//           targetPort: 8983,
//           protocol: "TCP",
//           name: "http-8983",
//         },
//       ],
//       selector: {
//         "app.kubernetes.io/name": "solr-slave",
//         "app.kubernetes.io/instance": "solr-slave",
//       },
//     },
//   },
//   k8sCoreApi
// );
