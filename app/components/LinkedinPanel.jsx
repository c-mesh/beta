import React,{Component} from 'react';
import axios from "axios/index";

class LinkedinPanel extends Component {

    constructor(props) {
        super(props);
        this.updateUserProfileView = this.updateUserProfileView.bind(this);
    }

    updateUserProfileView(userId, meshId) {
        let data = {
            viewedUserId: userId,
            meshId: meshId,
            timestamp: Date.now(),
            activityType: "viewedLinkedinProfile"
        }
        axios.post(`/api/profileViewed`, data).then((result)=>{
            console.info("response for profile view");
        });
    }

    render(){
        const userId = this.props.userId;
        const getUrl = window.location;
        const meshId = this.props.meshId;
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
                    <div className="full-name">{name}</div>
                    <div className="job">{this.props.job}</div>
                    <a href={this.props.linkedinURL} target="_blank" onClick={() => this.updateUserProfileView(userId, meshId)}>
                        <img className="img img-responsive" src={baseUrl+"assets/images/view_linkedin.png"}
                        width="70" height="70"/>
                    </a>
                </div>
            </div>
        </div>
        )
    }
}

export default LinkedinPanel;