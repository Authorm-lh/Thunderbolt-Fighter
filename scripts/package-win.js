import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');
const { downloadArtifact } = require('@electron/get');
const APPROVED_RUNTIME_ASSET_EXTENSIONS = new Set(['.png', '.wav', '.mp3']);

const copyApprovedRuntimeAssets = async (sourceDir, targetDir) => {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await copyApprovedRuntimeAssets(sourcePath, targetPath);
        return;
      }

      if (!APPROVED_RUNTIME_ASSET_EXTENSIONS.has(path.extname(entry.name))) {
        return;
      }

      await mkdir(path.dirname(targetPath), { recursive: true });
      await cp(sourcePath, targetPath);
    })
  );
};

const main = async () => {
  const root = process.cwd();
  const appName = 'Thunderbolt Fighter';
  const releaseDir = path.join(root, 'release');
  const outputDir = path.join(releaseDir, `${appName}-win32-x64`);
  const appDir = path.join(outputDir, 'resources', 'app');
  const electronPackageDir = path.join(root, 'node_modules', 'electron');
  const electronDistDir = path.join(electronPackageDir, 'dist');
  const electronPathFile = path.join(electronPackageDir, 'path.txt');
  const electronExe = path.join(electronDistDir, 'electron.exe');

  const electronPackage = JSON.parse(await readFile(path.join(electronPackageDir, 'package.json'), 'utf8'));

  if (!existsSync(electronExe)) {
    const zipPath = await downloadArtifact({
      version: electronPackage.version,
      artifactName: 'electron',
      platform: 'win32',
      arch: 'x64',
      checksums: require('electron/checksums.json')
    });

    await rm(electronDistDir, { recursive: true, force: true });
    await mkdir(electronDistDir, { recursive: true });
    new AdmZip(zipPath).extractAllTo(electronDistDir, true);
  }

  if (!existsSync(electronExe)) {
    throw new Error(`Electron runtime was not found at ${electronExe}`);
  }

  await writeFile(electronPathFile, 'electron.exe');

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(appDir, { recursive: true });

  await cp(electronDistDir, outputDir, { recursive: true });
  await rm(path.join(outputDir, 'electron.exe'), { force: true });
  await cp(electronExe, path.join(outputDir, `${appName}.exe`));

  await cp(path.join(root, 'src'), path.join(appDir, 'src'), { recursive: true });
  await copyApprovedRuntimeAssets(
    path.join(root, 'assets', 'runtime'),
    path.join(appDir, 'assets', 'runtime')
  );
  await cp(path.join(root, 'package.json'), path.join(appDir, 'package.json'));
  await cp(path.join(root, 'node_modules', 'phaser'), path.join(appDir, 'node_modules', 'phaser'), {
    recursive: true
  });

  console.log(`Packaged ${appName} for Windows at ${path.relative(root, outputDir)}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
