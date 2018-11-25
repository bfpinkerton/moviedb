import { Component } from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import NoSsr from '@material-ui/core/NoSsr';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	root: {
		padding: '1rem',
		margin: 'auto'
	},
	cardGrid: {
		display: 'grid',
		gridGap: '1rem',
		justifyContent: 'center',
		gridTemplateColumns: '100%'
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		flexAutoFlow: 'row',
		marginBottom: '1rem'
	},
	button: {
		display: 'flex',
		justifyContent: 'center',
		marginTop: '2em'
	},
	'@media (min-width: 600px)': {
		root: {
			width: '33rem'
		}
	},
	'@media (min-width: 800px)': {
		root: {
			width: '51rem'
		},
		cardGrid: {
			gridTemplateColumns: 'repeat(2, 24rem)'
		}
	},
	'@media (min-width: 1400px)': {
		root: {
			width: '76rem'
		},
		cardGrid: {
			gridTemplateColumns: 'repeat(3, 24rem)'
		}
	}
});

class SortedCards extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			sort_by: props.default_sort_by,
			show_all: false
		};
	}

	handleSortChange({ target }) {
		this.setState({
			sort_by: target.value
		})
	}

	handleShowChange() {
		this.setState({
			show_all: !this.state.show_all
		});
	}

	render() {
		const { classes, title, card_function, data, sorting_method_names, sorting_functions } = this.props;

		const show_button_text = (this.state.show_all) ? 'Show Less' : 'Show All';

		return (
			<NoSsr>
				<div className={ classes.root }>
					<header className={ classes.header }>
						<Typography variant='display1' gutterBottom>
							{ this.props.title }
						</Typography>
						<form>
							<FormControl>
								<InputLabel htmlFor="sort-control">Sort By</InputLabel>
								<Select 
									value={ this.state.sort_by } 
									onChange={this.handleSortChange.bind(this)} 
									inputProps={{
										name: 'sort-by',
										id: 'sort-control'
									}
								}>
									{ sorting_method_names.map(method => (
										<MenuItem value={ method.name }>{ method.display_name }</MenuItem>
									)) }
								</Select>
							</FormControl>
						</form>
					</header>
					<div className={ classes.cardGrid }>
						{ 
							data
								.sort( 
									sorting_functions[ this.state.sort_by ] 
								)
								.slice(0, (this.state.show_all) ? data.length : 4)
								.map(card_function)
						}
					</div>

					{
						(data.length > 4) 

						?

						(
							<div className={ classes.button }>
								<Button 
									color="primary" 
									size="large"
									variant="outlined"
									onClick={ this.handleShowChange.bind(this) }
								>
									{ show_button_text }
								</Button>
							</div>
						) 

						:

						''
					}

					
				</div>
			</NoSsr>
		);
	}
}

export default withStyles(styles)(SortedCards);