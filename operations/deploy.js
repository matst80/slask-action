/** @type {import('../src/types').DeploymentConfig} */
module.exports = async ({ createDeployment, createService }, { sha }) => {
	const namespace = 'default'
	const labels = { app: 'slask' }
	// const shortSha = sha.slice(0, 7)
	await createDeployment(namespace,
		{
			metadata: {
				name: "slask-nginx",
				labels,
			},
			spec: {
				replicas: 1,
				selector: {
					matchLabels: labels,
				},
				template: {
					metadata: {
						labels,
					},
					spec: {
						containers: [
							{
								name: "slask2",
								image: `nginx`,
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
	await createService(namespace, {
		metadata: {
			name: "slask",
		},
		spec: {
			selector: labels,
			ports: [
				{
					name: "http",
					port: 80,
				}
			]
		}
	})
}