import React from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router-dom";
import axios from 'axios';
import Loader from '../Loader.jsx';
import { Button, Modal } from 'react-bootstrap';
import MeshPanel from '../MeshPanel.jsx';
import MeshTutorial from '../MeshTutorial.jsx';
import TermsAndConditions from '../TermsAndConditions.jsx';
import LinkedinPanel from '../LinkedinPanel.jsx';
import FeedbackBtn from "../Feedback.jsx";
import {
    getCurrentPositionAsync
} from '../../lib/utils';

import {
    getDistanceBetweenAsync,
    getStraightDistanceBetween
} from '../../lib/maps';

import {
    leaveMeshAsync
} from '../../lib/api/mesh';

class Mesh extends React.Component {

    constructor(props){
        super(props);
        this.state={
            users:[],
            showModal: false,
            gotIt:false
        };
        this.timer = null;
        this.positionTimer = null;

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);

        this.checkPositionPeriodically = this.checkPositionPeriodically.bind(this);
        this.feedbackButtonClick = this.feedbackButtonClick.bind(this);

        window.onfocus = () => {
            console.error("focus")
            let data = {
                meshId: this.props.currentMeshID,
                userId: this.props.userId,
                timestamp: Date.now(),
                activityType: "browser Active"

            }
            axios.post(`/api/browserActive`, data).then((result)=>{
                console.info("response for active");
            });
        };

