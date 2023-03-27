/** @type {import('./src/types').DeploymentConfig} */
module.exports = async (k8s, ctx, { get, getAll }) => {
	const namespace = "default"
	const labels = { app: 'nginx' }
	const kv = await getAll()
	await k8s.createSecret(namespace, {
		metadata: {
			name: 'test-secret',
		},
		stringData: kv
	})
	await k8s.createDeployment(namespace, {
		metadata: {
			name: 'nginx-deployment',
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
							name: 'nginx',
							env: [
								{ name: 'TEST', value: await get('first') }
							],
							image: 'nginx:latest',
							ports: [
								{
									containerPort: 80,
								},
							],
						},
					],
				},
			},
		},
	})
}