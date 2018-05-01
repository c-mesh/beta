import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import moment from 'moment';
import momentDurationFormatSetup from "moment-duration-format";

momentDurationFormatSetup(moment);

class MeshPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            timeRemaining: props.noTimer ? undefined : "--:--:--"
        };
        this.setTimeRemaining = this.setTimeRemaining.bind(this);
    }

    setTimeRemaining() {
        const getUrl = window.location;
        const baseUrl = getUrl .protocol + "//" + getUrl.host + "";

        const then =  moment(this.props.meshEndTime);
        const now = moment();
        const hours = moment.duration(then.diff(now)).asHours();
        const timeRemaining = (then.isBefore(now) || then.isSame(now)) ?
            window.open(baseUrl, '_self') : 
            moment.duration(hours, "hours").format("h:mm:ss")
            
        this.setState({timeRemaining})
    }

    componentDidMount(newProps) {
        if(this.props.meshEndTime) {
            this.interval = setInterval(this.setTimeRemaining, 1000)
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const getUrl = window.location;
        const baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
        return (
            <div className="panel mesh">
                <div className="panel-body">
                    <div className="panel-logo pull-left">
                            <img src={baseUrl + "assets/images/mesh_panel_icon.png"}
                                className="pull-left img img-responsive logo"
                            />
                    </div>
                    <div className="pull-left">
                        <div>
                            <p className="title">
                                <strong>{this.props.meshName}</strong>
                            </p>
                        </div>
                        <div className="row second-line">
                            <div className="pull-left">
                                <a className="btn btn-primary btn-lg join-btn"
                                style={{"visibility": this.props.isInfo?"hidden":"visible" }}>
                                Join
                                </a>
                            </div>
                            <div className="timer pull-right">
                                {
                                    this.state.timeRemaining ?
                                    <strong>{this.state.timeRemaining}</strong>:
                                    null
                                }
                            
                                {
                                    this.props.participantsCount || this.props.participantsCount === 0 ? 
                                    <span>
                                        <span className="separator"> | </span>
                                        <strong>{this.props.participantsCount || 0}</strong>
                                        <img src={baseUrl + "assets/images/users.png"}
                                            className="pull-right img img-responsive participants"/>        
                                    </span> :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(MeshPanel);