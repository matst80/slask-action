import {
  V1Container,
  V1ContainerPort,
  V1Deployment,
  V1ResourceRequirements,
  V1Volume,
} from "@kubernetes/client-node";

export class DeploymentContainerBuilder {
  #ports: V1ContainerPort[] = [];
  #result: V1Container;
  constructor(
    private readonly builder: DeploymentBuilder,
    containerDefaults: {
      name: string;
      image: string;
      resources?: V1ResourceRequirements;
    }
  ) {
    this.#result = { resources: {}, ...containerDefaults };
  }
  withPort(containerPort: number, name?: string): DeploymentContainerBuilder {
    if (name) this.#ports.push({ containerPort, name });
    else this.#ports.push({ containerPort });
    return this;
  }
  build(): DeploymentBuilder {
    return this.builder;
  }
  asContainer() {
    return {
      ...this.#result,
      ports: this.#ports,
    };
  }
}

export class VolumeBuilder {
  #name: string;
  #result: V1Volume;
  constructor(private readonly builder: DeploymentBuilder, name: string) {
    this.#name = name;
  }
  withConfigMap(name: string): VolumeBuilder {
    this.#result = {
      name: this.#name,
      configMap: {
        name,
      },
    };
    return this;
  }
  build(): DeploymentBuilder {
    return this.builder;
  }
  asVolume() {
    return this.#result;
  }
}

export class DeploymentBuilder {
  #name: string;
  #labels: Record<string, string>;
  #replicas: number = 1;
  #volumes: VolumeBuilder[] = [];
  #pods: DeploymentContainerBuilder[] = [];
  constructor(name: string, labels: Record<string, string> = { app: name }) {
    this.#name = name;
    this.#labels = labels;
  }
  withReplicas(replicas: number): DeploymentBuilder {
    this.#replicas = replicas;
    return this;
  }
  withVolume(
    name: string,
    fn: (builder: VolumeBuilder) => void
  ): DeploymentBuilder {
    const volumeBuilder = new VolumeBuilder(this, name);
    this.#volumes.push(volumeBuilder);
    fn(volumeBuilder);
    return this;
  }
  withContainer(
    container: { name: string; image: string },
    fn: (builder: DeploymentContainerBuilder) => void
  ): DeploymentBuilder {
    const podBuilder = new DeploymentContainerBuilder(this, container);
    this.#pods.push(podBuilder);
    fn(podBuilder);
    return this;
  }
  build(): V1Deployment {
    return {
      metadata: { name: this.#name, labels: this.#labels },
      spec: {
        replicas: this.#replicas,
        selector: { matchLabels: this.#labels },
        template: {
          metadata: { labels: this.#labels },
          spec: {
            volumes: this.#volumes.map((volume) => volume.asVolume()),
            containers: this.#pods.map((pod) => pod.asContainer()),
          },
        },
      },
    };
  }
}
