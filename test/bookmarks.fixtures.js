function makeBookmarksArray() {
	return [
		{
			id: 1,
			title: 'Test Name 291',
			url: 'https://www.testURL291.com',
			description: 'Test Description 291',
			rating: 5
		},
		{
			id: 2,
			title: 'Test Name 565436',
			url: 'https://www.testURL565436.com',
			description: 'Test Description 565436',
			rating: 4
		},
		{
			id: 3,
			title: 'Test Name 45645',
			url: 'https://www.testURL45645.com',
			description: 'Test Description 45645',
			rating: 4
		},
		{
			id: 4,
			title: 'Test Name 8979',
			url: 'https://www.testURL8979.com',
			description: 'Test Description 8979',
			rating: 1
		}
	];
}

function makeMaliciousBookmark() {
	const maliciousBookmark = {
		id: 666,
		title: 'I am a malicious bookmark <script>alert("xss");</script>',
		url: 'https://www.not.a.real.link/used-to-xss',
		description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
		rating: 5
	};

	const expectedBookmark = {
		...maliciousBookmark,
		title:
			'I am a malicious bookmark &lt;script&gt;alert("xss");&lt;/script&gt;',
		description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
	};
	return { maliciousBookmark, expectedBookmark };
}

module.exports = { makeBookmarksArray, makeMaliciousBookmark };
