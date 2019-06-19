const BookmarkServices = {
	getAllBookmarks(knex) {
		return knex.select('*').from('bookmarks');
	},
	insertNewBookmark(knex, newBookmark) {
		return knex
			.insert(newBookmark)
			.into('bookmarks')
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	},
	getBookmarkById(knex, id) {
		return knex
			.from('bookmarks')
			.select('*')
			.where('id', id)
			.first();
	},
	updateBookmark(knex, id, updatedBookmark) {
		return knex('bookmarks')
			.where({ id })
			.update(updatedBookmark);
	},
	deleteBookmark(knex, id) {
		return knex('bookmarks')
			.where({ id })
			.delete();
	}
};

module.exports = BookmarkServices;
