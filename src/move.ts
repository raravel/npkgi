/*
 * move.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { rename, mkdir } from 'fs/promises';
import { existsSync as exists } from 'fs';
import { dirname } from 'path';

export default async function(src: string, dist: string) {
	const dir = dirname(dist);
	if ( !exists(dir) ) {
		await mkdir(dir, { recursive: true });
	}

	await rename(src, dist);
}
