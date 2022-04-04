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

export async function install(options: any) {
	if ( typeof options.hook !== 'function' ) {
		options.hook = () => {};
	}
	options.hook({
		name: 'query',
		progress: 'start',
	});
	const list = await query(options.name, options.version);
	options.hook({
		name: 'query',
		progress: 'done',
		data: list,
	});
	const req = await Promise.all(
		Object.values(list)
		.map(async (pkg: any) => {
			options.hook({
				name: 'request',
				progress: 'start',
				data: pkg,
			});
			const d = await get(pkg)
			options.hook({
				name: 'request',
				progress: 'done',
				data: pkg,
			});
			return d;
		})
	);

	if ( !options.rootDir ) {
		options.rootDir = process.cwd();
	}

	const tmpDir = path.resolve(options.rootDir, '.npkgi-tmp');
	if ( !exists(tmpDir) ) {
		await fs.mkdir(tmpDir, { recursive: true });
	}

	const writeQ = req.map(async (pkg: any) => {
		options.hook({
			name: 'install',
			progress: 'start',
			data: pkg,
		});
		const target = path.resolve(tmpDir, pkg.name);
		const targetDir = path.dirname(target);
		const module = path.resolve(options.rootDir, 'node_modules', path.basename(target));

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
		options.hook({
			name: 'install',
			progress: 'done',
			data: pkg,
		});
	});

	await Promise.all(writeQ);

}
