import { copyFileSync, existsSync, realpathSync } from 'node:fs';
const source = new URL('../server/openapi.yaml', import.meta.url);
const target = new URL('../public/api-docs/openapi.yaml', import.meta.url);
// The checkout contains a symlink; archive-based deployments may contain a copy.
if (!existsSync(target) || realpathSync(source) !== realpathSync(target)) {
  copyFileSync(source, target);
}
