const DataUtil = {

	getDollarString: (movieDollars) => {

	    movieDollars=String(movieDollars);

	    const pattern = /(-?\d+)(\d{3})/;

	    while (pattern.test(movieDollars)) {

	        movieDollars = movieDollars.replace(pattern, "$1,$2");
	    }

	    return '$' + movieDollars;
	},

	getDateData: (date_string) => {
		return {
			year: date_string.match(/^(\d{4})/)[0],
			month: date_string.match(/-(\d{2})-/)[0],
			date: date_string.match(/(\d{2})$/)[0]
		};
	},

	getWikiUrlForPerson: (name) => {
	    return 'https://en.wikipedia.org/wiki/' + name;
	},

	getGender: (gender_id) => {
	    return (gender_id == 2) ? "Male" : "Female";
	},

	getIMDBUrlForMovie: (imdbID) => {
	    return 'https://www.imdb.com/title/' + imdbID;
	},

	getPosterUrlLarge: (path) => {
		return (path) ? 'http://image.tmdb.org/t/p/w342' + path : '';
	},

	getPosterUrlThumb: (path) => {
		return (path) ? 'http://image.tmdb.org/t/p/w154' + path : '';
	},

	getProfileUrlThumb: (path) => {
		return (path) ? 'http://image.tmdb.org/t/p/w185' + path : '';
	},

	getProfileUrlLarge: (path) => {
		return (path) ? 'http://image.tmdb.org/t/p/h632' + path : '';
	},

	getRuntimeData: (runtime) => {
		let runtime_hours;
		let runtime_minutes;

		if (runtime < 60) {
			runtime_hours = 0;
			runtime_minutes = runtime;
		} else if (runtime % 60 == 0) {
			runtime_hours = runtime / 60;
			runtime_minutes = 0;
		} else {
			runtime_hours = Math.floor(runtime / 60);
			runtime_minutes = runtime - (runtime_hours * 60);
		}

		return {
			hours: runtime_hours,
			minutes: runtime_minutes,
		};
	},

	getRuntimeDataString: (data) => {
		const runtime_hours_string = 
			(data.hours == 0) ? "" : data.hours + ' hr ';
		const runtime_minutes_string =
			(data.minutes == 0) ? "" : data.minutes + ' min';

		return runtime_hours_string + runtime_minutes_string;
	}
};

export default DataUtil;