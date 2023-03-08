const k8s = require('@kubernetes/client-node')
const core = require('@actions/core')

	(async function run() {
		const kc = new k8s.KubeConfig()
		console.log(kc)
		kc.loadFromString(core.getInput('k8sConfig', { required: true }))
		const appApi = kc.makeApiClient(k8s.AppsV1Api)

		appApi.createNamespacedDeployment('default', {
			metadata: {
				name: "slask",
			},
			spec: {
				replicas: 1,
				template: {
					spec: {
						containers: [
							{
								name: "slask1",
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
										memory: "18Mi",
									},
								},
							},
						],
					},
				},
			},
		}).then((res) => {
			console.log(res)
		})
	})()