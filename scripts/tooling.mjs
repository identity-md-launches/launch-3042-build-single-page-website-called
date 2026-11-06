// Normal installs resolve locally. The scratch fallback is for constrained build
// environments that must keep dependency installations outside the submission.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export function resolveTool(name) {
  try { return require.resolve(name); }
  catch { return require.resolve(name, { paths: [new URL('../test/scratch/tooling/', import.meta.url).pathname] }); }
}
export async function importTool(name) { const module = await import(resolveTool(name)); return module.default ?? module; }
