import { Link } from '../../routes/index';

import { withStyles } from '@material-ui/core/styles';
import { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

import Divider from '@material-ui/core/Divider';

import Button from '@material-ui/core/Button';

import FavoriteButton from './FavoriteButton';

import NoSsr from '@material-ui/core/NoSsr';

const styles = theme => ({
	thumb: {
		width: 'auto',
		height: '10rem'
	},

	details: {
		display: 'flex',
		flexDirection: 'row'
	},

	actions: {
		display: 'flex'
	},

	spacer: {
		flexGrow: 1
	}
});

class LinkedCard extends Component {

	render() {
		const { classes, children, image_url, details_path, 
			is_movie, logged_in, id, is_favorite, key } = this.props;

		const image = (image_url != '') ?
			(<CardMedia image={ image_url } className={ classes.thumb } component='img' key={ key } />) :
			(<div className={ classes.thumb } />);

		const icon = (is_movie && logged_in) ? 
			(
				<NoSsr>
					<FavoriteButton movie_id={ id } />
				</NoSsr>
			) 

			: 

			'';

		return (
			<div key={ key }>
				<Card>
					<div className={ classes.details } >
						{ image }
						<CardContent key={ key }>
							{ children }
						</CardContent>
					</div>
					<Divider light />
					<CardActions>
						<Link href={ details_path }>
							<Button
								size='small' 
								color='primary'
							>
								Details
							</Button>
						</Link>
						<div className={ classes.spacer } />
						{ icon }
					</CardActions>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(LinkedCard);