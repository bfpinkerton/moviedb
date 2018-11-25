import Layout from '../components/Layout';
import DataUtil from '../scripts/dataUtilities.js';

import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';

import LinkedCard from '../components/LinkedCard';
import Typography from '@material-ui/core/Typography';

import SortedCards from '../components/SortedCards';

import fetch from "node-fetch";

const { getGender, getProfileUrlLarge, getPosterUrlThumb } = DataUtil;

const styles = theme => ({
	root: {

	},
	profileCard: {
		display: 'flex',
		width: '24rem',
		height: '16rem',
		margin: '4rem auto'
	},
	profileImg: {
		height: '100%',
		width: 'auto',
	}
});

const renderCastRecords = (cast_records) => {
	if (cast_records.length != 0) {
		return (
			<SortedCards
				title="Roles"
				data={ cast_records }
				card_function={ record => (
					<LinkedCard key={record.id} 
						image_url={ record.thumb_poster_url }
						details_path={ '/present/movie?' + record.movie_id }
						is_movie={ true }
						logged_in={ true }
						id={ record.movie_id }
					>
						<Typography variant="title" gutterBottom>
							{ record.title }
						</Typography>
						<Typography variant="body2">
							{ record.role }
						</Typography>
					</LinkedCard>
				) }
				default_sort_by='title'
				sorting_method_names={[
					{ name: 'title', display_name: 'Title' },
					{ name: 'role', display_name: 'Role' },
					{ name: 'popularity', display_name: 'Popularity' }
				]}
				sorting_functions={{
					'title': (m1, m2) => m1.title > m2.title,
					'role': (m1, m2) => m1.role > m2.role,
					'popularity': (m1, m2) => m1.popularity > m2.popularity
				}}
			/>
		);
	} else {
		return '';
	}
}

const renderCrewRecords = (crew_records) => {
	if (crew_records.length != 0) {
		return (
			<SortedCards
				title="Worked On"
				data={ crew_records }
				card_function={ record => (
					<LinkedCard key={record.id} 
						image_url={ record.thumb_poster_url }
						details_path={ '/present/movie?' + record.movie_id }
						is_movie={ true }
						logged_in={ true }
						id={ record.movie_id }
					>
						<Typography variant="title" gutterBottom>
							{ record.title }
						</Typography>
						<Typography variant="body2">
							{ record.department }, { record.job }
						</Typography>
					</LinkedCard>
				) }
				default_sort_by='title'
				sorting_method_names={[
					{ name: 'title', display_name: 'Title' },
					{ name: 'department', display_name: 'Department' },
					{ name: 'popularity', display_name: 'Popularity' }
				]}
				sorting_functions={{
					'title': (m1, m2) => m1.title > m2.title,
					'department': (m1, m2) => m1.department > m2.department,
					'popularity': (m1, m2) => m1.popularity > m2.popularity
				}}
			/>
		);
	} else {
		return '';
	}
}

const PersonPage = ({ 
	classes, name, gender, large_profile_pic_url, crew_records, cast_records, id, logged_in
}) => (
	<Layout logged_in={ logged_in }>
		<div className={ classes.root }>

			<section>

				<Card className={ classes.profileCard }>
					<CardMedia 
						image={ large_profile_pic_url } 
						component='img' 
						className={ classes.profileImg }
					/>
					<CardContent>
						<Typography variant="headline" gutterBottom>
							{ name }
						</Typography>
						<Typography variant='body2' gutterBottom>
							Gender
						</Typography>
						<Typography>
							{ gender }
						</Typography>
					</CardContent>
				</Card>

			</section>
			<section>
				{ renderCastRecords(cast_records) }
				{ renderCrewRecords(crew_records) }
			</section>

		</div>
	</Layout>
)

PersonPage.getInitialProps = async ({ req, asPath }) => {
	let prop_data = {
		cast_records: [],
		crew_records: []
	};
	let person_data = {};

	if (req) {
    	prop_data.user = req.user;
    	prop_data.logged_in = Boolean(req.user);
    }

	const id_string = asPath.replace(/^.*\?/,'');
	const id = Number(id_string);

	const response = await fetch('https://team10.d.calebj.io/dbservice/person?person_id=' 
		+ id_string);
	const person_json = await response.json();

	person_data = person_json.record;

	prop_data.name = person_data.name;
	prop_data.gender = getGender(person_data.gender);
	prop_data.id = person_data.id;

	prop_data.large_profile_pic_url = 
		getProfileUrlLarge(person_data.profile_path);

	if (person_data.crewFor) {
		let crew_records = person_data.crewFor.map(async (crew_record) => {
			let crew_data = {
				id: crew_record.id,
				department: crew_record.department,
				job: crew_record.job
			};

			let movie_data = {};

			const movie_response = await fetch('https://team10.d.calebj.io/dbservice/movie?movie_id=' 
				+ crew_data.id);
			const movie_json = await movie_response.json();

			movie_data = movie_json.record;

			crew_data.title = movie_data.title;
			crew_data.thumb_poster_url = 
				getPosterUrlThumb(movie_data.poster_path);
			crew_data.movie_id = movie_data.id;
			crew_data.popularity = movie_data.popularity;

			return crew_data;
		});

		prop_data.crew_records = await Promise.all(crew_records);
	}

	if (person_data.castFor) {
		let cast_records = person_data.castFor.map(async (cast_record) => {
			let cast_data = {
				role: cast_record.character,
				id: cast_record.id
			};

			let movie_data = {};

			const movie_response = await fetch('https://team10.d.calebj.io/dbservice/movie?movie_id=' 
				+ cast_data.id);
			const movie_json = await movie_response.json();

			movie_data = movie_json.record;

			cast_data.title = movie_data.title;
			cast_data.thumb_poster_url = 
				getPosterUrlThumb(movie_data.poster_path);
			cast_data.movie_id = movie_data.id;
			cast_data.popularity = movie_data.popularity;

			return cast_data;
		});

		prop_data.cast_records = await Promise.all(cast_records);
	}

	return prop_data;
}

export default withStyles(styles)(PersonPage);