import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

export function loadModule(path: string, dependencies: Record<string, unknown>) {
  const source = readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  } }).outputText;
  const exports: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  new Function("require", "exports", code)((name: string) => {
    if (name in dependencies) return dependencies[name];
    if (name.startsWith("node:")) return require(name);
    throw new Error("Unmocked dependency: " + name);
  }, exports);
  return exports;
}

export interface Query {
  table: string;
  action: string;
  value?: unknown;
  filters: Record<string, unknown>;
}

export function mockDatabase(respond: (query: Query) => unknown) {
  const queries: Query[] = [];
  return { queries, from(table: string) {
    const record: Query = { table, action: "select", filters: {} };
    queries.push(record);
    const query: Record<string, unknown> = {};
    for (const method of ["select", "eq", "in", "is", "or", "lte", "gte", "not", "limit", "order", "insert", "update", "upsert"]) {
      query[method] = (key: string | unknown, value: unknown) => {
        if (["insert", "update", "upsert"].includes(method)) { record.action = method; record.value = key; }
        if (["eq", "in", "is"].includes(method)) record.filters[String(key)] = value;
        if (method === "or") record.filters.or = key;
        return query;
      };
    }
    query.then = (resolve: (value: unknown) => unknown) => Promise.resolve(respond(record)).then(resolve);
    query.single = query.maybeSingle = () => Promise.resolve(respond(record));
    return query;
  } };
}
