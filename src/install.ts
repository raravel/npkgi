/*
 * install.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { query } from './query';
import { get } from './get';
import path from 'path';
import fs from 'fs/promises';
import { existsSync as exists } from 'fs';
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
}

const hook = (opt: InstallArgument, arg: HookArgument) =>
	setImmediate(() => opt.hook(arg));

export function install(args: InstallItem[], opt: InstallOptions) {
	const cwd = process.cwd();
	return Promise.all(
		args.map((arg: InstallItem) => {
			const hook = opt.hook || (() => {});
			return _install({
				hook,
				rootDir: opt.rootDir || cwd,
				name: arg.name,
				version: arg.version,
			})
		})
	);
}

export async function _install(options: InstallArgument) {
	hook(options, {
		name: 'query',
		progress: 'start',
		data: null,
	});
	const list = await query(options.name, options.version);
	hook(options, {
		name: 'query',
		progress: 'done',
		data: list,
	});
	const req = await Promise.all(
		Object.values(list)
		.map(async (pkg: any) => {
			hook(options, {
				name: 'request',
				progress: 'start',
				data: pkg,
			});
			const d = await get(pkg)
			hook(options, {
				name: 'request',
				progress: 'done',
				data: pkg,
			});
			return d;
		})
	);

	const tmpDir = path.resolve((options.rootDir as string), '.npkgi-tmp');
	if ( !exists(tmpDir) ) {
		await fs.mkdir(tmpDir, { recursive: true });
	}

	const writeQ = req.map(async (pkg: any) => {
		hook(options, {
			name: 'install',
			progress: 'start',
			data: pkg,
		});
		const target = path.resolve(tmpDir, pkg.name);
		const targetDir = path.dirname(target);
		const module = path.resolve((options.rootDir as string), 'node_modules', pkg.name);

		if ( exists(module) ) {
			return;
		}
		if ( !exists(targetDir) ) {
			await fs.mkdir(targetDir, { recursive: true });
		}

		await fs.writeFile(target + '.tgz', pkg.targzData);
		await decompress(target + '.tgz', target);
		await fs.rm(target + '.tgz');
		await move(target, module);
		hook(options, {
			name: 'install',
			progress: 'done',
			data: pkg,
		});
	});

	await Promise.all(writeQ);
	await fs.rmdir(tmpDir, { recursive: true });

}
