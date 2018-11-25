import "isomorphic-fetch";

import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Header from './Header';

const styles = theme => ({
  root: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 20,
  },
});

/* The Layout component
   --------------------
   UI component which composed with every webpage
   and forms the basis of the main UI. Consists
   of a simple header, main section in which
   other elements are composed, and (currently)
   unused footer. Establishes top-level
   grid which consists of three rows for header,
   main, and footer respectively.
*/

class Layout extends React.Component {
  

  render() {
    return (
      <section className="main_container">
        <Header logged_in={ this.props.logged_in } />
        {
          this.props.children
        }
      </section>
    );
  }
}


// export component
export default Layout;