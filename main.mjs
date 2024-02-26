import { spawn } from 'node:child_process';

const archMap = {ia32: '386', x64: 'amd64'};
const platformMap = {win32: 'windows'};

async function main() {
    const version = getVersionInput();
    const arch = archMap[process.arch] || process.arch;
    const platform = platformMap[process.platform] || process.platform;
    const urlBase = `https://dl.elv.sh/${platform}-${arch}/elvish-${version}`;
    // https://github.com/elves/elvish/commit/deec3c06b2a7d4ba9c4ac01edc90bdca7844c143
    // change the binary name within the archive to be just "elvish" or
    // "elvish.exe"; before that the name was elvish-${version} or
    // elvish-${version}.exe. Handle both cases.
    if (platform === 'windows') {
        await run('pwsh', '-c',
            `
            md C:\\elvish
            echo C:\\elvish >> $Env:GITHUB_PATH
            cd C:\\elvish
            Invoke-RestMethod -Uri '${urlBase}.zip' -OutFile elvish.zip
            Expand-Archive elvish.zip -DestinationPath .
            rm elvish.zip
            if (!Test-Path elvish.exe -PathType leaf) {
              Rename-Item -Path elvish-${version}.exe -NewName elvish.exe
            }
            `);
    } else {
        await run('sh', '-c',
            `
            cd /usr/local/bin
            curl -o- ${urlBase}.tar.gz | tar xz
            if ! test -f elvish; then
              mv elvish-${version} elvish
            fi
            `);
    }
}

function getVersionInput() {
    const version = process.env['INPUT_ELVISH-VERSION'];
    if (!version) {
        throw new Error('The version input must not be empty');
    }
    return /^\d/.test(version) ? 'v' + version : version;
}

function run(cmd, ...args) {
    const p = spawn(cmd, args, {stdio: 'inherit'});
    return new Promise((resolve, reject) => {
        let errored = false;
        p.on('error', (err) => {
            errored = true;
            reject(err);
        });
        p.on('exit', (code, signal) => {
            if (errored) {
                return;
            }
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Exited with ${code} (signal: ${signal})`));
            }
        });
    });
}

await main();
