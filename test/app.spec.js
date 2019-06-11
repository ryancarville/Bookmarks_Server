const app = require('../src/app');

describe('App', () => {
	const apiKey = 'Bearer ' + process.env.API_TOKEN;
	it('GET / responds with 200 containing "Hello, boilerplate!"', () => {
		return supertest(app)
			.get('/')
			.set('Authorization', apiKey)
			.expect(200, 'Hello, boilerplate!');
	});
});
