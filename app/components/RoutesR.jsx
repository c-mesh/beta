import React from 'react';
import axios from 'axios';
import history from '../history.js';
import moment from 'moment';
import ReactGA from 'react-ga';

import { Route, BrowserRouter, Switch } from "react-router-dom";
import LoginOrStart from './children/LoginOrStart.jsx';
import Form from './children/Form.jsx';
import Mesh from './children/Mesh.jsx';
import LocationInstructions from './children/LocationInstructions.jsx';
import Analytics from './children/Analytics.jsx';
import $ from 'jquery';
import { withRouter } from "react-router-dom";

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
        if (!this.state.isHomeShow) {
            return
        }
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

                ReactGA.event({category: 'Mesh', action: 'ListLoad', value: filteredMeshes.length})
                that.setState({ meshes: filteredMeshes, showLoader: false });
            } else {
                ReactGA.event({category: 'Mesh', action: 'NoMeshes' })
                that.setState({ showLoader: false });
            }
        });
    }

    tryUpdateLocation(onSuccess, onError) {
        var that = this;
        // Fake location:
        //var position = {coords:{latitude:37.373758, longitude:-122.054814, accurancy:100}}
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
                onSuccess(position)
            }, function (err) {
                onError(err)
            })
        } else {
            onError("navigator.geolocation is null")
        }
    }

    componentDidMount() {
        console.log('RoutesR componentDidMount');
        var that = this;

        // that.geolocate();
        this.locationTimer = setInterval(function () {
            that.geolocate();
        }, 60000);
        this.setState({ showLoader: true }, () => {
            that.meshesTimer = setInterval(function () {
                that.getAllMeshes();
            }, 6000);
        });

       this.tryUpdateLocation(function (position) {
                if (!that.state.username) {
                    axios.get('/api/loggedin').then((res1) => {
                        var data = res1.data;
                        that.changeLoggedIn(data);
                        if (data.isLogged) {
                            axios.get(`/api/user/${data.user._id}`).then((res2) => {
                                that.updateUser(res2.data.user);
                                if (res2.data.page) {
                                    if (res2.data.page == 'mesh') {
                                        that.updateMesh(res2.data.mesh);
                                    }
                                    history.push(`/${res2.data.page}`);
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
                console.log('Location disabled');
                that.props.history.push('/location_instructions')
            });
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
        this.tryUpdateLocation(function() {}, function() {
            console.log('geolocate not working');
        })
    }


    render() {
        var that = this;
        return (
            <div>
                <Route path="/" render={(props) => (
                    <Analytics {...props} />
                )} />
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
                        />

                    )} />

                    <Route path="/location_instructions" render={(props) => (
                        <LocationInstructions />
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

                </Switch>
            </div>
        )
    }

}


export default withRouter(Routes);
