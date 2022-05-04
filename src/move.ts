/*
 * move.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { existsSync as exists, renameSync as rename, mkdirSync as mkdir } from 'fs';
import { dirname } from 'path';

export default function(src: string, dist: string) {
	const dir = dirname(dist);
	if ( !exists(dir) ) {
		mkdir(dir, { recursive: true });
	}

	rename(src, dist);
}
