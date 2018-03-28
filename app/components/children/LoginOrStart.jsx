import React from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router-dom";
import history from '../../history.js';
import { Button, Modal } from 'react-bootstrap';
import Loader from '../Loader.jsx';
import MeshPanel from '../MeshPanel.jsx';
import PlusButton from '../PlusButton.jsx';
import ContactUs from '../ContactUs.jsx';
import TermsAndConditions from '../TermsAndConditions.jsx';
import FeedbackBtn from '../Feedback.jsx';

class LoginOrStart extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showModal1: false,
            showModal2 : false,
            mesh: {}
        };
        this.close1 = this.close1.bind(this);
        this.open1 = this.open1.bind(this);
        this.close2 = this.close2.bind(this);
        this.open2 = this.open2.bind(this);
    }

    close1() {
        this.setState({ showModal1: false });
    }

    open1() {
        this.setState({ showModal1: true });
    }
    close2() {
        this.setState({ showModal2: false });
    }

    open2(meshID, meshName, meshEndTimeMilliSec) {
        this.setState({
            showModal2: true,
            redirectMeshID: meshID,
            redirectMeshName: meshName,
            redirectMeshEndTimeMilliSec: meshEndTimeMilliSec
        });
    }

    renderLogo() {
        return (
            <div>
            {
                this.state.showJoinMeshTermsAndCondition ? null : (
                    <div className="container fixed-logo">
                        <div className="img-container">
                        <a href="/">
                            <img src="/assets/images/logo.png" className="img-responsive center-block"/>
                        </a>
                        </div>
                        {
                            this.props.meshes.length > 0 ?
                            <FeedbackBtn url="https://docs.google.com/forms/d/e/1FAIpQLSfoVVzQv3F8LMsePna53XnUYr3e_AU22JVIBcCtKsykblvdYg/viewform?usp=sf_link"
                             className="pull-right"/>:
                            null
                        }
                        <hr/>
                    </div>
                )
            }
            </div>
        );
    }

    renderJoinANetworkLabel() {
        return (
            <div className="row">
                <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                    {
                        this.props.meshes.length > 0 ?
                        <h3 className="active-mesh-network">Join a mesh network:</h3>:
                        null
                    }
                </div>
            </div>
        )
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    renderLocationServiceExplain() {
        return(
            <div className="location-service-explain">
            <h1 className="title">
                Ooops!
            </h1>
            <h2 className="details">
                This {this.props.browserName} does not have an access to location services
           </h2>
           <img src={"/assets/images/location_service_disabled_" + this.props.browserName.toLowerCase() + ".jpg"} className="browser-pic"/>
            
            <h2 className="details">
                We need to know your location to find events near you.
           </h2>
            To enable location:
            {
                this.isIOS() ?
                    <ul><li>Settings > Privacy > Location</li><li>Turn location services: <b>ON</b></li><li>Select your browser app ({this.props.browserName}); select <b>'While using the app'</b></li></ul>
                    :
                    <ul><li>Settings > Apps</li><li>Select your browser app ({this.props.browserName});</li><li>Browser app > permissions; turn location services: <b>ON</b></li></ul>
            }

           </div>
        )
    }
  
    renderTermsAndConditions() {
        return(
            <div>
                <div style={(()=>{
                        return {height: screen.height+"px"}
                    })()}>
                    <TermsAndConditions
                        linkedInUrl="/auth/linkedin/page/form"
                        logoOnTop={true}/>
                </div>
            </div>
        );
    }

    renderTermsAndConditionsPanel() {
        const that = this;
        return (
            <div className="container mesh-page">
                <div className="row fixed-top">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <MeshPanel
                            isInfo={true}
                            meshEndTime={that.state.mesh.meshEndTime}
                            meshName={that.state.mesh.meshName}
                            participantsCount={that.state.mesh.users ? that.state.mesh.users.length : undefined}/>
                    </div>
                </div>
                <div className="row" style={that.setContentHeight()}>
                    <TermsAndConditions
                        linkedInUrl={`/auth/linkedin/join-mesh/${that.state.mesh._id}/`+
                        `${that.state.mesh.meshName}/${this.state.mesh.meshEndTime}/`}
                    />
                </div>
             </div>
        )
    }

    renderMeshes() {
        const that = this;
        return(
            <div>
                { 
                    this.props.meshes.length > 0 ?
                    this.props.meshes.map(
                        function(mesh, i) {
                        return (
                            <div className="row"
                                onClick={()=>{
                                    that.props.isUserLogged ?
                                    that.props.joinCurrentMesh
                                        (mesh._id, mesh.meshName, mesh.meshEndTimeMilliSec,
                                        mesh.meshEndTime, mesh.users.length):
                                    that.setState({mesh, showJoinMeshTermsAndCondition:true})
                                }}
                                key={i}>
                                <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                                <MeshPanel
                                    meshEndTime={mesh.meshEndTime}
                                    meshName={mesh.meshName}
                                    participantsCount={mesh.users.length}/>
                                </div>
                            </div>
                        )
                    }):(()=>{
                        return this.props.showLoader ?
                        null:
                        <div>
                            <hr style={{visibility: "hidden"}}/>
                            <div className="no-meshes-img-container">
                                <img style={{margin:"auto"}} className="img img-responsive"
                                    src="/assets/images/no_meshes_sign_img.png"/>
                            </div>
                        </div>
                    })()
                }
            </div>
        )
    }

    renderShowMeshesPage() {
        return (
            <div>
                {this.renderJoinANetworkLabel()}
                {this.renderMeshes()}
            </div>
        )
    }

    setContentHeight(){
        return {height: screen.height+"px"}
    }

    render(props) {

        if(this.props.locationServiceDisabled) {
            return this.renderLocationServiceExplain()
        }
        var that = this;
        const content = (
            <div className="login-start-page">
                {this.renderLogo()}
                {
                    (()=>{
                        if(this.state.showTermsAndCondition) {
                            return this.renderTermsAndConditions()
                        }else if(this.state.showJoinMeshTermsAndCondition){
                            return this.renderTermsAndConditionsPanel()
                        }else{
                            return (<div className="container page-content"
                                style={{overflow:"auto", minHeight: (screen.height)+"px"}}>
                                    {this.renderShowMeshesPage()}
                                    {this.state.showTermsAndCondition ? null : <ContactUs/>}
                            </div>)
                        }
                    })()
                }
            <div className="fixed-bottom">
                {
                    (()=>{
                        if(this.props.showLoader ||this.state.showJoinMeshTermsAndCondition ||
                            this.state.showTermsAndCondition){
                              return null;
                        }else{
                            return (
                                <PlusButton onClick={()=>{
                                    this.props.isUserLogged && this.props.acceptedTermsAndConditions ?
                                    this.props.history.push("/form"):
                                    this.setState({showTermsAndCondition: true})
                                }}/>
                            )
                        }
                    })()
                }
            </div>
                <Loader showLoader={this.props.showLoader}/>
            </div>
        )
        return (
           <div>
               {this.props.isShow && content}
           </div>
        )
    }
}

