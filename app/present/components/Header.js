import { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { Link } from '../../routes/index';

import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import Search from './Search';

const styles = theme => ({
	title: {
		marginRight: '1em'
	},
	navButton: {
		color: 'white'
	},
	spacer: {
		flexGrow: 1
	}
});

class Header extends Component {
	render() {
		const { classes, logged_in } = this.props;

		const favorites_button = logged_in ?
			(
				<Link href='/present/favorites'>
					<Button className={ classes.navButton }
						size='small'
					>
						Favorites
					</Button>
				</Link>
			)

			:

			'';

		const logged_in_button = logged_in ?
			(
				<Link href='/logout'>
					<Button className={ classes.navButton }
						size='small'
					>
						Log Out
					</Button>
				</Link>
			)

			:

			(
				<Link href='/login'>
					<Button className={ classes.navButton }
						size='small'
					>
						Log In
					</Button>
				</Link>
			);

		return (
			<div className={ classes.root }>
				<AppBar position="static">
					<Toolbar>
						<Typography 
							variant="title" 
							color="inherit" 
							className={ classes.title }
						noWrap>
	              			GigEmDB
	            		</Typography>
	            		<Link href='/'>
		            		<Button className={ classes.navButton }
								size='small'
							>
								Home
							</Button>
						</Link>
						{ favorites_button }
	            		<Search />
	            		<div className={ classes.spacer }/>
	            		{ logged_in_button }
					</Toolbar>
				</AppBar>
			</div>
		);
	}
}

export default withStyles(styles)(Header);