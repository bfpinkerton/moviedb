exports.getMovieById = async (db, movie_id) => {
	return await db.collection('movies').findOne({ "id" : movie_id });
};

exports.getMovieByIMDBId = async (db, IMDB_id) => {
	return await db.collection('movies').findOne({ "imdb_id" : IMDB_id });
};

exports.getMovieStats = async (db) => {
    const num_movies = await db.collection('movies').count();

    var num_genres = await db.collection('movies').distinct("genres.name");
    num_genres = num_genres.length;

    var total_runtime = db.collection('movies').aggregate([{
        $group: {
            _id: null,
            total: { $sum: "$runtime" }
        }
    }]);
    total_runtime = await total_runtime.next();

    const total_hours = Math.floor(total_runtime / 60);
    const total_minutes = total_runtime % 60;

    return {
        'num_movies'    : num_movies,
        'total_runtime' : toal_hours + ":" + total_minutes,
        'total_minutes' : total_runtime,
        'unique_genres' : num_genres
    };
};

exports.getCastByMovieId = async (db, movie_id) => {
    // Establish a cursor to our search.
    // Only return movie title, id, and cast.
    return await db.collection('movies').findOne(
        { "id" : movie_id },
        { "credits.cast": 1 }
    );
}

exports.getPersonById = async (db, person_id) => {
	return await db.collection('people').findOne({ "id" : person_id });
};

exports.getMoviesSorted = async (db, sort_field, descending=false, limit=20, skip=0) => {
    let cursor = db.collection('movies').find({});

    if ( sort_field )
        cursor = cursor.sort(sort_field, (descending) ? -1 : 1);

    return await cursor.skip(skip).limit(limit).toArray();
};

exports.getFavorites = async (db, user_id, limit=0, skip=0) => {
    let favorites = db.collection('favorites');
    let aggregate_params = [
        { $match  : { user_id: user_id }},
        { $sort : { _id : 1 } },
        { $skip : skip }
    ];

    if (limit > 0)
        aggregate_params.push( { $limit : limit } );

    aggregate_params.push(
        {
            $lookup : {
                from: 'movies',
                localField: 'movie_id',
                foreignField: 'id',
                as: 'movie'
            }
        },
        { $unwind: '$movie' },
        { $addFields:
            {
                date_favorited: { $toDate: "$_id" }
            }
        },
        { $project: { _id: 0, movie_id: 0, user_id: 0, 'movie._id' : 0 } }
    );

    let cur = db.collection('favorites').aggregate(aggregate_params, {});

    let count = await favorites.find({ user_id : user_id }).count();
    let results = await cur.toArray();

    return {
        count   : count,
        results : results
    };
};

exports.getFavorite = async (db, user_id, movie_id) => {
    let result = await db.collection('favorites').findOne({
        user_id  : user_id,
        movie_id : movie_id
    }, {
        projection: {
            user_id  : 0,
            movie_id : 0
        }
    });

    if ( result )
        return { date_favorited: result._id.getTimestamp() }

    return false;
};

exports.addFavorite = async (db, user_id, movie_id) => {
    try {
        let result = await db.collection('favorites').insertOne({
            user_id  : user_id,
            movie_id : movie_id
        }, { forceServerObjectId: true });

        return result.insertedCount > 0;
    } catch (err) {
        return false;
    }
};

exports.removeFavorite = async (db, user_id, movie_id) => {
    let result = await db.collection('favorites').deleteOne({
        user_id  : user_id,
        movie_id : movie_id
    });

    return result.deletedCount > 0;
};

exports.doSearch = async (db, collection, search_string, limit=20, skip=0) => {
    let find_params = { "$text" : { "$search": search_string } };
    let cursor = db.collection(collection).find(find_params);
    let count = await cursor.count();
	let results = await cursor.skip(skip).limit(limit).toArray();

    return {
        count   : count,
        results : results
    }
};
