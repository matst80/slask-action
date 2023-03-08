/** @type {import('./types').DeploymentConfig} */
module.exports = ({ createDeployment, createService }) => {
	const namespace = 'default'
	createDeployment(namespace,
		{
			metadata: {
				name: "slask2",
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
		})
}