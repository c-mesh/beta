import React,{Component} from 'react';
import axios from "axios/index";
import ReactGA from 'react-ga';


// TODO: refactor
class PersonPanel extends Component {

    constructor(props) {
        super(props);
    }

    updateUserProfileView() {
        ReactGA.event({category: 'ProfileView', action: 'View'})
    }

    renderBookmarkButton() {
    }

    render(){
        const userId = this.props.userId;
        const getUrl = window.location;
        const baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
        const name = this.props.firstName +" "+
        (this.props.lastName ? this.props.lastName.toUpperCase().charAt(0)+"." : "")
        return(
        <div className="panel">
            <div className="panel-body">
                <div className="avatar">
                    <img src={this.props.photo} className="img-circle"/>
                </div>
                <div className="desc">
                    <div className="title-container">
                        <div className="full-name">{name}</div>
                        { this.renderBookmarkButton() }
                    </div>
                    <div className="job">{this.props.job}</div>
                    <a href={this.props.linkedinURL} target="_blank" onClick={() => this.updateUserProfileView()}>
                        <img className="img img-responsive" src={baseUrl+"assets/images/view_linkedin.png"}
                        width="70" height="70"/>
                    </a>
                </div>
            </div>
        </div>
        )
    }
}

export default PersonPanel;
