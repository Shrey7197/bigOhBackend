import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Hospital from './Hospital';
import Police from './Police';

class App extends Component {
  state = {
    response: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.exp }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/hospitals');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="App">
      {
        // <p className="App-intro">{this.state.response}</p>
      }

        <Router>
           <div>

              <Switch>
                 <Route exact path='/' component={Home} />
                 <Route exact path='/hospital' component={Hospital} />
                 <Route exact path='/police' component={Police} />
              </Switch>
           </div>
        </Router>

      </div>
    );
  }
}

export default App;