export default withRouter(LoginOrStart);

// componentWillMount() {

    //     this.setState({
    //         pageShow: false
    //     });

    //     var that = this;
    //     if (!this.props.username){
    //         axios.get('/api/loggedin').then((res1) => {
    //             var data = res1.data;
    //             that.props.changeLoggedIn(data);
    //             if (data.isLogged) {
    //                 axios.get(`/api/user/${data.user._id}`).then((res2) => {
    //                     that.props.updateUser(res2.data.user);
    //                     if (res2.data.page) {
    //                         if (res2.data.page == 'mesh') {
    //                             that.props.updateMesh(res2.data.mesh);
    //                         }
    //                         history.push(`/${res2.data.page}`);
    //                     } else {
    //                         that.setState({
    //                             pageShow: true
    //                         });
    //                     }
    //                 });
    //             } else {
    //                 that.setState({
    //                     pageShow: true
    //                 });
    //             }
    //         });
    //     }
    //     this.geolocate();
    // }

    // componentDidMount(){
    //     var that = this;
    //     if (!this.props.username){
    //         axios.get('/api/loggedin').then((res1) => {
    //             var data = res1.data;
    //             that.props.changeLoggedIn(data);
    //             if (data.isLogged) {
    //                 axios.get(`/api/user/${data.user._id}`).then((res2) => {
    //                     that.props.updateUser(res2.data.user);
    //                     if (res2.data.page) {
    //                         if (res2.data.page == 'mesh') {
    //                             that.props.updateMesh(res2.data.mesh);
    //                         }
    //                         history.push(`/${res2.data.page}`);
    //                     }
    //                 });
    //             }
    //         });
    //     }
    //     this.geolocate();
    // }

    // geolocate(){
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(function(position) {
    //             var geolocation = {
    //                 lat: position.coords.latitude,
    //                 lng: position.coords.longitude
    //             };
    //         }, function(failure) {
    //             console.log('Geolocation Error: ' + failure.message);
    //         });
    //     }
    // }

//     <Modal show={this.state.showModal1} onHide={this.close1}>
//     <Modal.Header closeButton>
//         <Modal.Title>Terms and Agreement</Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//         Some terms and agreement
//         </Modal.Body>
//     <Modal.Footer>
//         <a href="/auth/linkedin/page/form" className="btn btn-primary">
//             Agree
//         </a>
//     </Modal.Footer>
// </Modal>

// renderContentUserNotLoggedIn(){
//     const that = this;
//     return (
//         <div>
           
//             <div className="container page-content">
//                 <div className="row">
//                     <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
//                         {
//                             this.props.meshes.length > 0 ?
//                             (<h3 className="active-mesh-network">Join a mesh network:</h3>):
//                             null
//                         }
//                     </div>
//                 </div>
//                     { 
//                         this.props.meshes.length > 0 && !this.state.showTermsAndCondition?
//                         this.props.meshes.map(
//                         function(mesh, i) {
//                             return (
//                                 <div className="row" onClick={that.props.joinCurrentMesh.bind(that,mesh._id, mesh.meshName, mesh.meshEndTimeMilliSec)} key={i}>
//                                     <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
//                                         <MeshPanel
//                                             meshName={mesh.meshName}
//                                             meshEndTime={mesh.meshEndTime}
//                                             participantsCount={mesh.users.length}/>
//                                     </div>
//                                 </div>
//                             )
//                         }):
//                         (()=>{
//                             return this.props.showLoader || this.state.showTermsAndCondition?
//                             null:
//                             <img style={{margin:"auto"}} className="img img-responsive"
//                                     src="/assets/images/no_meshes_sign_img.png"/>
//                         })()
//                     }
//                 {
//                     this.state.showTermsAndCondition ?
//                     this.renderTermsAndConditions():
//                     null
//                 }
//                 {
//                     !this.props.showLoader && !this.state.showTermsAndCondition?
//                     <PlusButton onClick={(()=>{this.setState({showTermsAndCondition: true})})}/>:
//                     null
//                 }
//             </div>
//         </div>
//     )
// }

// renderUserLoggedIn() {
//     const that = this;
//     return (
//         <div>
//             <div className="container fixed-logo">
//                 <a href="/">
//                     <img src="/assets/images/logo.png" className="img-responsive center-block"/>
//                 </a>
//                 <hr/>
//             </div>
//             <div className="container page-content">
//                 <div className="row">
//                     <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
//                         {
//                             this.props.meshes.length > 0 ?
//                             <h3 className="active-mesh-network">Join a mesh network:</h3>:
//                             null
//                         }
//                     </div>
//                 </div>
                    
//                     {
//                         !this.props.showLoader?
//                         <PlusButton onClick={(()=>{this.props.history.push('/form')})}/>:null
//                     }
                
//             </div>
//         </div>
//     )
// }
