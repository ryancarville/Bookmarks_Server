require('dotenv').config();
const express = require('express');
const logger = require('../logger');
const bookmarkRouter = express.Router();
const BookmarkServices = require('../bookmark-service');

bookmarkRouter.route('/bookmarks').get((req, res, next) => {
	const knexInstance = req.app.get('db');
	BookmarkServices.getAllBookmarks(knexInstance)
		.then(bookmarks => res.json(bookmarks))
		.catch(next);
});

bookmarkRouter.route('/bookmarks/:id').get((req, res, next) => {
	const knexInstance = req.app.get('db');
	BookmarkServices.getBookmarkById(knexInstance, req.params.bookmakr_id)
		.then(bookmark => {
			if (!bookmark) {
				logger.error('Bookmark with id ${id} not found.');
				return res.status(404).send('Bookmark Not Found');
			}
			res.json(bookmark);
		})
		.catch(next);
});

//const uuid = require('uuid/v4');
// .delete((req, res) => {
// 	const { id } = req.params;
// 	const bookmarkIndex = bookmarks.findIndex(bm => bm.id == id);
// 	if (bookmarkIndex === -1) {
// 		logger.error(`Bookmark with id: ${id} not found`);
// 		return res.status(404).send('Bookmark not found');
// 	}

// 	const bmId = bookmarks.filter(bm => bm.id === id);
// 	const bookmark = bmId;

// 	bookmarks.splice(bookmark, 1);
// 	logger.info(`Bookmark with id ${id} deleted`);
// 	res.status(204).end();
// });

module.exports = bookmarkRouter;
