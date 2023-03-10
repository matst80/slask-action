import {
  V1Container,
  V1ContainerPort,
  V1Deployment,
  V1Volume,
} from "@kubernetes/client-node";

export class DeploymentContainerBuilder {
  #ports: V1ContainerPort[] = [];
  #result: V1Container;
  constructor(
    private readonly builder: DeploymentBuilder,
    name: string,
    image: string
  ) {
    this.#result = { name, image, resources: {} };
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
  withVolume(name: string): VolumeBuilder {
    const volumeBuilder = new VolumeBuilder(this, name);
    this.#volumes.push(volumeBuilder);
    return volumeBuilder;
  }
  withContainer(name: string, image: string): DeploymentContainerBuilder {
    const podBuilder = new DeploymentContainerBuilder(this, name, image);
    this.#pods.push(podBuilder);
    return podBuilder;
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
