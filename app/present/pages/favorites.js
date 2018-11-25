import dbscripts from '../../dbservice/dbscripts';
import fetch from 'node-fetch';

import DataUtil from '../scripts/dataUtilities.js';

import Layout from '../components/Layout';
import SortedCards from '../components/SortedCards';

import LinkedCard from '../components/LinkedCard';
import Typography from '@material-ui/core/Typography';

const { getPosterUrlThumb } = DataUtil;

const FavoritesPage = ({ username, favorites, logged_in }) => (
	<Layout logged_in={ true }>
		<SortedCards
			title={ username + '\'s Favorites'}
			data={ favorites }
			card_function={ favorite => (
				<LinkedCard key={favorite.id} 
					image_url={ favorite.poster_url }
					details_path={ '/present/movie?' + favorite.id }
					is_movie={ true }
					logged_in={ logged_in }
					id={ favorite.id }
				>
					<Typography variant="title" gutterBottom>
						{ favorite.title }
					</Typography>
					<Typography>
						{ favorite.genres }
					</Typography>
					<Typography>
						{ favorite.vote_average }/ 10
					</Typography>
				</LinkedCard>
			) }
			default_sort_by='title'
			sorting_method_names={[
				{ name: 'title', display_name: 'Title' },
				{ name: 'voteavg', display_name: 'Vote Average' },
				{ name: 'popularity', display_name: 'Popularity' }
			]}
			sorting_functions={{
				'title': (m1, m2) => m1.title > m2.title,
				'voteavg': (m1, m2) => m1.vote_average > m2.vote_average,
				'popularity': (m1, m2) => m1.popularity > m2.popularity
			}}
		/>
	</Layout>
);

FavoritesPage.getInitialProps = async ({ req }) => {
	let prop_data = {
		username: req.user.displayName,
		favorites: [],
		logged_in: Boolean(req.user)
	};

	console.log(req.user);

	let favorites;

	if (req) {
		const res = await dbscripts.getFavorites(req.db, req.user.id);
		favorites = res.results.map(record => record.movie);
	} else {
		const res = await fetch('https://team10.d.calebj.io/dbservice/favorites', {
			mode: 'cors',
			credentials: 'include'
		});
		const json = await res.json();

		favorites = res.records;
	}

	const favorites_records = favorites.map(async record => {
		const id = record.id;

		let movie_data = {};

		const movie_response = await fetch('https://team10.d.calebj.io/dbservice/movie?movie_id=' 
			+ id);
		const movie_json = await movie_response.json();

		movie_data = movie_json.record;

		return {
			title: movie_data.title,
			poster_url:
				getPosterUrlThumb(movie_data.poster_path),
			id: id,
			genres: movie_data.genres.map(genre => genre.name).join('/'),
			vote_average: movie_data.vote_average,
			popularity: movie_data.popularity
		}
	});

	prop_data.favorites = await Promise.all(favorites_records);

	return prop_data;
};

export default FavoritesPage;