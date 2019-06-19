require('dotenv').config();
const path = require('path');
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
	.route('/')
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
					.location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
					.json(sterializeBookmark(bookmark));
			})
			.catch(next);
	});

bookmarkRouter
	.route('/:bookmark_id')
	.all((req, res, next) => {
		const knexInstance = req.app.get('db');
		BookmarkServices.getBookmarkById(knexInstance, req.params.bookmark_id)
			.then(bookmark => {
				if (!bookmark) {
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
	})
	.patch(jsonParser, (req, res, next) => {
		const { title, url, description, rating } = req.body;
		const updatedBookmark = { title, url, description, rating };

		const numberOfValues = Object.values(updatedBookmark).filter(Boolean)
			.length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `Request body must contain 'title', 'url', 'description' or 'rating'`
				}
			});
		}
		BookmarkServices.updateBookmark(
			req.app.get('db'),
			req.params.bookmark_id,
			updatedBookmark
		)
			.then(numRowsAffected => {
				res.status(204).end();
			})
			.catch(next);
	});

module.exports = bookmarkRouter;
