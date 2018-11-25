import Layout from '../components/Layout';
import dbscripts from '../../dbservice/dbscripts';

import { withStyles } from '@material-ui/core/styles';

import fetch from "node-fetch";
import axios from 'axios';

import Typography from '@material-ui/core/Typography';
import FavoriteButton from '../components/FavoriteButton';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import SortedCards from '../components/SortedCards';
import LinkedCard from '../components/LinkedCard';

import NoSsr from '@material-ui/core/NoSsr';

import DataUtil from '../scripts/dataUtilities.js';

const { getDollarString, getIMDBUrlForMovie, getPosterUrlLarge, getDateData, 
	getGender, getProfileUrlThumb, getRuntimeData, getRuntimeDataString } = DataUtil;

const styles = theme => ({
	root: {
		paddingTop: '1em'
	},
	overviewSection: {
		display: 'grid',
		gridGap: '1rem',
		padding: '0 1rem',
		margin: 'auto'
	},
	poster: {
		width: '60%',
		height: 'auto',
		margin: 'auto'
	},
	movieDetails: {

	},
	movieTitle: {

	},
	movieStatsHead: {
		display: 'flex',
		marginBottom: '1em',
		justifyContent: 'start',
		'& p': {
			marginRight: '1em'
		}
	},
	movieStatsFoot: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	voteStats: {
		textAlign: 'center'
	},
	factsSection: {
		padding: '1rem',
		margin: '4rem auto'
	},
	factsCardContent: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, minmax(15rem, 1fr))',
		gridGap: '1rem'
	},
	creditsSection: {
		margin: 'auto'
	},
	credits: {
		margin: 'auto'
	},
	'@media (min-width: 600px)': {
		factsSection: {
			width: '33rem'
		},
		overviewSection: {
			width: '33rem'
		}
	},
	'@media (min-width: 1000px)': {
		root: {
			margin: 'auto'
		},
		overviewSection: {
			width: '51rem',
			gridTemplateColumns: '2fr 3fr',
			justifyContent: 'center'
		},
		poster: {
			width: '100%'
		},
		factsSection: {

		}
	}
});

const MoviePage = ({ 
	title, overview, runtime, large_poster_url, genres, is_adult,
	homepage_url, imdb_url, vote_average, vote_count, budget,
	revenue, production_companies, production_countries,
	release_date_data, status, original_title, spoken_languages,
	cast, crew, user, logged_in, classes, id
}) => {
	const runtime_data = getRuntimeData(runtime);
	const release_date_string = release_date_data.year +
		'-' + release_date_data.month + '-' +
		release_date_data.date;

	return (
		<Layout logged_in={ logged_in }>
			<div className={ classes.root }>

				<section className={ classes.overviewSection }>
						<img className={ classes.poster } src={ large_poster_url } />
						<div className={ classes.movieDetails }>
							<Typography variant='headline' className={ classes.movieTitle } gutterBottom>
								{ title }
							</Typography>
							<div className={ classes.movieStatsHead }>
								<Typography variant='caption' component='p'>
									{ release_date_data.year }
								</Typography>
								<Typography variant='caption' component='p'>
									{ getRuntimeDataString(runtime_data) }
								</Typography>
								<Typography variant='caption' component='p'>
									{ genres.join('/') }
								</Typography>
							</div>
							<Typography paragraph gutterBottom>
								{ overview }
							</Typography>
							<div className={ classes.movieStatsFoot }>
								<div className={ classes.voteStats }>
									<Typography variant='headline'>
										{ vote_average } /10
									</Typography>
									<Typography variant='subheading'>
										{ vote_count } votes
									</Typography>
								</div>
								
								<div>
									<NoSsr>
										{ logged_in && (<FavoriteButton movie_id={ id } extended />) }
									</NoSsr>
								</div>
							</div>
						</div>
					</section>

					<section className={ classes.factsSection }>
						<Card>
							<CardHeader title="More Facts" />
							<CardContent className={ classes.factsCardContent } >
								<div>
									<Typography variant='body2' gutterBottom>
										Budget
									</Typography>
									<Typography>
										{ getDollarString(budget) }
									</Typography>
									<Typography variant='body2' gutterBottom>
										Revenue
									</Typography>
									<Typography>
										{ getDollarString(revenue) }
									</Typography>
								</div>
								{
									(production_companies.length != 0) ?

									(<div>
										<Typography variant='body2' gutterBottom>
											Production Companies
										</Typography>
										{ production_companies.map(company => (
											<Typography>
												{ company }
											</Typography>
										))}
									</div>) 

									:

									''
								}
								{
									(production_countries.length != 0) ?

									(<div>
										<Typography variant='body2' gutterBottom>
											Production Countries
										</Typography>
										{ production_countries.map(country => (
											<Typography>
												{ country }
											</Typography>
										))}
									</div>
									)

									:

									''
								}
								<div>
									<Typography variant='body2' gutterBottom>
										Spoken Languages
									</Typography>
									{ spoken_languages.map(language => (
										<Typography>
											{ language }
										</Typography>
									))}
								</div>
								<div>
									<Typography variant='body2' gutterBottom>
										More Info
									</Typography>
									<Typography>
										<a href={ homepage_url }>
											Homepage
										</a>
									</Typography>
									<Typography>
										<a href={ imdb_url }>
											IMDB
										</a>
									</Typography>
								</div>
							</CardContent>
						</Card>
					</section>
					<section className={ classes.creditsSection }>
						<div className={ classes.credits }>
							<SortedCards
								title="Cast"
								data={ cast }
								card_function={ member => (
									<LinkedCard key={member.id} 
										image_url={ member.thumb_profile_pic_url }
										details_path={ '/present/person?' + member.id }
										is_movie={ false }
									>
										<Typography variant="title" gutterBottom>
											{ member.name }
										</Typography>
										<Typography variant="body2">
											{ member.character }
										</Typography>
									</LinkedCard>
								) }
								default_sort_by='order'
								sorting_method_names={[
									{ name: 'name', display_name: 'Name' },
									{ name: 'order', display_name: 'Order' },
									{ name: 'role', display_name: 'Role'}
								]}
								sorting_functions={{
									'name': (m1, m2) => m1.name > m2.name,
									'order': (m1, m2) => m1.order > m2.order,
									'role': (m1, m2) => m1.character > m2.character
								}}
							/>
							<SortedCards
								title="Crew"
								data={ crew }
								card_function={ member => (
									<LinkedCard key={member.id} 
										image_url={ member.thumb_profile_pic_url }
										details_path={ '/present/person?' + member.id }
										is_movie={ false }
									>
										<Typography variant="title" gutterBottom>
											{ member.name }
										</Typography>
										<Typography variant="body2">
											{ member.department }, { member.job }
										</Typography>
									</LinkedCard>
								) }
								default_sort_by='name'
								sorting_method_names={[
									{ name: 'name', display_name: 'Name' },
									{ name: 'department', display_name: 'Department'}
								]}
								sorting_functions={{
									'name': (m1, m2) => m1.name > m2.name,
									'department': (m1, m2) => m1.department > m2.department
								}}
							/>
						</div>
					</section>
			</div>
		</Layout>
	)
}

