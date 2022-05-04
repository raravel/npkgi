/*
 * query.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import napi from './napi';
import https from 'https';

function request(url: string): Promise<Buffer> {
    return new Promise((resolve, rejectg) => {
        https.get(url, (res) => {
            let rawData = Buffer.from('');
            res.on('data', (chunk) => { rawData = Buffer.concat([rawData, chunk]) });
            res.on('end', () => {
                resolve(rawData);
            });
        });
    });
}

function isNumString(str: string) {
    return !Number.isNaN(parseInt(str, 10));
}

export async function query(name: string, version: string, repos: any = {}) {
    const m: any = version.match(new RegExp(`^npm:(.*?)(\\d.*)`));
    if ( m && m[1] && m[2] ) {
        name = m[1].replace(/\^|@|~/g, '');
        version = m[2];
    }

    let pkg: any = null;
    pkg = JSON.parse((await request(`https://registry.npmjs.org/${name}`))
            .toString('utf8'));
    const versions = Object.keys(pkg.versions).filter((v) => {
        v = v.replace(/\^|@|~/g, '');
        const vs = v.split('.');
        const verDot = version
            .replace(/\^|@|~/g, '')
            .split('.');

        if ( verDot[0].match(/^>=/) ) {
            verDot[0] = verDot[0].replace(/>=/, '');
            verDot[1] = '*';
        }

        for ( let i = 0; i < vs.length;i++ ) {
            if ( vs[i] && verDot[i] ) {
                if ( verDot[i] === '*' ) {
                    return true;
                }

                if ( isNumString(vs[i]) && verDot[i] === 'x' ) {
                    return true;
                }

                if ( vs[i] !== verDot[i] ) {
                    return false;
                }
            }
        }

        return true;
    });
    if ( versions.length === 0 ) {
        versions.push(pkg['dist-tags'].latest);
    }
    const v = versions[versions.length - 1];
    pkg = pkg.versions[v];
    repos[name] = pkg;
	const Q: any[] = [];
	if ( pkg.dependencies ) {
		for ( let [depName, depVer] of Object.entries(pkg.dependencies) as any ) {
			//depVer = depVer.replace(/\^|@|~/g, '');
			if ( !repos[depName] ) {
				Q.push(query(depName, depVer, repos));
			}
		}
	}
    if ( Q.length ) await Promise.all(Q);
	return repos;
}
