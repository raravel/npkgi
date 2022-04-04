/*
 * query.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import napi from './napi';

export async function query(name: string, version: string, repos: any = {}) {
	const repo = napi.repo(name);
	version = version.replace(/\^|@|~/g, '');
	const pkg = await repo.version(version);
	repos[name] = pkg;
	const Q: any[] = [];
	if ( pkg.dependencies ) {
		for ( let [depName, depVer] of Object.entries(pkg.dependencies) as any ) {
			depVer = depVer.replace(/\^|@|~/g, '');
			if ( !repos[depName] ) {
				Q.push(query(depName, depVer, repos));
			}
		}
	}
	await Promise.all(Q);
	return repos;
}
