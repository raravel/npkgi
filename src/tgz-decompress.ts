/*
 * tgz-decompress.ts
 * Created on Mon Apr 04 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import decompress from 'decompress';
import targz from 'decompress-targz';

export default async function(src: string, dist: string) {
    return await decompress(src, dist, {
        plugins: [
            targz(),
        ],
        map: (file) => {
            file.path = file.path.replace(/^package\//, '');
            return file;
        },
    });
}
