const routes = require('next-routes');

module.exports = routes()
	.add({
		name: 'results',
		page: 'results',
		pattern: '/present/results'
	})
	.add({
		name: 'movie',
		page: 'movie',
		pattern: '/present/movie'
	})
	.add({
		name: 'person',
		page: 'person',
		pattern: '/present/person'
	})
	.add({
		name: 'favorites',
		page: 'favorites',
		pattern: '/present/favorites'
	});