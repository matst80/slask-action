/** @type {import('../src/types').DeploymentConfig} */
module.exports = async ({ createDeployment, createService, createIngress }, { sha }) => {
	const namespace = 'default'
	const labels = { app: 'yaml-converter' }
	// const shortSha = sha.slice(0, 7)

	await createDeployment(namespace,
		{
			metadata: {
				name: 'yaml-converter',
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
						imagePullSecrets: [
							{
								name: 'regcred',
							},
						],
						containers: [
							{
								name: "converter",
								image: 'registry.knatofs.se/yaml-converter:latest',
								imagePullPolicy: "Always",
								ports: [
									{
										containerPort: 8080,
									},
								],
								resources: {
									requests: {
										memory: "40Mi",
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
			name: "yaml-converter",
		},
		spec: {
			selector: labels,
			ports: [
				{
					port: 8080,
				}
			]
		}
	})
	await createIngress(namespace, {
		metadata: {
			name: "yaml-converter",
		},
		spec: {
			ingressClassName: "nginx",
			rules: [
				{
					host: "yaml-converter.knatofs.se",
					http: {
						paths: [
							{
								path: "/",
								pathType: "Prefix",
								backend: {
									service: {
										name: "yaml-converter",
										port: {
											number: 8080,
										},
									},
								},
							},
						],
					},
				},
			],
		},
	})
}