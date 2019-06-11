require('dotenv').config();
const express = require('express');
const logger = require('../logger');
const bookmarkRouter = express.Router();
const BookmarkServices = require('./bookmark-service');
const jsonParser = express.json();
const xss = require('xss');

const sterializeBookmark = bookmark => ({
	id: bookmark.id,
	title: xss(bookmark.title),
	url: bookmark.url,
	description: xss(bookmark.description),
	rating: bookmark.rating
});

bookmarkRouter
	.route('/bookmarks')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db');
		console.log(knexInstance);
		BookmarkServices.getAllBookmarks(knexInstance)
			.then(bookmarks =>
				res.status(200).json(bookmarks.map(sterializeBookmark))
			)
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		const { title, url, description, rating } = req.body;
		const newBookmark = { title, url, description, rating };

		for (const [key, value] of Object.entries(newBookmark)) {
			if (value == null)
				return res.status(400).json({
					error: { message: `Missing '${key}' in request body` }
				});
		}
		BookmarkServices.insertNewBookmark(req.app.get('db'), newBookmark)
			.then(bookmark => {
				res
					.status(201)
					.location(`/bookmarks/${bookmark.id}`)
					.json(sterializeBookmark(bookmark));
			})
			.catch(next);
	});

bookmarkRouter
	.route('/bookmarks/:bookmark_id')
	.all((req, res, next) => {
		const knexInstance = req.app.get('db');
		BookmarkServices.getBookmarkById(knexInstance, req.params.bookmark_id)
			.then(bookmark => {
				if (!bookmark) {
					logger.error('Bookmark with id ${id} not found.');
					return res
						.status(404)
						.json({ error: { message: `Bookmark doesn't exist` } });
				}
				res.status(200).json(sterializeBookmark(bookmark));
			})
			.catch(next);
	})
	.get((req, res, next) => {
		res.json(sterializeBookmark(res.bookmark));
	})
	.delete((req, res, next) => {
		BookmarkServices.deleteBookmark(req.app.get('db'), req.params.bookmark_id)
			.then(numRowsAffected => {
				res.status(200).end();
			})
			.catch(next);
	});

module.exports = bookmarkRouter;
