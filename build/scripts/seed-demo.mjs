import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = resolve(root, 'setup/scripts/SeedBenefitsDemo.js');
const source = resolve(root, 'src/setup/scripts/SeedBenefitsDemo.ts');

// The production image has compiled JavaScript but intentionally no tsx/dev dependencies.
if (existsSync(compiled)) {
    process.chdir(root);
    try {
        const {runSeedBenefitsDemo} = await import(pathToFileURL(compiled).href);
        await runSeedBenefitsDemo();
    } catch {
        console.error('No se pudo completar el seed de demo. Revisá MongoDB, assets y permisos de escritura.');
        process.exitCode = 1;
    }
} else if (existsSync(source)) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', source], {cwd: root, stdio: 'inherit', env: process.env});
    if (result.error) console.error('No se pudo ejecutar el seed. Verificá las dependencias de desarrollo.');
    process.exitCode = result.status ?? 1;
} else {
    console.error('No se encontró el seed de demo. Volvé a compilar y desplegar el backend completo.');
    process.exitCode = 1;
}