        window.onblur = () => {
            console.error("blur")
            let data = {
                meshId: this.props.currentMeshID,
                userId: this.props.userId,
                timestamp: Date.now(),
                activityType: "browser InActive"

            }
            axios.post(`/api/browserInactive`, data).then((result)=>{
                console.info("response for inactive");
            });
        }
    }

    feedbackButtonClick() {
        let data = {
            meshId: this.props.currentMeshID,
            userId: this.props.userId,
            timestamp: Date.now(),
            activityType: "feedbackButtonClicked"

        }
        axios.post(`/api/feedbackClicked`, data).then((result)=>{
            console.info("response for active");
        });
    }

    close() {
        this.setState({ showModal: false });
    }

    open() {
        this.setState({ showModal: true });
    }

    checkPositionPeriodically() {
        console.log('\n\n');
        console.log('# checkPositionPeriodically #');

        const currentDate = new Date();
        if (currentDate.getTime() > this.props.currentMeshEndTimeMilliSec) {
            if (this.positionTimer) {
                clearInterval(this.positionTimer);
            }
            history.push('/');
        }

        const currentMeshPosition = this.props.currentMeshCoordinate;

        getCurrentPositionAsync( (currentPosition) => {
            console.log('\n\n');
            console.log('Current Position: ', currentPosition);


            // getDistanceBetweenAsync(currentPosition, currentMeshPosition, function(drivingDistance) {
            //     console.log('Driving Distance: ', drivingDistance)
            //     // if (drivingDistance && drivingDistance.value > 2 /* kilometers */ * 1000) {
            //     //     leaveMesh(this.props.currentMeshID);
            //     //     window.location.href = "/"; // Force refresh
            //     // }
            // });

            const straightLineDistance = getStraightDistanceBetween(currentPosition, currentMeshPosition);
            console.log('Straight-Line Distance: ', straightLineDistance);
            if (straightLineDistance > 200) { // Outside 200m radius
                console.log('straightLineDistance is greator than the limit');

                leaveMeshAsync(this.props.currentMeshID, function () {
                    window.location.href = "/"; // Force refresh
                });
            }
        });
    }

    intervalFunc(){
        var that = this;
        var rightNow = new Date();
        if (rightNow.getTime() > this.props.currentMeshEndTimeMilliSec) {
            alert("This Mesh Has Expired");
            if (this.timer) clearInterval(this.timer);
            history.push('/');
        } else {
            console.log('\n\n');
            console.log("intervalFunc before GET");
            axios.get(`/api/mesh/${this.props.currentMeshID}`).then((result)=>{
                console.log('result:' + result);
                var mesh = result.data;
                mesh.meshId = mesh._id;
                var users = mesh.users;
                console.log('this.intervalFunc: ' + users);
                that.setState({
                    users: users || [],
                    dataReceived: true
                },()=>{
                    that.props.updateMesh(mesh);
                });
            });
        }
    }

    getMeshDetails() {
        var that = this;
        axios.get(`/api/mesh/${this.props.currentMeshID}`).then((result)=>{
            console.log('result:' + result);
            var mesh = result.data;
            mesh.meshId = mesh._id;
            var users = mesh.users;
            console.log('this.intervalFunc: ' + users);
            that.setState({
                users: users || [],
                dataReceived: true
            },()=>{
                that.props.updateMesh(mesh);
            });
        });
    }



    componentDidMount(){
        this.props.updateHomeShow();
        this.getMeshDetails();
        console.log("Mesh.jsx componentDidMount");
        if (this.props.username) {
            this.intervalFunc();
            this.timer = setInterval(this.intervalFunc.bind(this), 6000);

            // setTimeout(this.checkPositionPeriodically, 15 * 1000); // Initially check position after 15 seconds
            this.positionTimer = setInterval(this.checkPositionPeriodically, 1 /* minutes */ * 60 *1000);
        }
        let data = {
            meshId: this.props.currentMeshID,
            userId: this.props.userId,
            timestamp: Date.now(),
            activityType: "browser Active"

        }
        axios.post(`/api/browserActive`, data).then((result)=>{
            console.info("response for inactive");
        });

        let meshJoinedData = {
            meshId: this.props.currentMeshID,
            userId: this.props.userId,
            timestamp: Date.now(),
            activityType: "JoinedOn"

        }
        axios.post(`/api/meshJoined`, meshJoinedData).then((result)=>{
            console.info("response for inactive");
        });

    }

    componentWillUnmount(){
        clearInterval(this.timer);
        clearInterval(this.positionTimer);
        window.onfocus = null;
        window.onblur = null;
        let data = {
            meshId: this.props.currentMeshID,
            userId: this.props.userId,
            timestamp: Date.now(),
            activityType: "meshLeaveOn"

        }
        axios.post(`/api/meshLeaveOn`, data).then((result)=>{
            console.info("response for inactive");
        });
    }

    componentDidUpdate(){
        this.render();
    }

    waveClick(data) {
        let request = {
            wave_to: data._id
        }
        axios.post(`/api/wave`, request).then((result)=>{
            console.info("waved");
        });
    }

    renderWaveButton(data) {
        const in_only = data.wave_in && !data.wave_out
        const out_only = !data.wave_in && data.wave_out
        const mutual = data.wave_in && data.wave_out

        if (in_only) {
            return (
                <img src="/assets/images/hand.png" className="hand-wave-incoming-img" onClick={() => this.waveClick(data)}/>
            )
        } else if (out_only) {
            return (
                <img src="/assets/images/hand.png" className="hand-wave-outgoing-img"/>
            )
        } else if (mutual) {
            return (
                <img src="/assets/images/hand_mutual.png" className="hand-wave-mutual-img"/>
            )
        } else {
            return (
                <img src="/assets/images/hand.png" className="hand-wave-img" onClick={() => this.waveClick(data)}/>
            )
        }
    }

    renderMeshParticipants(){
        const that = this;
        return (
            <div>
            {
                this.state.users.map((v, i) => {
                return (
                    v.acceptedTermsAndConditions ?
                    <div className="row user" key={i}>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2"
                            id="v.fullName" key={i}>
                            <LinkedinPanel photo={v.photo}
                                fullName={v.fullName}
                                job={v.job}
                                firstName={v.firstName}
                                lastName={v.lastName}
                                linkedinURL={v.linkedinURL}
                                userId={v._id}
                                bookmarked={v.bookmarked}
                                meshId={this.props.currentMeshID}/>
                        </div>
                    </div>:
                    null
                    );
                })
            }
            </div>
        )
    }

    renderHasUserContent(){
        const that = this;
        return (
            <div className="container mesh-page">
                <div className="row">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                    <MeshPanel
                        isInfo={true}
                        meshEndTime={this.props.currentMeshEndTime}
                        meshName={this.props.currentMeshName}
                        participantsCount={this.props.currentMeshParticipantsCount}/>
                        {/*<FeedbackBtn url="https://docs.google.com/forms/d/e/1FAIpQLSfoVVzQv3F8LMsePna53XnUYr3e_AU22JVIBcCtKsykblvdYg/viewform?usp=sf_link"*/}
                                     {/*className="pull-right"/>*/}
                        <a className={"feedback-btn pull-right "+(this.props.className||"")} href={"https://docs.google.com/forms/d/e/1FAIpQLSfoVVzQv3F8LMsePna53XnUYr3e_AU22JVIBcCtKsykblvdYg/viewform?usp=sf_link'" || "#"} style={{top: 0}} onClick={() => {this.feedbackButtonClick()}}>feedback</a>
                        <hr/>
                    </div>
                </div>
                {
                    this.state.gotIt ?
                    this.renderMeshParticipants():
                    <div>
                        <MeshTutorial
                            meshPanel={
                                <MeshPanel
                                    isInfo={true}
                                    meshEndTime={this.props.currentMeshEndTime}
                                    meshName={this.props.currentMeshName}
                                    participantsCount={this.props.currentMeshParticipantsCount}/>
                            }
                            linkedinPanel={
                                <LinkedinPanel photo={this.props.photo}
                                    fullName={this.props.userFullName}
                                    job={this.props.job}
                                    firstName={this.props.firstName}
                                    lastName={this.props.lastName}
                                    linkedinURL={this.props.linkedinURL}
                                    userId={this.props.userId}
                                    bookmarked={true}
                                />
                            }
                            onGotIt={()=>{this.setState({gotIt:true})}}
                        />
                    </div>
                }
            </div>
        )
    }

    render() {
        var that = this;
        let content = null;
        if(!this.state.dataReceived){
            content = null
        }else if(this.props.username && this.props.acceptedTermsAndConditions) {
            content = this.renderHasUserContent()
        }
        return (
            <div>
                <Loader showLoader={!this.state.dataReceived}/>
                {content}
            </div>
        );
    }
}

