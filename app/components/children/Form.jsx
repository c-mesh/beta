import React from "react";
import {Link} from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import {withRouter} from "react-router-dom";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MeshPanel from '../MeshPanel.jsx';
import FeedbackBtn from '../Feedback.jsx';


class Form extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            meshName: "",
            // meshDate: "",
            // meshTime: '',
            meshDuration: '',
            meshAddress: '',
            showModal: false,
            showErrorMsgModal: false,
            startDateTime: null,
            meshCreated: false,
            organizerEmail: "",
            organizerMeshName: ""
        };
        // this.meshDateChangeHandler = this.meshDateChangeHandler.bind(this);
        this.meshNameChangeHandler = this.meshNameChangeHandler.bind(this);
        // this.meshTimeChangeHandler = this.meshTimeChangeHandler.bind(this);
        this.meshDurationChangeHandler = this.meshDurationChangeHandler.bind(this);
        this.meshAddressChangeHandler = this.meshAddressChangeHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.openErrorMsgModal = this.openErrorMsgModal.bind(this);
        this.closeErrorMsgModal = this.closeErrorMsgModal.bind(this);
        this.meshStartDateTimeChangeHandler = this.meshStartDateTimeChangeHandler.bind(this);
        this.validate = this.validate.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.submitOrganizerUpdate = this.submitOrganizerUpdate.bind(this);
        this.organizerMeshNameChangeHandler = this.organizerMeshNameChangeHandler.bind(this)
        this.organizerEmailChangeHandler = this.organizerEmailChangeHandler.bind(this)
    }

    meshStartDateTimeChangeHandler(date) {
        this.setState({
          startDateTime: date
        });
      }

    open() {
        this.setState({
            showModal: true
        });
    }

    close() {
        this.setState({
            showModal: false
        });
        this.changeMap();
    }

    openErrorMsgModal() {
        this.setState({
            showErrorMsgModal: true
        });
    }

    closeErrorMsgModal() {
        this.setState({
            showErrorMsgModal: false
        });
    }

    validate() {
        if (this.state.meshName && this.state.startDateTime && this.state.meshDuration && this.state.meshAddress ) {
            console.log('hello');
            console.log(this.state.meshName);
            console.log(this.state.startDateTime);
            console.log(this.state.meshDuration);
            console.log(this.state.meshAddress);
            this.open();
        } else {
            this.openErrorMsgModal();
        }
    }

    meshNameChangeHandler(event){
        this.setState({meshName: event.target.value});
    }

    meshDurationChangeHandler(event){
        this.setState({meshDuration: event.target.value});
    }

    meshAddressChangeHandler(event){
        
        this.setState({meshAddress: event.target.value});
    }
    organizerEmailChangeHandler(event){
        this.setState({organizerEmail: event.target.value});
    }
    organizerMeshNameChangeHandler(event){
        this.setState({organizerMeshName: event.target.value});
    }
