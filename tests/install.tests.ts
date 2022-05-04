import { install } from '../src';

(async () => {
	await install([
        { name: '@arkiv/zip', version: '^1.1.10' },
        { name: '@sopia-bot/api-dto', version: '^1.0.1' },
        { name: '@sopia-bot/core', version: '^2.2.4' },
        { name: '@types/hls.js', version: '^1.0.0' },
        { name: 'axios', version: '^0.19.2' },
        { name: 'cfg-lite', version: '^1.1.3' },
	], {
		rootDir: __dirname,
        hook: (evt) => {
            console.log(evt.name, evt.progress, evt?.data?.name);
        },
	});
})();
