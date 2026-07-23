declare const process: {
  argv: readonly string[];
  stdin: unknown;
  stdout: unknown;
  exitCode?: number;
};

declare module 'node:readline/promises' {
  export type Interface = {
    question(query: string): Promise<string>;
    close(): void;
  };

  export function createInterface(options: {
    input: unknown;
    output: unknown;
  }): Interface;
}
