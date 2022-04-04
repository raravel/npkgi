/*
 * get.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import https from 'https';

export const get = (pkg: any) =>
	new Promise((resolve, reject) => {
		https.get(pkg.dist.tarball, (res) => {
			let rawData = Buffer.from('');
			res.on('data', (chunk) => { rawData = Buffer.concat([rawData, chunk]) });
			res.on('end', () => {
				pkg.targzData = rawData;
				resolve(pkg);
			});
		})
	});
