import React , { Component } from "react";
import './FileUpload.css';


class FileUpload extends Component {
    constructor(props) {
        super(props);
            this.state = {
                file: null,
                jsonData: null
            };
    }

    handleSubmit = (event) => {
        event.preventDefault();     //prevents the default file submission behavior
        const {file} = this.state;

        if (file){
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target.result;
                const json = JSON.parse(text);
                this.setState({jsonData: json});
                this.props.set_data(json);
            };

            reader.readAsText(file);
        }
    };

    render() {
        return (
            <div className="file_upload">
                <h2>Upload a JSON File</h2>
                <form onSubmit={this.handleSubmit}>
                    <input type="file" accept=".json" onChange={(event) => this.setState({ file: event.target.files[0] })} />
                    <button type="submit">Upload</button>
                </form>
            </div>
        );
    }
}

export default FileUpload;