/*
 * install.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { query } from './query';
import { get } from './get';
import path from 'path';
import * as fs from 'fs';
import decompress from './tgz-decompress';
import move from './move';

export interface HookArgument {
	name: string;
	progress: string;
	data: any;
}

export interface InstallItem {
	name: string;
	version: string;
}

export interface InstallOptions {
	hook?: (s: HookArgument) => void;
	rootDir?: string;
}

export interface InstallArgument {
	name: string;
	version: string;
	hook: (s: HookArgument) => void;
	rootDir: string;
    tmpDir: string;
}

const hook = (opt: InstallArgument, arg: HookArgument) =>
	setImmediate(() => opt.hook(arg));

export async function install(args: InstallItem[], opt: InstallOptions) {
	const cwd = process.cwd();

    const rootDir = opt.rootDir || cwd;
    const hook = opt.hook || (() => {});
	const tmpDir = path.resolve(rootDir, '.npkgi-tmp');
	if ( !fs.existsSync(tmpDir) ) {
		fs.mkdirSync(tmpDir, { recursive: true });
	}

	await Promise.all(
		args.map((arg: InstallItem) =>
             _install({
				hook,
				rootDir,
				name: arg.name,
				version: arg.version,
                tmpDir,
			})
		)
	);

	fs.rmSync(tmpDir, { recursive: true });
}

export async function _install(options: InstallArgument) {
	hook(options, {
		name: 'query',
		progress: 'start',
		data: options,
	});
	const list = await query(options.name, options.version);
	hook(options, {
		name: 'query',
		progress: 'done',
		data: list,
	});
	const req = await Promise.all(
		Object.values(list)
		.map((pkg: any) => {
            async function i() {
                try {
                    hook(options, {
                        name: 'request',
                        progress: 'start',
                        data: pkg,
                    });
                    const d = await get(pkg);
                    hook(options, {
                        name: 'request',
                        progress: 'done',
                        data: pkg,
                    });
                    return d;
                } catch (err) {
                    hook(options, {
                        name: 'request',
                        progress: 'fail',
                        data: pkg,
                    });
                    return await i();
                }
            }
            return i();
		})
	);

	const writeQ = req.map(async (pkg: any) => {
		hook(options, {
			name: 'install',
			progress: 'start',
			data: pkg,
		});
		const target = path.resolve(options.tmpDir, pkg.name);
		const targetDir = path.dirname(target);
		const module = path.resolve((options.rootDir as string), 'node_modules', pkg.name);

		if ( fs.existsSync(module) ) {
			return;
		}
		if ( !fs.existsSync(targetDir) ) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

        fs.writeFileSync(target + '.tgz', pkg.targzData);
        await decompress(target + '.tgz', target);
        fs.rmSync(target + '.tgz');
        move(target, module);
		hook(options, {
			name: 'install',
			progress: 'done',
			data: pkg,
		});
	});

	await Promise.all(writeQ);

}