submitOrganizerUpdate(){
    let organizer =  {}
    organizer.email = this.state.organizerEmail;
    organizer.meshNetworkName = this.state.organizerMeshName;
    this.props.updateOrganizer(organizer);
}
    changeMap() {
        console.log("lat:" + this.props.userLat + " lng: " + this.props.userLng);
        if (!this.props.userLat && !this.props.userLat) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var position = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 13,
                        center: position
                    });
                    var marker = new google.maps.Marker({
                        position: position,
                        map: map
                    });
                }, function(failure) {
                    console.log('Geolocation Error: ' + failure.message);
                });
            }
        } else {
            var position = {
                lat: parseFloat(this.props.userLat),
                lng: parseFloat(this.props.userLng)
            };

            if (this.state.meshAddress) {
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': this.state.meshAddress}, function(results, status){
                    if (status == google.maps.GeocoderStatus.OK){
                        position = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        };
                        var map = new google.maps.Map(document.getElementById('map'), {
                            zoom: 13,
                            center: position
                        });
                        var marker = new google.maps.Marker({
                            position: position,
                            map: map
                        });
                    } else {
                        alert("geocoder error");
                    }
                });
            } else {
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 13,
                    center: position
                });
                var marker = new google.maps.Marker({
                    position: position,
                    map: map
                });
            }
        }
      }

    submitHandler(event){
        var that = this;
        event.preventDefault();
        var meshStartTime = this.state.startDateTime.toDate();
        var meshEndTime = moment(this.state.startDateTime).add(this.state.meshDuration, 'h').toDate();
        var meshStartTimeMilliSec = meshStartTime.getTime();
        var meshEndTimeMilliSec = meshEndTime.getTime();


        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': this.state.meshAddress}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK){
                console.log(results[0]);
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                var meshObj = {};
                meshObj.meshName = that.state.meshName;
                meshObj.meshStartTime = meshStartTime;
                meshObj.meshStartTimeMilliSec = meshStartTimeMilliSec;
                meshObj.meshEndTime = meshEndTime;
                meshObj.meshEndTimeMilliSec = meshEndTimeMilliSec;
                meshObj.meshCoordinate = {
                    lat: lat,
                    lng: lng
                };
                meshObj.meshLocationAddress = that.state.meshAddress;
                meshObj.meshCreatedCoordinate = that.props.currentCoordinate;
                that.props.createMesh(meshObj);
                that.setState({meshCreated: true});
                setTimeout(()=>{
                    that.props.history.push("/");
                },2000)
            } else {
                alert("geocoder error");
            }
        });
    }

    updateAddress(newAutocomplete) {
        this.props.setAutocomplete(newAutocomplete);
        const address = newAutocomplete.getPlace();
        this.setState({meshAddress: address.formatted_address},this.changeMap);
    }

    initForm() {
        this.props.initializeForm().then((data)=>{
            this.setState(data);
        });
    }
    componentDidMount(){
        this.props.updateHomeShow();
        console.log("Form.jsx componentDidMount");
        var that = this;
        if(this.props.authenticatedWith !== "meetup" ){
        var newAutocomplete = new google.maps.places.Autocomplete((document.getElementById('meshAddress')),
            {types: ['geocode']});
        this.initForm();
        
        this.props.setAutocomplete(newAutocomplete);
        google.maps.event.addListener(newAutocomplete, 'place_changed',() => {
            that.updateAddress(newAutocomplete);
        });
        this.changeMap();
    }
    }
    renderMeshNetwork(){
        console.log('mesh netpras')
        return(
            <div className="create-mesh-info-form">
            <div className="row">
                <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                    <h3 className="active-mesh-network">Settings:</h3>
                </div>
            </div>
            <form>
                <div className="row">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                    <label style={{fontStyle:"italic"}}>Default name for all mesh networks:
                        </label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <input type="text"
                            className="form-control"
                            maxLength={25}
                            minLength={2}
                            value={this.state.organizerMeshName} 
                            onChange={this.organizerMeshNameChangeHandler}
                            id="organizerMeshName"
                            placeholder="Example: ABCD Meetup"/>
                    </div>
                    </div>
<div class="row">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                    <label style={{fontStyle:"italic"}}>Best email to contact you on:
                        </label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                        <input type="email"
                            className="form-control"
                            maxLength={35}
                            value={this.state.organizerEmail} 
                            onChange={this.organizerEmailChangeHandler}
                            id="organizerEmail"
                            placeholder="organizer@emal.com"/>
                    </div>
                </div>
                <div className="row">
                <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                <a className="btn btn-primary btn-lg pull-right next-btn" onClick={this.submitOrganizerUpdate}>
                            Submit
                        </a>
                    </div>
                </div>
            </form>
        </div>
        )
    }
    renderForm() {
        return (
            <div className="create-mesh-info-form">
                <div className="row">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <h3 className="active-mesh-network">Create A Mesh Network:</h3>
                    </div>
                </div>
                <form>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <label style={{fontStyle:"italic"}}>Name of the event
                            <span className="text-danger">* </span>:</label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <input type="text"
                                className="form-control"
                                maxLength={25}
                                value={this.state.meshName} 
                                onChange={this.meshNameChangeHandler}
                                id="meshName"
                                placeholder="Please enter the event name"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <label style={{fontStyle:"italic"}}>Select date and time:</label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <DatePicker
                                selected={this.state.startDateTime}
                                onChange={this.meshStartDateTimeChangeHandler}
                                showTimeSelect
                                timeFormat="HH"
                                timeIntervals={60}
                                dateFormat="LLL"
                                placeholderText="Start Date & Time"
                                className="custom-datepicker-input"
                                calendarClassName="custom-datepicker-calendar"
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                            <label style={{fontStyle:"italic"}}>Duration of the mesh(hours):</label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <input type="text"
                                className="form-control"
                                pattern="[0-9]*"
                                onInput={this.meshDurationChangeHandler}
                                value={this.state.meshDuration} id="meshDuration" 
                                placeholder="Duration(hrs)"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                           <label style={{fontStyle:"italic"}}>Select exact location of the mesh:</label>
                        </div>
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <input type="text"
                                className="form-control"
                                value={this.state.meshAddress} 
                                onChange={this.meshAddressChangeHandler}
                                id="meshAddress"
                                placeholder="Location"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <div id="map">
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <a className="btn btn-primary btn-lg pull-right next-btn" onClick={this.validate}>
                                Next
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    renderEnterInfo() {
        return (
            <div className="create-mesh-info-panel">
                <h3 style={{fontStyle: "italic", "marginBottom":"30px"}}>Please confirm the details</h3>
                <div className="create-mesh-info-panel-details">
                    <MeshPanel isInfo={true} noTimer={true} meshName={this.state.meshName}/>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <label>The mesh starts on:</label>
                            <div className="value">{this.state.startDateTime && this.state.startDateTime.format("MMMM D YYYY, h A")}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <label>For a total duration of:</label>
                            <div className="value">{this.state.meshDuration} hrs</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <label>At the location:</label>
                            <div className="value">{this.state.meshAddress}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                            <p style={{fontStyle: "italic"}}>*Note: This mesh will be active only within
                                a 50 meter(150 ft.) radius of the location
                            </p>
                        </div>
                    </div>
                </div>
                <div className="row action-btns">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-group">
                        <a className="btn btn-default btn-lg pull-left" onClick={this.close}>
                            Cancel
                        </a>
                        <a className="btn btn-primary btn-lg pull-right" onClick={this.submitHandler}>
                            Confirm
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    renderMeshCreatedPage() {
        const getUrl = window.location;
        const baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
        return (
            <div style={{padding:"50% 0 0 15%"}}>
                <img className="img img-responsive" style={{display:"inline"}}
                    src={baseUrl+"assets/images/mesh_created.png"}/>
                <div style={{display:"inline", fontSize: "24px",paddingLeft: "15px",fontStyle:"italic"}}>
                    Mesh Created!
                </div>
            </div>
        );
    }

    centerContent() {
        return {lineHeight: screen.height+"px"}
    }

    render () {
        return (
            <div className="create-mesh-page">
                <div className="container fixed-logo">
                    <div className="img-container">
                        <a href="/">
                            <img src="/assets/images/logo.png"
                                className="img-responsive center-block"/>
                        </a>
                    </div>
                    <FeedbackBtn url="https://docs.google.com/forms/d/e/1FAIpQLSe6xcmwUn1-84Jf2w1u9vL1LLzf89ujM-_DzY-FlxMKFGUigA/viewform?usp=sf_link"
                        className="pull-right"/>
                    <hr/>
                </div>
                <div className="container page-content">
                    {
                        this.state.meshCreated ?
                        this.renderMeshCreatedPage() :
                        (
                            <div>
                                { this.props.authenticatedWith == "meetup" ? this.renderMeshNetwork() : this.state.showModal ?
                                    this.renderEnterInfo() : this.renderForm()}
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(Form);

 {/* <Modal show={this.state.showModal} onHide={this.close}>
                        <Modal.Header closeButton>
                            <Modal.Title>Thank you</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <p>Mesh Name: {this.state.meshName}</p>
                                <p>
                                    Start Date & Time: {this.state.startDateTime && this.state.startDateTime.format("MMMM D YYYY, h A")}</p>
                                <p>Duration(hrs): {this.state.meshDuration}</p>
                                <p>Location: {this.state.meshAddress}</p>
                            </Modal.Body>
                        <Modal.Footer>
                            <span onClick={this.submitHandler}>
                                <Link to="/" href="/" className="btn btn-primary">
                                    OK
                                </Link>
                            </span>
                        </Modal.Footer>
                    </Modal> */}


  {/* <Modal show={this.state.showErrorMsgModal} onHide={this.closeErrorMsgModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Validation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <p>Please enter all fields in the form!</p>
                            </Modal.Body>
                        <Modal.Footer>
                            <a className="btn btn-primary" onClick={this.closeErrorMsgModal}>
                                OK
                            </a>
                        </Modal.Footer>
                    </Modal> */}
                    
                    
                    
                    // var convertedLocalDateArr = this.state.meshDate.split("-");
        // convertedLocalDateArr [1] = parseInt(convertedLocalDateArr [1]) - 1 ;
        // if (this.state.meshTime.slice(-2) === 'AM'){
        //     if (this.state.meshTime.indexOf(' ') === 1){
        //         var localHour = parseInt(this.state.meshTime.slice(0, 1));
        //     } else var localHour = parseInt(this.state.meshTime.slice(0, 2));
        // } else if (this.state.meshTime.slice(-2) === 'PM'){
        //     if (this.state.meshTime.indexOf(' ') === 1){
        //         var localHour = 12 + parseInt(this.state.meshTime.slice(0, 1));
        //     } else var localHour = 12 + parseInt(this.state.meshTime.slice(0, 2));
        // }
        // var meshStartTimeLocal = new Date(...convertedLocalDateArr, localHour);
        // var meshEndTimeLocal = new Date(...convertedLocalDateArr, localHour + parseInt(this.state.meshDuration));

          // meshDateChangeHandler(event){
    //     var convertedDate = event.target.value;
    //     console.log(convertedDate);
    //     this.setState({meshDate: convertedDate});
    // }

    // meshTimeChangeHandler(event){
    //     this.setState({meshTime: event.target.value});
    // }