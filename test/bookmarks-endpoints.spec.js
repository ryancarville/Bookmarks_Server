const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const bookmarks = require('../src/bookmarks/bookmark');
const { makeBookmarksArray } = require('./bookmarks.fixtures');
const supertest = require('supertest');

describe.only('Bookmarks endpoints', () => {
	let db;

	before('make knexInstance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL
		});
		app.set('db', db);
	});

	after('disconnect', () => {
		db.destroy();
	});

	before('clean the table', () => {
		db('bookmarks').truncate();
	});

	afterEach('cleanup', () => {
		db('bookmarks').truncate();
	});

	describe('GET /bookmarks', () => {
		context('Given database is empty', () => {
			it('response with 200 and empty []', () => {
				const apiKey = 'Bearer ' + process.env.API_TOKEN;
				const options = {
					header: { Authorization: apiKey }
				};
				return supertest(app)
					.get('/bookmarks')
					.auth(options)
					.expect(200, []);
			});
		});
	});
});
