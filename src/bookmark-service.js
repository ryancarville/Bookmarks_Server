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
			.whre('id', id)
			.first();
	}
};

module.exports = BookmarkServices;
