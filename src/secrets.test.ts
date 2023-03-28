import { describe, it, expect } from "vitest";
import { secretFactory, secretStorageFactory } from "./secrets";

describe("secrets", () => {
  it("should encrypt and decrypt", () => {
    const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
    const { encrypt, decrypt } = secretFactory(secretKey);

    const input = "slask secret!";

    const values = encrypt(input);
    const output = decrypt(values);
    expect(output).toBe(input);
  });
});

describe("secrets", () => {
  it("should fail if secretkey is missing", async () => {
    const secrets = secretFactory(undefined);
    const fail = () => secrets.encrypt("slask");
    expect(fail).toThrowError();
  });
  it("should store values to repo-file", async () => {
    const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
    const secretHandler = secretFactory(secretKey);
    const secretStorage = secretStorageFactory("./.slask", secretHandler);

    const input = "slask secret=234=234234!";

    await secretStorage.set("unsafe", input);

    const output = await secretStorage.get("unsafe");

    expect(output).toBe(input);
  });

  it("should encrypt and decrypt repo-file", async () => {
    const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
    const secretHandler = secretFactory(secretKey);
    const secretStorage = secretStorageFactory("./.slask", secretHandler);

    const input = "slask secret!";

    await secretStorage.setSecret("first", input);

    const output = await secretStorage.get("first");

    expect(output).toBe(input);
  });

  it("should fail with incorrect secret repo-file", async () => {
    const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwazfr3";
    const secretHandler = secretFactory(secretKey);
    let secretStorage = secretStorageFactory("./.slask", secretHandler);

    const input = "slask secret!";

    const output = await secretStorage.get("first");

    expect(output).not.toBe(input);
  });

  it.skip("should get all keys", async () => {
    const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
    const secretHandler = secretFactory(secretKey);
    const secretStorage = secretStorageFactory("./.slask", secretHandler);

    const output = await secretStorage.getAll();

    expect(output).toEqual({
      unsafe: "slask secret=234=234234!",
      first: "slask secret!",
    });
  });
});