MoviePage.getInitialProps = async ({ req, asPath }) => {
	let prop_data = {
		production_companies: [],
		production_countries: []
	};
	let movie_data = {};

	const id_string = asPath.replace(/^.*\?/,'');

	const response = await fetch('https://team10.d.calebj.io/dbservice/movie?movie_id=' 
		+ id_string);
	const json = await response.json();

	movie_data = json.record;

	prop_data.title = movie_data.title;
	prop_data.overview = movie_data.overview;
	prop_data.runtime = movie_data.runtime;
	prop_data.id = movie_data.id;

	prop_data.large_poster_url = 
		getPosterUrlLarge(movie_data.poster_path);

	prop_data.genres = movie_data.genres.map(genre => genre.name);
	prop_data.is_adult = movie_data.adult;

	prop_data.homepage_url = movie_data.homepage;
	prop_data.imdb_url = getIMDBUrlForMovie(movie_data.imdb_id);
	
	prop_data.vote_average = movie_data.vote_average;
	prop_data.vote_count = movie_data.vote_count;

	prop_data.budget = movie_data.budget;
	prop_data.revenue = movie_data.revenue;

	if (Array.isArray(movie_data.production_companies)) {
		prop_data.production_companies = movie_data.production_companies
		.map(company => company.name); 
	}
	if (Array.isArray(movie_data.production_countries)) {
		prop_data.production_countries = movie_data.production_countries
		.map(country => country.name);
	}

	prop_data.release_date_data = getDateData(movie_data.release_date);
	prop_data.status = movie_data.status;

	prop_data.original_title = movie_data.original_title;

	prop_data.spoken_languages = movie_data.spoken_languages
		.map(language => language.name);

	prop_data.cast = movie_data.credits.cast.map(cast_member => {
		return {
			name: cast_member.name,
			gender: getGender(cast_member.gender),
			character: cast_member.character,
			order: cast_member.order,
			id: cast_member.id,
			thumb_profile_pic_url: getProfileUrlThumb(cast_member.profile_path)
		};
	});

	prop_data.crew = movie_data.credits.crew.map(crew_member => {
		return {
			name: crew_member.name,
			gender: getGender(crew_member.gender),
			department: crew_member.department,
			job: crew_member.job,
			thumb_profile_pic_url: getProfileUrlThumb(crew_member.profile_path),
			id: crew_member.id
		};
	});

    if (req) {
    	prop_data.user = req.user;
    	prop_data.logged_in = Boolean(req.user);
    }

	return prop_data;
}

export default withStyles(styles)(MoviePage);