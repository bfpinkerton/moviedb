const express = require('express');
const elasticsearch = require('elasticsearch');

const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next)

module.exports = (db, host) => {
    const router = express.Router();
    const client = new elasticsearch.Client({
        host: host
    });

    router.post('/people', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        let term = req.query.q;
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 20;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if (!term) {
            var result = {
                'status' : 'error',
                'msg' : 'q= parameter missing or empty'
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
            results = await client.search({
                index: 'people',
                sort: "_score",
                size: limit,
                from: offset,
                body: {
                    query: {
                        match: {
                            name: {
                                query: term,
                                minimum_should_match: '75%'
                            }
                        }
                    },
                    suggest: {
                        text: term,
                        suggestions: {
                            term: {
                                suggest_mode: 'missing',
                                field: 'name'
                            }
                        }
                    }
                }
            })

            var result = results;
            result.status = 'ok';
        }

        res.end(JSON.stringify(result));
    }));

    router.post('/movies', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        let term = req.query.q;
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 20;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if (!term) {
            var result = {
                'status' : 'error',
                'msg' : 'q= parameter missing or empty'
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
            results = await client.search({
                index: 'movies',
                sort: "_score",
                size: limit,
                from: offset,
                body: {
                    query: {
                        match: {
                            title: {
                                query: term,
                                minimum_should_match: '75%'
                            }
                        }
                    },
                    suggest: {
                        text: term,
                        suggestions: {
                            term: {
                                suggest_mode: 'missing',
                                field: 'title'
                            }
                        }
                    }
                }
            })

            var result = results;
            result.status = 'ok';
        }

        res.end(JSON.stringify(result));
    }));

    router.post('/all', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        let term = req.query.q;
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 20;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if (!term) {
            var result = {
                'status' : 'error',
                'msg' : 'q= parameter missing or empty'
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
            results = await client.search({
                index: 'movies,people',
                sort: "_score",
                size: limit,
                from: offset,
                body: {
                    query: {
                        multi_match: {
                            query: term,
                            minimum_should_match: '75%',
                            fields: ['title^1.1', 'name']
                        }
                    }
                }
            });

            var result = results;
            result.status = 'ok';
        }

        res.end(JSON.stringify(result));
    }));

    router.post('/search', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        let term = req.query.q;
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 20;
        let offset = ( req.query.start ) ? parseInt(req.query.start) : 0;

        if (!term) {
            var result = {
                'status' : 'error',
                'msg' : 'q= parameter missing or empty'
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
            results = await client.search({
                index: 'suggestion',
                sort: "_score",
                size: limit,
                from: offset,
                body: {
                    query: {
                        match: {
                            keyword: term,
                        }
                    },
                    suggest: {
                        text: term,
                        suggestions: {
                            term: {
                                suggest_mode: 'missing',
                                field: "keyword"
                            }
                        }
                    }
                }
            });

            var result = results;
            result.status = 'ok';
        }

        res.end(JSON.stringify(result));
    }));

    router.post('/autocomplete', asyncHandler( async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        let term = req.query.q;
        let limit = ( req.query.num ) ? parseInt(req.query.num) : 10;

        if (!term) {
            var result = {
                'status' : 'error',
                'msg' : 'q= parameter missing or empty'
            };
            res.status(400);

        } else if ( isNaN(limit) || limit < 0 ) {
            var result = {
                'status' : 'error',
                'msg' : 'invalid value for limit parameter \'num\''
            };
            res.status(400);
        } else {
            results = await client.search({
                index: 'suggestion',
                type: 'suggestion',
                sort: "_score",
                size: 0,
                body: {
                    suggest: {
                        suggestion: {
                            prefix: term,
                            completion: {
                                field: "suggest",
                                size: limit
                            }
                        }
                    }
                }
            });

            var result = results;
            result.status = 'ok';
        }

        res.end(JSON.stringify(result));
    }));

    return router;
};
