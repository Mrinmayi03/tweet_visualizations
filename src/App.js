import React, { Component } from 'react';
import './App.css';
import FileUpload from './FileUpload';
import TweetVisualization from './TweetVisualization'; // Import the TweetVisualization component

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonData: null,
    };
  }

  setJsonData = (data) => {
    this.setState({ jsonData: data });
  };      //Updates the jsondata structure

  render() {
    const { jsonData } = this.state;

    return (
      <div className="App">
        <FileUpload set_data={this.setJsonData} />
        <div id="dashboard">
          {jsonData && (
            <TweetVisualization data={jsonData} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
