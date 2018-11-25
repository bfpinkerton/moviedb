import { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import fetch from 'node-fetch';

import Layout from '../components/Layout';

import DataUtil from '../scripts/dataUtilities';

import Typography from '@material-ui/core/Typography';
import LinkedCard from '../components/LinkedCard';
import SortedCards from '../components/SortedCards';

import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

const { getProfileUrlThumb, getPosterUrlThumb } = DataUtil;

const styles = theme => ({
	root: {
		padding: '0 1rem',
		margin: 'auto'
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		flexAutoFlow: 'row',
		margin: '1rem auto'
	},
	heading_root: {
		alignSelf: 'center'
	},
	results_container: {
		display: 'grid',
		gridTemplateColumns: '100%',
		gridGap: '1rem',
		gridAutoFlow: 'row',
		marginBottom: '1em'
	},
	'@media (min-width: 700px)': {
		root: {
			width: '40rem'
		}
	}
});

const fetchData = async (query, offset, limit) => {
	let data = {
		results: [],
		total_results: 0
	};

	const res = await fetch(
		'https://team10.d.calebj.io/searchapi/search?q=' + 
		encodeURI(query) + '&num=' + limit + '&start=' + offset,
		{
			method: 'POST',
			mode: 'cors'
		});

    const json = await res.json();

    data.total_results = json.hits.total;

    const recordPromises = json.hits.hits
    	.map(async record => {
    		let data = {
    			kind: record._source.kind,
    			id: record._source.id,
    			score: record._score,
    			image_url: (record._source.kind == 'person') ? 
    				getProfileUrlThumb(record._source.image) : 
    				getPosterUrlThumb(record._source.image)
    		};

    		if (data.kind == 'movie') {
    			const movie_response = await 
    				fetch('https://team10.d.calebj.io/dbservice/movie?movie_id=' 
					+ data.id);

				const movie_json = await movie_response.json();

				const movie_data = movie_json.record;

				data.title = movie_data.title;

    		} else if (data.kind == 'person') {
    			const person_response = await 
    				fetch('https://team10.d.calebj.io/dbservice/person?person_id=' 
					+ data.id);
					
				const person_json = await person_response.json();

				const person_data = person_json.record;

				data.name = person_data.name;
    		}

    		return data;
    	});

    data.results = await Promise.all(recordPromises);

	return data;
}

const renderPersonCard = (person, index) => (
	<LinkedCard key={person.id} 
		image_url={ person.image_url }
		details_path={ '/present/person?' + person.id }
		is_movie={ false }
	>
		<Typography variant="title" gutterBottom>
			{ index }. { person.name }
		</Typography>
		<Typography>
			<strong>Type:</strong> person
		</Typography>
	</LinkedCard>
)

const renderMovieCard = (movie, index, logged_in) => (
	<LinkedCard key={movie.id} 
		image_url={ movie.image_url }
		details_path={ '/present/movie?' + movie.id }
		is_movie={ true }
		logged_in={ logged_in }
		id={ movie.id }
	>
		<Typography variant="title" gutterBottom>
			{ index }. { movie.title }
		</Typography>
		<Typography>
			<strong>Type:</strong> movie
		</Typography>
	</LinkedCard>
);

class ResultsPage extends Component {
	state = {
		query: this.props.query_string,
		results: this.props.results,
		total_results: this.props.total_results,
		current_offset: 0,
		results_per_page: 10
	};

	handleNextButtonClick = () => {
		fetchData(
			this.state.query, 
			this.state.current_offset + this.state.results_per_page, 
			this.state.results_per_page)
			.then(({ results }) => {
				this.setState({
					results: results,
					current_offset: this.state.current_offset + this.state.results_per_page
				});
			});
	};

	handleBackButtonClick = () => {
		fetchData(
			this.state.query, 
			this.state.current_offset - this.state.results_per_page, 
			this.state.results_per_page)
			.then(({ results }) => {
				this.setState({
					results: results,
					current_offset: this.state.current_offset - this.state.results_per_page
				});
			});
	};

	render() {
		const { classes, query_string, logged_in } = this.props;

		const max_page_last_index = this.state.current_offset + this.state.results_per_page;
		const page_last_index = (max_page_last_index > this.state.total_results) ? 
			this.state.total_results : max_page_last_index;

		return (
			<Layout logged_in={ logged_in }>
				<section className={ classes.root }>
					<header className={ classes.header }>
						<Typography variant='subheading' classes={{ root: classes.heading_root }}>
							Showing results { this.state.current_offset + 1 }
							–
							{ page_last_index } of { this.state.total_results } for: { this.state.query }
						</Typography>
						<div>

							<IconButton
								disabled={ this.state.current_offset == 0 }
								onClick={ this.handleBackButtonClick }
							>
								<KeyboardArrowLeft />
							</IconButton>
							<IconButton
								disabled={ this.state.current_offset >= this.state.total_results - this.state.results_per_page }
								onClick={ this.handleNextButtonClick }
							>
								<KeyboardArrowRight />
							</IconButton>
							
						</div>
					</header>
					<div className={ classes.results_container }>
						{ this.state.results.map((result, index) => 
							result.kind == 'movie' ? 
							renderMovieCard(result, index + 1 + this.state.current_offset, logged_in) : 
							renderPersonCard(result, index + 1 + this.state.current_offset) ) }
					</div>
				</section>
			</Layout>
		);
	}
}

ResultsPage.getInitialProps = async ({ req, asPath }) => {
	const prop_data = {};

	if (req) {
    	prop_data.logged_in = Boolean(req.user);

    } else {
    	const res = await fetch('https://team10.d.calebj.io/user_data', {
    		mode: 'cors',
    		credentials: 'include'
    	});

    	const json = await res.json();

    	prop_data.logged_in = Boolean(json.user);
    }

    const query_string = decodeURI(asPath.replace(/^.*\?/,''));

    prop_data.query_string = query_string;

    const fetchedData = await fetchData(query_string, 0, 10);

    prop_data.results = fetchedData.results;
    prop_data.total_results = fetchedData.total_results;

	return prop_data;
}

export default withStyles(styles)(ResultsPage);