import React from 'react';
import PersonPanel from './PersonPanel.jsx'
import axios from "axios/index";
import ReactGA from 'react-ga';

// TODO: refactor
class LinkedinPanel extends PersonPanel {

    constructor(props) {
        super(props);
        this.updateUserProfileView = this.updateUserProfileView.bind(this);
        this.state = {
            bookmarked: props.bookmarked
        }
    }

    bookmarkClick() {
        let request = {
            person_id: this.props.userId
        }

        if (this.state.bookmarked) {
            ReactGA.event({category: 'Bookmark', action: 'Delete'})
            axios.delete(`/api/bookmark`, {data: {person_id: this.props.userId }}).then((result)=>{
                console.info(result);
            });
        } else {
            ReactGA.event({category: 'Bookmark', action: 'Add'})
            axios.post(`/api/bookmark`, request).then((result)=>{
                console.info(result);
            });
        }

        this.setState({bookmarked: !this.state.bookmarked})
    }

    renderBookmarkButton() {
        return (
            <img onClick={() => this.bookmarkClick()} className="bookmark" src={this.state.bookmarked ? "/assets/images/bookmark_selected.png" : "/assets/images/bookmark.png"}/>
        )
    }

    updateUserProfileView() {
        super.updateUserProfileView()
        console.log("Linkedin:updateUserProfileView with mesh id " + this.props.meshId)
        let data = {
            viewedUserId: this.props.userId,
            meshId: this.props.meshId,
            timestamp: Date.now(),
            activityType: "viewedLinkedinProfile"
        }
        axios.post(`/api/profileViewed`, data).then((result)=>{
            console.info("response for profile view");
        });
    }
}

export default LinkedinPanel;
