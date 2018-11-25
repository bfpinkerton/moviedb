import React from 'react';
import { Router } from '../../routes/index';
import fetch from 'node-fetch';

import { withStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

import SearchIcon from '@material-ui/icons/Search';

import Input from '@material-ui/core/Input';

import Autosuggest from 'react-autosuggest';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
	root: {
		position: 'relative',
    	borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
    	'&:hover': {
      		backgroundColor: fade(theme.palette.common.white, 0.25),
    	},
    	marginRight: '1rem',
	    marginLeft: '1rem',
	    width: '50%'
	},
	icon: {
		width: '2rem',
	    height: '100%',
	    position: 'absolute',
	    pointerEvents: 'none',
	    display: 'flex',
	    alignItems: 'center',
	    justifyContent: 'center'
	},
	inputRoot: {
	    color: 'inherit',
	    width: '100%',
	},
	inputInput: {
	    paddingTop: theme.spacing.unit,
	    paddingRight: theme.spacing.unit,
	    paddingBottom: theme.spacing.unit,
	    paddingLeft: theme.spacing.unit * 10,
	    transition: theme.transitions.create('width'),
	    width: '100%'
	},
	container: {
		position: 'relative'
	},
	suggestionsContainerOpen: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing.unit,
		left: 0,
		right: 0
	},
	suggestion: {
		display: 'block'
	},
	suggestionsList: {
		margin: 0,
		padding: 0,
		listStyleType: 'none'
	}
});

const renderInputComponent = (props) => {
	const { classes, ref, ...otherProps } = props;

	return (
		<Input 
			classes={{
				root: classes.inputRoot,
				input: classes.inputInput
			}}
			inputRef={ ref }
			{ ...otherProps }
		/>
	);
};

const renderSuggestion = (suggestion, { isHighlighted }) => {
	return (
		<MenuItem selected={ isHighlighted }>
			{ suggestion.label }
		</MenuItem>
	);
};

const renderSuggestionsContainer = ({ containerProps, children }) => {
	return (
		<Paper square { ...containerProps }>
			{ children }
		</Paper>
	);
};

const getSuggestionValue = suggestion => {
	return suggestion.label;
};

class Search extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);

		this.handleSuggestionsFetchRequested = this.handleSuggestionsFetchRequested.bind(this);
		this.handleSuggestionsClearRequested = this.handleSuggestionsClearRequested.bind(this);
		this.handleSuggestionSelected = this.handleSuggestionSelected.bind(this);

		this.searchInput = null;

		this.setSearchInputRef = input => {
			this.searchInput = input;
		};

		this.state = {
			value: '',
			suggestions: []
		}
	}

	handleSubmit(event) {
		event.preventDefault();

		const query_string = encodeURI(this.state.value);
		Router.pushRoute('/present/results?' + query_string);
	}

	handleChange(event) {
		this.setState({
			value: event.target.value
		});
	}

	handleSuggestionsFetchRequested({ value }) {
		const that = this;

		fetch('https://team10.d.calebj.io/searchapi/autocomplete?q=' +
			encodeURI(value) + '&num=10', {
				method: 'POST',
				credentials: 'include',
				mode: 'cors'
			}).then(
				res => res.json()
			).then(json => {
				const suggestions = json.suggest.suggestion[0]
					.options.map(option => ({ label: option.text }));

				that.setState({ suggestions });
			});
	}

	handleSuggestionsClearRequested() {
		this.setState({
			suggestions: []
		});
	}

	handleSuggestionSelected(event, { suggestionValue }) {
		this.setState({
			value: suggestionValue
		});
	}

	render() {
		const { classes } = this.props;

		return (
			<div className={ classes.root }>
				<div className={ classes.icon }>
					<SearchIcon />
				</div>
				<form onSubmit={ this.handleSubmit }>
					<Autosuggest
						suggestions={ this.state.suggestions }
						renderInputComponent={ renderInputComponent }
						renderSuggestion={ renderSuggestion }
						renderSuggestionsContainer={ renderSuggestionsContainer }
						onSuggestionsFetchRequested={ this.handleSuggestionsFetchRequested }
						onSuggestionsClearRequested={ this.handleSuggestionsClearRequested }
						getSuggestionValue={ getSuggestionValue }
						onSuggestionSelected={ this.handleSuggestionSelected }
						inputProps={{
							classes,
							placeholder: 'Search...',
							type: 'search',
							value: this.state.value,
							onChange: this.handleChange,
							disableUnderline: true,
							ref: this.setSearchInputRef
						}}
						theme={{
							container: classes.container,
							suggestionsContainerOpen: classes.suggestionsContainerOpen,
							suggestionsList: classes.suggestionsList,
							suggestion: classes.suggestion
						}}
					/>
				</form>
			</div>
		);
	}
}

export default withStyles(styles)(Search);