export default withRouter(Mesh);


{/* <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Terms and Agreement</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Some terms and agreement
                        </Modal.Body>
                    <Modal.Footer>
                        <a href={`/auth/linkedin/join-mesh/${this.props.currentMeshID}/${this.props.currentMeshName}/${this.props.currentMeshEndTimeMilliSec}/`} className="btn btn-primary">
                            Agree
                        </a>
                    </Modal.Footer>
                </Modal> */}

            //     <div className="panel">
            //     <div className="panel-body">
            //         <div className="avatar">
            //             <img src={v.photo} className="img-circle"/>
            //         </div>
            //         <div className="desc">
            //             <div className="full-name">{v.fullName}</div>
            //             <div className="job">{v.job}</div>
            //             <a href={v.linkedinURL} target="_blank">
            //                 <img src="/assets/images/linkedin_icon.png" width="35" height="35"/>
            //             </a>
            //         </div>
            //     </div>
            // </div>


            // renderHasNoUserContent() {
    //     const that = this;
    //     return (
    //         <div className="container mesh-page">
    //             <div className="row fixed-top">
    //                 <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
    //                     <MeshPanel
    //                         isInfo={true}
    //                         meshEndTime={this.props.currentMeshEndTime}
    //                         meshName={this.props.currentMeshName}
    //                         participantsCount={this.props.currentMeshParticipantsCount}/>
    //                 </div>
    //             </div>
    //             <div style={this.setContentHeight()}>
    //                 <TermsAndConditions
    //                     linkedInUrl={`/auth/linkedin/join-mesh/${this.props.currentMeshID}/${this.props.currentMeshName}/${this.props.currentMeshEndTimeMilliSec}/`}
    //                 />
    //             </div>
    //          </div>
    //     )
    // }

    // setContentHeight(){
    //     return {height: screen.height+"px"}
    // }
