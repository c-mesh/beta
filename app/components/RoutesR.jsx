import React from 'react';
import axios from 'axios';
import history from '../history.js';
import moment from 'moment';

import { Route, BrowserRouter, Switch } from "react-router-dom";
import LoginOrStart from './children/LoginOrStart.jsx';
import Form from './children/Form.jsx';
import Mesh from './children/Mesh.jsx';
import Events from './children/Events.jsx';
import $ from 'jquery';

class Routes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLogged: false,
            username: '',
            fullName: '',
            job: '',
            photo: '',
            linkedinURL: '',
            meshes: [],
            currentMeshID: '',
            currentMeshName: '',
            currentCoordinate: { lng: 0, lat: 0 },
            currentMeshCoordinate: { lng: 0, lat: 0 },
            currentMeshEndTimeMilliSec: 0,
            currentMeshEndTime: 0,
            currentMeshParticipantsCount: 0,
            userLat: 0,
            userLng: 0,
            autocomplete: null,
            isHomeShow: false,
            showLoader: false,
            organizerMeshName: ""
        };

        this.initializeForm = this.initializeForm.bind(this);
        this.changeLoggedIn = this.changeLoggedIn.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.createMesh = this.createMesh.bind(this);
        this.joinCurrentMesh = this.joinCurrentMesh.bind(this);
        this.getAllMeshes = this.getAllMeshes.bind(this);
        this.setAutocomplete = this.setAutocomplete.bind(this);
        this.updateMesh = this.updateMesh.bind(this);
        this.updateHomeShow = this.updateHomeShow.bind(this);
        this.UpdateMeetupOrganizer = this.UpdateMeetupOrganizer.bind(this);
        this.locationTimer = null;
        this.meshesTimer = null;
    }

    initializeForm() {
        const lat = this.state.userLat;
        const lng = this.state.userLng;
        const latlng = new google.maps.LatLng(lat, lng);
        return new Promise((resolve, reject) => {
            new google.maps.Geocoder().geocode({ 'latLng': latlng }, (results, status) => {
                var addr = results.length > 0 ? results[0].formatted_address : '';
                resolve({
                    meshAddress: addr,
                    meshDuration: '5',
                    startDateTime: moment().startOf('hour')
                })
            });
        });
    }

    updateHomeShow() {
        this.setState({
            isHomeShow: true
        }, () => {
            console.log('RoutesR.jsx UpdateHomeShow: ' + this.state.isHomeShow);
        });
    }

    changeLoggedIn(result) {
        var that = this;
        that.setState({
            isUserLogged: result.isLogged
        });
    }

    updateMesh(mesh) {
        this.setState({
            currentMeshID: mesh.meshId,
            currentMeshName: mesh.meshName,
            currentMeshCoordinate: mesh.meshCoordinate,
            currentMeshEndTimeMilliSec: mesh.meshEndTimeMilliSec,
            currentMeshEndTime: mesh.meshEndTime ? mesh.meshEndTime : moment(parseInt(mesh.meshEndTimeMilliSec)).format(),
            currentMeshParticipantsCount: mesh.users ? mesh.users.length : 0
        });
    }

    updateUser(user) {
        this.setState({
            userId: user._id,
            acceptedTermsAndConditions: user.acceptedTermsAndConditions,
            username: user.firstName,
            photo: user.photo,
            job: user.job,
            fullName: user.fullName,
            lastName: user.lastName,
            firstName: user.firstName,
            linkedinURL: user.linkedinURL
        });
        console.log('Updated routesR\'s user');
        console.log(`User: ${user._id}`);
    }

    createMesh(mesh) {
        var that = this;
        axios.post('/api/mesh', mesh).then((data) => {
            console.log('Created a new mesh');
            that.getAllMeshes();
        });
    }
    UpdateMeetupOrganizer(organizer){
        var that = this;
        this.setState({organizerMeshName: organizer.meshNetworkName})
        axios.get('/api/loggedin').then((res1) => {
            var data = res1.data;
            that.changeLoggedIn(data);
            if (data.isLogged) {
                let req = {
                    url:'/api/organizer/' + data.user._id,
                    method: 'put',
                    data: organizer 
                }
        axios(req).then((data) => {
            //that.getAllMeshes();
            that.setState({authenticatedWith: 'meetup'})
            history.push({ pathname: `/events` });
        })
    } else{
        console.log('not updatig user as user is not logged in')
        history.push({ pathname: `/` });
    }
    }).catch((err) => {
        console.log(`Error came while updating organizer ${JSON.stringify(err)}`)

    })
    }

    getMeshById(meshId) {
        const that = this;
        axios.get(`/api/mesh/${meshId}`).then((data) => {
            console.log(data);
        });
    }

    joinCurrentMesh(meshID, meshName, meshEndTimeMilliSec, endTime, participants) {
        var that = this;
        var rightNow = new Date();
        if (rightNow.getTime() > meshEndTimeMilliSec) {
            alert("This Mesh Has Expired");
        } else {
            axios.post(`/api/join_mesh/${meshID}`)
                .then((data) => {
                    console.log('database joining success');
                    console.log(data);
                    this.setState({
                        currentMeshID: meshID,
                        currentMeshName: meshName,
                        currentMeshEndTimeMilliSec: meshEndTimeMilliSec,
                        currentMeshEndTime: endTime,
                        currentMeshParticipantsCount: participants
                    });

                    history.push({ pathname: `/mesh/${meshID}` });
                })
                .catch((err) => {
                    const response = err.response.data;
                    console.log('Mesh joining error');
                    console.log(response);
                });
        }
        //TODO: add this user to mesh via Mongoose
    }

    getAllMeshes() {
        var that = this;
        axios.get('/api/meshes').then((result) => {
            var meshes = result.data;
            var filteredMeshes = [];
            if (Object.keys(meshes).length > 0) {
                filteredMeshes = meshes.filter((v) => {
                    var R = 6371e3;
                    var lat1 = v.meshCoordinate.lat;
                    var lon1 = v.meshCoordinate.lng;
                    var lat2 = that.state.userLat;
                    var lon2 = that.state.userLng;
                    var φ1 = (lat1) / 180 * Math.PI;
                    var φ2 = (lat2) / 180 * Math.PI;
                    var Δφ = (lat2 - lat1) / 180 * Math.PI;
                    var Δλ = (lon2 - lon1) / 180 * Math.PI;

                    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                    var d = R * c;
                    return d < 150; // Inside 50m radius
                });
                that.setState({ meshes: filteredMeshes, showLoader: false });
            } else {
                that.setState({ showLoader: false });
            }
        });
    }
    updateEvents(id){
         let that = this;
        axios.get(`/api/events/${id}`).then((result) => {
            that.setState({ events: result.data, showLoader: false });
        })
    }
    componentDidMount() {
        var that = this;
        if(that.state.authenticatedWith !== "meetup"){
        that.geolocate();
        this.locationTimer = setInterval(function () {
            that.geolocate();
        }, 60000);
        this.setState({ showLoader: true }, () => {
            
            that.meshesTimer = setInterval(function () {
                that.getAllMeshes();
            }, 6000);
        
        });
    }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(`latitude: ${pos.lat}, longitude: ${pos.lng}`);
                that.setState({
                    userLat: pos.lat,
                    userLng: pos.lng
                });
                var circle = new google.maps.Circle({
                    center: pos,
                    radius: position.coords.accuracy
                });
                if (that.state.autocomplete) {
                    that.state.autocomplete.setBounds(circle.getBounds());
                }

                if (!that.state.username) {
                    axios.get('/api/loggedin').then((res1) => {
                        var data = res1.data;
                        that.changeLoggedIn(data);
                        if (data.isLogged) {
                            axios.get(`/api/user/${data.user._id}`).then((res2) => {
                                that.updateUser(res2.data.user);
                                if (res2.data.page) {
                                    that.state.authenticatedWith = res2.data.user.authenticatedWith;
                                    if (res2.data.page == 'mesh') {
                                        that.updateMesh(res2.data.mesh);
                                    } else if(res2.data.user.authenticatedWith == 'meetup' && !that.state.events){
                                        setTimeout(()=>{
                                            that.updateEvents(res2.data.user.authorizerId)
                                        }, 200);
                                    }
                                    history.push(`/${res2.data.page}`);
//                                }
                                    
                                } else {
                                    that.setState({
                                        isHomeShow: true
                                    });
                                }
                            });
                        } else {
                            that.setState({
                                isHomeShow: true
                            });
                        }
                    });
                }

            }, function (err) {
                navigator.sayswho = (function () {
                    var ua = navigator.userAgent, tem,
                        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                    if (/trident/i.test(M[1])) {
                        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                        return 'IE ' + (tem[1] || '');
                    }
                    if (M[1] === 'Chrome') {
                        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
                    }
                    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
                    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
                    return M.join(' ');
                })();
                var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


                if (iOS) {
                    if (navigator.userAgent.match('CriOS')) {
                        alert("Turn Location Services For Chrome");
                    } else {
                        if (navigator.userAgent.toLowerCase().indexOf('fxios') > -1) {
                            alert("Turn Location Services For Mozilla")
                        }
                        else {
                            if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)) {
                                alert("Turn Location Services For Safari")
                            }
                        }
                    }
                } else {
                    if (navigator.sayswho.includes("Chrome")) {
                        alert("Turn Location Services For Chrome")
                    }
                    if (navigator.sayswho.includes("Safari")) {
                        alert("Turn Location Services For Safari")
                    }
                    if (navigator.sayswho.includes("Mozilla")) {
                        alert("Turn Location Services For Mozilla")
                    }
                }
            });
        } else {
            console.log('geolocate not working');
        }

    }

    componentWillUnmount() {
        clearInterval(this.locationTimer);
        clearInterval(this.meshesTimer);
    }

    setAutocomplete(obj) {
        this.setState({ autocomplete: obj });
        console.log('trying to set autocomplete');
    }

    geolocate() {
        var that = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(`latitude: ${pos.lat}, longitude: ${pos.lng}`);
                that.setState({
                    userLat: pos.lat,
                    userLng: pos.lng,
                    currentCoordinate: pos
                });
                var circle = new google.maps.Circle({
                    center: pos,
                    radius: position.coords.accuracy
                });
                if (that.state.autocomplete) {
                    that.state.autocomplete.setBounds(circle.getBounds());
                }
            });
        } else {
            console.log('geolocate not working');
        }
    }

    render() {
        var that = this;
        return (
            <div>
                <Switch>
                    <Route exact path="/" render={(props) => (
                        <LoginOrStart {...props}
                            userId={this.state.userId}
                            acceptedTermsAndConditions={this.state.acceptedTermsAndConditions}
                            showLoader={this.state.showLoader}
                            changeLoggedIn={this.changeLoggedIn}
                            updateUser={this.updateUser}
                            isUserLogged={this.state.isUserLogged}
                            meshes={this.state.meshes}
                            username={this.state.username}
                            currentMesh={this.state.currentMesh}
                            joinCurrentMesh={this.joinCurrentMesh}
                            updateMesh={this.updateMesh}
                            isShow={this.state.isHomeShow}
                            authenticatedWith = {this.state.authenticatedWith}
                        />

                    )} />

                    <Route path="/form" render={(props) => (
                        <Form
                            initializeForm={this.initializeForm}
                            createMesh={this.createMesh}
                            currentCoordinate={this.state.currentCoordinate}
                            userLat={this.state.userLat}
                            userLng={this.state.userLng}
                            setAutocomplete={this.setAutocomplete}
                            autocomplete={this.state.autocomplete}
                            updateHomeShow={this.updateHomeShow}
                            authenticatedWith = {this.state.authenticatedWith}
                            updateOrganizer = {this.UpdateMeetupOrganizer}
                        />
                    )} />

                    <Route path="/mesh" render={(props) => (
                        <Mesh
                            userId={this.state.userId}
                            acceptedTermsAndConditions={this.state.acceptedTermsAndConditions}
                            username={this.state.username}
                            userFullName={this.state.fullName}
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            job={this.state.job}
                            photo={this.state.photo}
                            linkedinURL={this.state.linkedinURL}
                            currentMeshID={this.state.currentMeshID}
                            currentMeshName={this.state.currentMeshName}
                            currentMeshCoordinate={this.state.currentMeshCoordinate}
                            currentMeshEndTimeMilliSec={this.state.currentMeshEndTimeMilliSec}
                            currentMeshEndTime={this.state.currentMeshEndTime}
                            currentMeshParticipantsCount={this.state.currentMeshParticipantsCount}
                            updateHomeShow={this.updateHomeShow}
                            updateMesh={this.updateMesh}
                        />
                    )} />
                    <Route path="/events" render={(props)=>(
                        <Events {...props}
                            events={this.state.events}
                            meshName={this.state.organizerMeshName}
                        />
                    )} />

                </Switch>
            </div>
        )
    }

}


export default Routes;
