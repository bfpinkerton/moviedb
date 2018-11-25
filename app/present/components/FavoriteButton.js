import { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import fetch from 'node-fetch';

import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteOutlinedIcon from './FavoriteOutlined';

import Button from '@material-ui/core/Button';

const styles = theme => ({
	extendedIcon: {
		marginRight: theme.spacing.unit / 2,
		marginTop: theme.spacing.unit / 2
	}
});

const handleClick = function () {
	const is_favorite = this.state.is_favorite;
	const movie_id = this.props.movie_id;

	const button = this;

	if (is_favorite) {
		fetch(
			'https://team10.d.calebj.io/dbservice/movies/' + 
			movie_id + 
			'/favorite',
			{
				method: 'DELETE',
				mode: 'cors',
				credentials: 'include'
			}
		).then((res) => {

			button.setState({
				is_favorite: false
			});
		});
	} else {
		fetch(
			'https://team10.d.calebj.io/dbservice/movies/' + 
			movie_id + 
			'/favorite',
			{
				method: 'POST',
				mode: 'cors',
				credentials: 'include'
			}
		).then((res) => {

			button.setState({
				is_favorite: true
			});
		});
	}
}

const renderIconOnly = function(is_favorite) {
	const icon = is_favorite ? 
		(<FavoriteIcon />) : 
		(<FavoriteOutlinedIcon />);

	return (
		<IconButton color='primary' onClick={handleClick.bind(this)}>
        	{ icon }
        </IconButton>
    )
}

const renderExtended = function(is_favorite, classes) {
	const icon = is_favorite ? 
		(<FavoriteIcon color='white' />) : 
		(<FavoriteOutlinedIcon color='white' />);
	const text = is_favorite ? 'Unfavorite' : 'Favorite';

	return (
		<Button 
			variant="extendedFab" 
			color='primary' 
			onClick={handleClick.bind(this)}
		>
        	<span className={ classes.extendedIcon }>{ icon }</span> { text }
        </Button>
    )
}

class FavoriteButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
			is_favorite: false
		}
	}

	componentDidMount() {
		const button = this;

		fetch(
			'https://team10.d.calebj.io/dbservice/movies/' + 
			this.props.movie_id + 
			'/favorite',
			{
				mode: 'cors',
				credentials: 'include'
			}
		).then(res => {
			return res.json();
		}).then(json => {

			button.setState({
				is_favorite: json.is_favorited
			});
		});	
	}

	render() {
		const is_favorite = this.state.is_favorite;
		const { classes } = this.props;

		return this.props.extended ? 
			(renderExtended.call(this, is_favorite, classes)) : 
			(renderIconOnly.call(this, is_favorite));
	}
}

export default withStyles(styles)(FavoriteButton);