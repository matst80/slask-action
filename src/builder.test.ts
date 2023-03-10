import { describe, it, expect } from "vitest";
import { DeploymentBuilder } from "./builder";

describe("Builder", () => {
  it("should build a simple deployment", () => {
    const labels = { app: "nginx" };
    const builder = new DeploymentBuilder("nginx", labels)
      .withVolume("config", (b) => b.withConfigMap("config"))
      .withContainer({ name: "nginx-web", image: "nginx:latest" }, (b) =>
        b.withPort(80, "http")
      )
      .withContainer({ name: "slask-api", image: "slask:latest" }, (b) =>
        b.withPort(3000, "rest")
      );

    expect(builder.build()).toEqual({
      metadata: {
        name: "nginx",
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
            volumes: [
              {
                name: "config",
                configMap: {
                  name: "config",
                },
              },
            ],
            containers: [
              {
                name: "nginx-web",
                image: `nginx:latest`,
                ports: [
                  {
                    name: "http",
                    containerPort: 80,
                  },
                ],
                resources: {},
              },
              {
                name: "slask-api",
                image: `slask:latest`,
                ports: [
                  {
                    name: "rest",
                    containerPort: 3000,
                  },
                ],
                resources: {},
              },
            ],
          },
        },
      },
    });
  });
});
