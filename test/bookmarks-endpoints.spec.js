const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');
const supertest = require('supertest');

describe.only('Bookmarks endpoints', () => {
	let db;
	const apiKey = 'Bearer ' + process.env.API_TOKEN;
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

	before('clean the table', () => db('bookmarks').truncate());

	afterEach('cleanup', () => db('bookmarks').truncate());

	describe('GET /bookmarks', () => {
		context('Given database is empty', () => {
			it('response with 200 and empty []', () => {
				return supertest(app)
					.get('/bookmarks')
					.set('Authorization', apiKey)
					.expect(200, []);
			});
		});
		context('Given database has data', () => {
			const testBookmarks = makeBookmarksArray();
			beforeEach('insert bookmarks', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});

			it('GET /bookmarks resolve 200 and all bookmarks', () => {
				return supertest(app)
					.get('/bookmarks')
					.set('Authorization', apiKey)
					.expect(200, testBookmarks);
			});
		});
	});
	describe('GET /bookmarks/:bookmark_id', () => {
		context('Given database has no data', () => {
			it('resolves with 404 error', () => {
				const bookmarkId = 1234456;
				return supertest(app)
					.get(`/bookmarks/${bookmarkId}`)
					.set('Authorization', apiKey)
					.expect(404, 'Bookmark Not Found');
			});
		});
		context('Given the bookmarks exists', () => {
			const testBookmarks = makeBookmarksArray();
			beforeEach('insert bookmarks', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});
			it('resolves with 200 and with the bookmark reqested', () => {
				const bookmarkId = 3;
				const expectedBookmark = testBookmarks[bookmarkId - 1];
				return supertest(app)
					.get(`/bookmarks/${bookmarkId}`)
					.set('Authorization', apiKey)
					.expect(200, expectedBookmark);
			});
		});
	});
});
