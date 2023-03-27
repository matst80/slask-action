import { join } from "path";
export const getCommandAndArguments = (processArgs: string[]) => {
  const [, , fileOrCommand, ...rest] = processArgs;

  const values = Object.fromEntries(
    rest.filter((d) => d.includes("=")).map((arg) => arg.split("="))
  );
  const args = rest.filter((d) => !d.includes("="));
  const secretsFile = join(process.cwd(), values["--secrets-file"] ?? ".slask");
  const common = {
    values,
    args,
    secretsFile,
  };
  if (fileOrCommand == "print-env") {
    return {
      ...common,
      command: "print-env",
      file: "",
    };
  }
  if (fileOrCommand == "set") {
    return {
      ...common,
      command: "set",
      file: "",
    };
  } else if (fileOrCommand == "set-secret") {
    return {
      command: "set",
      ...common,
      file: "",
    };
  }

  return {
    ...common,
    command: "slask",
    file: join(process.cwd(), fileOrCommand),
  };
};
export const getOptions = (
  file: string,
  args: string[],
  values: Record<string, string>
) => {
  const sha = require("child_process")
    .execSync("git rev-parse HEAD")
    .toString()
    .trim();
  const argOptions = args[0] ? JSON.parse(args[0] ?? "{}") : {};
  return { job: "manual trigger via cli", sha, ...argOptions, ...values };
};
