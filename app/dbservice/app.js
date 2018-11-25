const express = require('express');
const dbscripts = require('./dbscripts.js');

const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next)

module.exports = db => {
    const router = express.Router();

    router.get('/person', asyncHandler( async (req, res, next) => {
        var person_id = parseInt(req.query.person_id);

        if ( isNaN(person_id) ) {
            var result = {
                'status' : 'error',
                'msg' : 'person_id parameter missing or invalid'
            };
            res.status(400);
        } else {
            res.redirect('/dbservice/people/' + person_id);
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/people/:person_id', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        var person_id = parseInt(req.params.person_id);

        if ( isNaN(person_id) || person_id < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'person_id parameter missing or invalid'
            };
            res.status(400);
        } else {
            var person = await dbscripts.getPersonById(db, person_id);

            if ( person ) {
                var result = {
                    'status' : 'ok',
                    'record' : person
                };
            } else {
                var result = {
                    'status' : 'ok',
                    'record' : null,
                    'msg'    : 'person does not exist'
                };

                res.status(404);
            }
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/top_grossing', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 10;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if ( isNaN(limit) || limit < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for limit parameter \'num\''
            };
            res.status(400);
        } else if ( isNaN(offset) || offset < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for offset parameter \'start\''
            };
            res.status(400);
        } else {
            var results = await dbscripts.getMoviesSorted(db, 'revenue', true, limit, offset);

            var result = {
                'status' : 'ok',
                'records' : results
            };
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/favorites', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 10;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if (!req.user) {
            var result = {
                'status' : 'error',
                'msg' : 'user is not logged in'
            }
            res.status(401);
        } else if ( isNaN(limit) || limit < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for limit parameter \'num\''
            };
            res.status(400);
        } else if ( isNaN(offset) || offset < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for offset parameter \'start\''
            };
            res.status(400);
        } else {
            var favorites = await dbscripts.getFavorites(db, req.user.id, limit, offset);

            var result = {
                'status' : 'ok',
                'records' : favorites.results,
                'num_favorites' : favorites.count
            };
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/movie', asyncHandler( async (req, res, next) => {
        var movie_id = parseInt(req.query.movie_id);

        if ( isNaN(movie_id) ) {
            var result = {
                'status' : 'error',
                'msg' : 'movie_id parameter missing or invalid'
            };
            res.status(400);
        } else {
            res.redirect('/dbservice/movies/' + movie_id);
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/movies/:movie_id', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        var movie_id = parseInt(req.params.movie_id);

        if ( isNaN(movie_id) ) {
            var result = {
                'status' : 'error',
                'msg' : 'movie_id parameter missing or invalid'
            };
            res.status(400);
        } else {
            var movie = await dbscripts.getMovieById(db, movie_id);

            if ( movie ) {
                var result = {
                    'status' : 'ok',
                    'record' : movie
                };
            } else {
                var result = {
                    'status' : 'ok',
                    'record' : null,
                    'msg'    : 'movie does not exist'
                };

                res.status(404);
            }
        }

        res.end(JSON.stringify(result));
    }));


    router.get('/movies/:movie_id/favorite', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let movie_id = parseInt(req.params.movie_id);

        if (!req.user) {
            var result = {
                'status' : 'error',
                'msg' : 'user is not logged in'
            }
            res.status(401);
        } else {
            if ( isNaN(movie_id) ) {
                var movie = null;
            } else {
                var movie = await dbscripts.getMovieById(db, movie_id);
            }

            if (!movie) {
                var result = {
                    'status' : 'error',
                    'msg'    : 'movie does not exist'
                };
                res.status(404);
            } else {
                favorite = await dbscripts.getFavorite(db, req.user.id, movie_id);
                if ( favorite ) {
                    result = {
                        'status' : 'ok',
                        'is_favorited' : true,
                        'date_favorited' : favorite.date_favorited
                    };
                } else {
                    var result = {
                        'status' : 'ok',
                        'is_favorited' : false,
                    }
                }
            }
        }

        res.end(JSON.stringify(result));
    }));

    router.post('/movies/:movie_id/favorite', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let movie_id = parseInt(req.params.movie_id);

        if (!req.user) {
            var result = {
                'status' : 'error',
                'msg' : 'user is not logged in'
            }
            res.status(401);
        } else {
            if (isNaN(movie_id)) {
                var movie = null;
            } else {
                var movie = await dbscripts.getMovieById(db, movie_id);
            }

            if (!movie) {
                var result = {
                    'status' : 'error',
                    'msg'    : 'movie does not exist'
                };
                res.status(404);
            } else {
                if (await dbscripts.addFavorite(db, req.user.id, movie_id)) {
                    result = null;
                    res.status(204);
                } else {
                    var result = {
                        'status' : 'error',
                        'msg'    : 'movie was already favorited'
                    }
                    res.status(409);
                }
            }
        }

        res.end(JSON.stringify(result));
    }));

    router.delete('/movies/:movie_id/favorite', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let movie_id = ( req.params.movie_id ) ? parseInt(req.params.movie_id) : null;

        if (!req.user) {
            var result = {
                'status' : 'error',
                'msg' : 'user is not logged in'
            }
            res.status(401);
        } else {
            if (isNaN(movie_id)) {
                var movie = null;
            } else {
                var movie = await dbscripts.getMovieById(db, movie_id);
            }

            if (!movie) {
                var result = {
                    'status' : 'error',
                    'msg'    : 'movie does not exist'
                };
                res.status(404);
            } else {
                if (await dbscripts.removeFavorite(db, req.user.id, movie_id)) {
                    result = null;
                    res.status(204);
                } else {
                    var result = {
                        'status' : 'error',
                        'msg'    : 'movie was not favorited, cannot remove'
                    }
                    res.status(409);
                }
            }
        }

        res.end(JSON.stringify(result));
    }));

    router.get('/search', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 20;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;
        let query = req.query.q;

        if ( !query ) {
            var result = {
                'status' : 'error',
                'msg' : 'search query parameter \'q\' missing or empty'
            };
            res.status(400);
        } else if ( isNaN(limit) || limit < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for limit parameter \'num\''
            };
            res.status(400);
        } else if ( isNaN(offset) || offset < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for offset parameter \'start\''
            };
            res.status(400);
        } else {
            var movies_found = await dbscripts.doSearch(db, 'movies', query, limit, offset);
            var people_found = await dbscripts.doSearch(db, 'people', query, limit, offset);

            var result = {
                'status'      : 'ok',
                'movies'      : movies_found.results,
                'num_movies'  : movies_found.count,
                'persons'     : people_found.results,
                'num_persons' : people_found.count,
            };
        }

        res.end(JSON.stringify(result));
    }));

    return router;
};
