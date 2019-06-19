const knex = require('knex');
const app = require('../src/app');
const {
	makeBookmarksArray,
	makeMaliciousBookmark
} = require('./bookmarks.fixtures');

describe('Bookmarks endpoints', () => {
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
		context('Given a XSS attack bookmark', () => {
			const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

			beforeEach('insert malicious bookmark', () => {
				return db.into('bookmarks').insert([maliciousBookmark]);
			});

			it('removes XSS attack content', () => {
				return supertest(app)
					.get('/bookmarks')
					.set('Authorization', apiKey)
					.expect(res => {
						expect(res.body[0].title).to.eql(expectedBookmark.title);
						expect(res.body[0].description).to.eql(
							expectedBookmark.description
						);
					});
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
					.expect(404, { error: { message: `Bookmark doesn't exist` } });
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
		context('Given a XSS attack bookmark', () => {
			const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

			beforeEach('insert malicious bookmark', () => {
				return db.into('bookmarks').insert([maliciousBookmark]);
			});

			it('removes XSS attack content', () => {
				return supertest(app)
					.get(`/bookmarks/${maliciousBookmark.id}`)
					.set('Authorization', apiKey)
					.expect(200)
					.expect(res => {
						expect(res.body.title).to.eql(expectedBookmark.title);
						expect(res.body.description).to.eql(expectedBookmark.description);
					});
			});
		});
	});
	describe('POST /bookmarks', () => {
		it('Creates new Bookmark responding with 201', () => {
			const newBookmark = {
				title: 'Test new bookmark',
				url: 'https://www.testnewbookmark.com',
				description: 'Test new bookmark description...',
				rating: 5
			};
			return supertest(app)
				.post('/bookmarks')
				.set('Authorization', apiKey)
				.send(newBookmark)
				.expect(201)
				.expect(res => {
					expect(res.body.title).to.eql(newBookmark.title);
					expect(res.body.url).to.eql(newBookmark.url);
					expect(res.body.description).to.eql(newBookmark.description);
					expect(res.body.rating).to.eql(newBookmark.rating);
					expect(res.body).to.have.property('id');
					expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
				});
		});

		const requiredFields = ['title', 'url', 'rating'];

		requiredFields.forEach(field => {
			const newBookmark = {
				title: 'Test new bookmark title',
				url: 'https://www.newBookmarkUrl.com',
				description: 'Test new bookmark descritpion...',
				rating: 5
			};

			it(`responds with 400 when '${field}' is missing`, () => {
				delete newBookmark[field];

				return supertest(app)
					.post('/bookmarks')
					.set('Authorization', apiKey)
					.send(newBookmark)
					.expect(400, {
						error: { message: `Missing '${field}' in request body` }
					});
			});
		});

		it('removes XSS attack content from response', () => {
			const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

			return supertest(app)
				.post('/bookmarks')
				.set('Authorization', apiKey)
				.send(maliciousBookmark)
				.expect(201)
				.expect(res => {
					expect(res.body.title).to.eql(expectedBookmark.title);
					expect(res.body.description).to.eql(expectedBookmark.description);
				});
		});
	});

	describe('DELETE /bookmarks/:bookmark_id', () => {
		context('Given no bookmarks', () => {
			it('responds with 404', () => {
				const bookmarkId = 123456;
				return supertest(app)
					.delete(`/bookmarks/${bookmarkId}`)
					.set('Authorization', apiKey)
					.expect(404, { error: { message: `Bookmark doesn't exist` } });
			});
		});
		context('Given there are bookmarks in the database', () => {
			const testBookmarks = makeBookmarksArray();

			beforeEach('insert test bookmarks', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});

			it('responds with 200 and removes the bookmarks', () => {
				const idToRemove = 2;
				const expectedBookmarks = testBookmarks.filter(
					bookmark => bookmark.id !== idToRemove
				);
				return supertest(app)
					.delete(`/bookmarks/${idToRemove}`)
					.set('Authorization', apiKey)
					.expect(200)
					.then(res => {
						supertest(app)
							.get('/bookmarks')
							.set('Authorization', apiKey)
							.expect(expectedBookmarks);
					});
			});
		});
	});
	describe.only(`PATCH /api/bookmarks/:bookmark_id`, () => {
		context(`Given no bookmarks`, () => {
			it(`responds with 404 `, () => {
				const bookmarkId = 123456;
				return supertest(app)
					.patch(`/api/bookmarks/${bookmarkId}`)
					.set('Authorization', apiKey)
					.expect(404, { error: { message: `Bookmark doesn't exist` } });
			});
		});
		context(`Given there are bookmarks in the database`, () => {
			const testBookmarks = makeBookmarksArray();

			beforeEach('insert bookmarks', () => {
				return db.into('bookmarks').insert(testBookmarks);
			});
			it(`responds with 204 and updates bookmark`, () => {
				const idToUpdate = 2;
				const updatedBookmark = {
					title: 'updated Bookmark title',
					url: 'https://www.updatedUrl.com',
					description: 'updated bookmark description',
					rating: 3
				};
				const expectedBookmark = {
					...testBookmarks[idToUpdate - 1],
					...updatedBookmark
				};
				return supertest(app)
					.patch(`/api/bookmarks/${idToUpdate}`)
					.set('Authorization', apiKey)
					.send(updatedBookmark)
					.expect(204)
					.then(res =>
						supertest(app)
							.get(`/api/bookmarks/${idToUpdate}`)
							.expect(expectedBookmark)
					);
			});

			it(`responds with 400 with required fields are not supplied`, () => {
				const idToUpdate = 2;
				return supertest(app)
					.patch(`/api/bookmarks/${idToUpdate}`)
					.set('Authorization', apiKey)
					.send({ irrevelentField: 'Bar' })
					.expect(400, {
						error: {
							message: `Request body must contain 'title', 'url', 'description' or 'rating'`
						}
					});
			});

			it(`responds with 204 when only updating a subset of fields`, () => {
				const idToUpdate = 2;
				const updatedBookmark = {
					title: 'updated bookmark title'
				};
				const expectedBookmark = {
					...testBookmarks[idToUpdate - 1],
					...updatedBookmark
				};
				return supertest(app)
					.patch(`/api/bookmarks/${idToUpdate}`)
					.set('Authorization', apiKey)
					.send({
						...updatedBookmark,
						fieldToIgnore: `should not be in GET response`
					})
					.expect(204)
					.then(res => {
						supertest(app)
							.get(`/api/bookmarks/${idToUpdate}`)
							.expect(expectedBookmark);
					});
			});
		});
	});
});
