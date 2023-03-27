import crypto from "node:crypto";
import { readFile, writeFile } from "fs/promises";

const algorithm = "aes-256-ctr";

type EncodedData = {
  iv: string;
  content: string;
};

export type SecretEncoder = {
  encrypt: (text: string) => EncodedData;
  decrypt: (data: EncodedData) => string;
};

export const secretFactory = (
  secretKeyBytes?: string | null
): SecretEncoder => {
  const requireSecretKey = () => {
    if (!secretKeyBytes || secretKeyBytes.length < 32) {
      throw Error("Encryptionkey for secrets is missing or invalid");
    }
    return secretKeyBytes;
  };
  return {
    encrypt(text) {
      const secretKey = requireSecretKey();
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

      const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

      return {
        iv: iv.toString("hex"),
        content: encrypted.toString("hex"),
      };
    },
    decrypt(hash) {
      const secretKey = requireSecretKey();
      const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(hash.iv, "hex")
      );

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, "hex")),
        decipher.final(),
      ]);

      return decrypted.toString();
    },
  };
};

const dataToString = (data: EncodedData) => {
  return `${Buffer.from(data.iv).toString("base64")}:${Buffer.from(
    data.content
  ).toString("base64")}`;
};

const stringToData = (data: string): EncodedData => {
  const [iv, content] = data
    .split(":")
    .map((data) => Buffer.from(data, "base64").toString("utf-8"));
  return { iv, content };
};

const SECRET_KEY = "_secret__";

export const secretStorageFactory = (
  file: string,
  { decrypt, encrypt }: SecretEncoder
) => {
  let entries: Record<string, string> | undefined;
  const getFileContents = (): Promise<Record<string, string>> => {
    if (entries) {
      return Promise.resolve(entries);
    }
    return readFile(file, "utf-8")
      .then((text) =>
        text
          .split("\n")
          .map((d) => d.trim())
          .map((line) => {
            const [key, ...rest] = line.split("=");
            return [key, rest.join("=")];
          })
      )
      .then((keys) => {
        entries = Object.fromEntries(keys);
        return entries ?? {};
      });
  };
  const save = async (data: Record<string, string>) => {
    entries = { ...(entries ?? (await getFileContents())), ...data };
    return writeFile(
      file,
      Object.entries(entries)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n"),
      "utf-8"
    );
  };
  return {
    get: async (key: string) => {
      const ent = await getFileContents();
      const value = ent[key];
      if (value && value.indexOf(SECRET_KEY) == 0) {
        const secretData = value.substring(SECRET_KEY.length);
        const data = stringToData(secretData);
        return decrypt(data);
      }
      return value;
    },
    set: (key: string, value: string) => {
      return save({ [key]: value });
    },
    getAll: async () => {
      const ent = await getFileContents();
      return Object.fromEntries(
        Object.entries(ent).map(([key, value]) => {
          if (value && value.indexOf(SECRET_KEY) == 0) {
            const secretData = value.substring(SECRET_KEY.length);
            const data = stringToData(secretData);
            return [key, decrypt(data)];
          }
          return [key, value];
        })
      );
    },
    setSecret: async (key: string, value: string) => {
      return save({ [key]: SECRET_KEY + dataToString(encrypt(value)) });
    },
  };
};
