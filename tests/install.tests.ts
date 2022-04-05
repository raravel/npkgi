import { install } from '../src';

(async () => {
	await install({
		name: '@sopia-bot/core',
		version: 'latest',
		rootDir: __dirname,
		hook: console.log,
	});
})();
