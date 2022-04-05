/*
 * move.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { existsSync as exists, promises } from 'fs';
const { rename, mkdir } = promises;
import { dirname } from 'path';

export default async function(src: string, dist: string) {
	const dir = dirname(dist);
	if ( !exists(dir) ) {
		await mkdir(dir, { recursive: true });
	}

	await rename(src, dist);
}
