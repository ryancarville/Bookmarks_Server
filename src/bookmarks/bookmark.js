require('dotenv').config();
const express = require('express');
const logger = require('../logger');
const bookmarkRouter = express.Router();
const BookmarkServices = require('../bookmark-service');

bookmarkRouter.route('/bookmarks').get((req, res, next) => {
	const knexInstance = req.app.get('db');
	console.log(knexInstance);
	BookmarkServices.getAllBookmarks(knexInstance)
		.then(bookmarks => res.status(200).json(bookmarks))
		.catch(next);
});

bookmarkRouter.route('/bookmarks/:bookmark_id').get((req, res, next) => {
	const knexInstance = req.app.get('db');
	BookmarkServices.getBookmarkById(knexInstance, req.params.bookmark_id)
		.then(bookmark => {
			if (!bookmark) {
				logger.error('Bookmark with id ${id} not found.');
				return res.status(404).send('Bookmark Not Found');
			}
			res.status(200).json(bookmark);
		})
		.catch(next);
});

module.exports = bookmarkRouter;
