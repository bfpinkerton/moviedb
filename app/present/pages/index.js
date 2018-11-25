import fetch from "node-fetch";

import { withStyles } from '@material-ui/core/styles';
import dbscripts from '../../dbservice/dbscripts';

import Layout from '../components/Layout';
import Typography from '@material-ui/core/Typography';

import LinkedCard from '../components/LinkedCard';

import DataUtil from '../scripts/dataUtilities';

const { getProfileUrlThumb, getPosterUrlThumb,
	getDollarString, getDateData } = DataUtil;

const styles = theme => ({
	root: {
		padding: '0 1rem',
		margin: 'auto'
	},
	header: {
		margin: '1em auto'
	},
	cardGrid: {
		display: 'grid',
		gridTemplateColumns: '100%',
		gridGap: '1rem',
		gridAutoFlow: 'row',
		marginBottom: '1em'
	},
	'@media (min-width: 800px)': {
		root: {
			width: '51rem'
		},
		cardGrid: {
			gridTemplateColumns: 'repeat(2, 24rem)'
		}
	},
	'@media (min-width: 1200px)': {
		root: {
			width: '76rem'
		},
		cardGrid: {
			gridTemplateColumns: 'repeat(3, 24rem)'
		}
	},
	'@media (min-width: 1600px)': {
		root: {
			width: '101rem'
		},
		cardGrid: {
			gridTemplateColumns: 'repeat(4, 24rem)'
		}
	}
});

const renderMovieCard = logged_in => movie => {
	return (
		<LinkedCard 
			image_url={ movie.image_url } 
			details_path={ movie.details_path }
			is_movie={ true }
			logged_in={ logged_in }
			id={ movie.id }
		>
			<Typography variant='title' gutterBottom>
				{ movie.title }
			</Typography>
			<Typography>
				<strong>Revenue:</strong> { movie.revenue }
			</Typography>
		</LinkedCard>
	);
};

const MainPage = ({ classes, top_grossing_movies, user, logged_in, db }) => (
	<Layout logged_in={ logged_in }>
		<section className={ classes.root }>
			<Typography variant='display1' className={ classes.header } gutterBottom>
				Top 10 Grossing Movies
			</Typography>
			<div className={ classes.cardGrid }>
				{ top_grossing_movies.map(renderMovieCard(logged_in)) }
			</div>
		</section>
	</Layout>
);

MainPage.getInitialProps = async ({ req, asPath }) => {
	let prop_data = {
		top_grossing_movies: []
	};

	const response = await fetch('https://team10.d.calebj.io/dbservice/top_grossing');
	const json = await response.json();

	const movie_promises = json.records
		.map(async movie => {
			return {
				title: movie.title,
				genres: movie.genres,
				status: movie.status,
				release_date: getDateData(movie.release_date),
				runtime: movie.runtime,
				vote_average: movie.vote_average,
				image_url: 
					getPosterUrlThumb(movie.poster_path),
				details_path: '/present/movie?' + movie.id,
				id: movie.id,
				revenue: getDollarString(movie.revenue)
			};
		});

	prop_data.top_grossing_movies = await Promise.all(movie_promises);

	if (req) {
    	prop_data.user = req.user;
    	prop_data.logged_in = Boolean(req.user);
    } else {
    	const res = await fetch('https://team10.d.calebj.io/user_data', {
    		mode: 'cors',
    		credentials: 'include'
    	});

    	const json = await res.json();

    	prop_data.logged_in = Boolean(json.user);
    }

	return prop_data;
}

export default withStyles(styles)(MainPage);