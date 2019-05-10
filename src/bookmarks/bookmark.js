const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarkRouter = express.Router();
const bodyParse = express.json();

const bookmarks = require('../store');

bookmarkRouter
	.route('/bookmarks')
	.get((req, res) => {
		res.status(200).json(bookmarks);
	})
	.post(bodyParse, (req, res) => {
		const { title, url, description, rating } = req.body;

		if (!title) {
			logger.error('Title Required');
			return res.status(400).send('Title Required');
		}

		if (!url) {
			logger.error('URL required');
			return res.status(400).send('URL required');
		}

		const id = uuid();
		const bookmark = {
			id,
			title,
			url,
			description,
			rating
		};

		bookmarks.push(bookmark);

		logger.info(`Bookmark with id ${id} created`);
		res
			.status(201)
			.location(`http://localhost:8000/bookmarks/${id}`)
			.json(bookmark);
	});

bookmarkRouter
	.route('/bookmarks/:id')
	.get((req, res) => {
		const { id } = req.params;
		const bookmark = bookmarks.find(bm => bm.id == id);

		if (!bookmark) {
			logger.error('Bookmark with id ${id} not found.');
			return res.status(404).send('Bookmark Not Found');
		}
		res.json(bookmark);
	})
	.delete((req, res) => {
		const { id } = req.params;
		const bookmarkIndex = bookmarks.findIndex(bm => bm.id == id);
		if (bookmarkIndex === -1) {
			logger.error(`Bookmark with id: ${id} not found`);
			return res.status(404).send('Bookmark not found');
		}

		bookmarks.forEach(bookmark => {
			const bmId = bookmarks.filter(bm => bm.id !== id);
			bookmark.id = bmId;
		});

		bookmarks.splice(bookmarkIndex, 1);
		logger.info(`Bookmark with id ${id} deleted`);
		res.status(204).end();
	});

module.exports = bookmarkRouter;
