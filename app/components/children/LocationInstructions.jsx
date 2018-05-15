import React from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router-dom";
import history from '../../history.js';
import { Button, Modal } from 'react-bootstrap';
import moment from 'moment';
import ContactUs from '../ContactUs.jsx';

class LocationInstructions extends React.Component {
    constructor(props){
        super(props);
        this.state = { ip: null };
        this.UpdateLocationErrorUsers = this.UpdateLocationErrorUsers.bind(this);
    }

    browserName() {
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


        if (this.isIOS()) {
            if (navigator.userAgent.indexOf('OPR') > -1) {
                return "Opera"
            }
            if (navigator.userAgent.match('CriOS')) {
                return "Chrome"
            } else {
                if (navigator.userAgent.toLowerCase().indexOf('fxios') > -1) {
                    return "Firefox"
                }
                else {
                    if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)) {
                        return "Safari"
                    } else {
                        return "Unknown browser"
                    }
                }
            }
        } else {
            if (navigator.sayswho.indexOf('OPR') > -1) {
                return "Opera"
            }
            if (navigator.sayswho.includes("Chrome")) {
                return "Chrome"
            }
            else if (navigator.sayswho.includes("Safari")) {
                return "Safari"
            }
            else if (navigator.sayswho.includes("Firefox") || navigator.sayswho.includes("Mozilla")) {
                return "Firefox"
            } else {
                return "Unknown browser"
            }
        }
    }


    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    browserVersion(){
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName  = navigator.appName;
        var fullVersion  = ''+parseFloat(navigator.appVersion); 
        var majorVersion = parseInt(navigator.appVersion,10);
        var nameOffset,verOffset,ix;

        // In Opera 15+, the true version is after "OPR/" 
        if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
            browserName = "Opera";
            return fullVersion = nAgt.substring(verOffset+4);
        }
        // In older Opera, the true version is after "Opera" or after "Version"
        else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
        browserName = "Opera";
            return fullVersion = nAgt.substring(verOffset+6);
        if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            return fullVersion = nAgt.substring(verOffset+8);
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
        browserName = "Microsoft Internet Explorer";
            return fullVersion = nAgt.substring(verOffset+5);
        }
        // In Chrome, the true version is after "Chrome" 
        else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
        browserName = "Chrome";
            return fullVersion = nAgt.substring(verOffset+7);
        }
        // In Safari, the true version is after "Safari" or after "Version" 
        else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
            browserName = "Safari";
            return fullVersion = nAgt.substring(verOffset+7);
        if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            return fullVersion = nAgt.substring(verOffset+8);
        }
        // In Firefox, the true version is after "Firefox" 
        else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
            browserName = "Firefox";
            return fullVersion = nAgt.substring(verOffset+8);
        }
        // In most other browsers, "name/version" is at the end of userAgent 
        else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
                (verOffset=nAgt.lastIndexOf('/')) ) 
        {
            browserName = nAgt.substring(nameOffset,verOffset);
            return fullVersion = nAgt.substring(verOffset+1);
        if (browserName.toLowerCase()==browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix=fullVersion.indexOf(";"))!=-1)
            return fullVersion=fullVersion.substring(0,ix);
        if ((ix=fullVersion.indexOf(" "))!=-1)
            return fullVersion=fullVersion.substring(0,ix);

        majorVersion = parseInt(''+fullVersion,10);
        if (isNaN(majorVersion)) {
            return fullVersion  = ''+parseFloat(navigator.appVersion); 
            majorVersion = parseInt(navigator.appVersion,10);
        }
    }
    
    componentWillMount() {
        return fetch('https://api.ipify.org?format=json')
        .then((resp) => resp.json())
        .then((response) => {
            this.setState({ ip: response })
        }).catch(function (err) {
        })
    }

    locationErrorlogs() {
        var browserName = this.browserName();
        var timestamp = moment().format('MMMM Do YYYY, h:mm:ss a')
        var fullVersion = this.browserVersion();
            var payloadData = {};
            if (this.state.ip === null){
                return 
            } else{
                payloadData.ip = this.state.ip.ip
            }
            payloadData.deviceName = window.navigator.platform;
            payloadData.OS = navigator.userAgent;
            payloadData.browser = browserName + '' + fullVersion
            payloadData.timestamp = timestamp;

            console.log('payload Error logs', payloadData);
            let apiURL = '/api/locationErrorLogs';
            fetch(apiURL, {
                method: 'POST',
                headers : new Headers(),
                body: JSON.stringify(payloadData)
            }).then((response) => {
            }).catch((err) => {
            })
    }
    //locationErrorlogs()
    locationErrorUsers(){
        var browserName = this.browserName();
        var timestamp = moment().format('MMMM Do YYYY, h:mm:ss a')
            
            var payloadData = {};
            if (this.state.ip === null){
                return 
            } else{
                payloadData.ip = this.state.ip.ip
            }
            
            payloadData.firstVisit0n = timestamp;
            payloadData.status = 0;
            payloadData.resolvedOn = null;

            console.log('payload location users error', payloadData);

            let apiURL = '/api/locationUserLogs';
            fetch(apiURL, {
                method: 'POST',
                headers : new Headers(),
                body: JSON.stringify(payloadData)
            }).then((response) => {
            }).catch((err) => {
            })
    }

    //locationErrorUsers();

    UpdateLocationErrorUsers(){
        var timestamp = moment().format('MMMM Do YYYY, h:mm:ss a')
        var payloadData = {};
            if (this.state.ip === null){
                return 
            } else{
                payloadData.ip = this.state.ip.ip
            }
        //payloadData.ip = this.state.ip
        payloadData.status = 1;
        payloadData.resolvedOn = timestamp;
        console.log('payload update', payloadData);
        let apiURL = '/api/updateLocationUserLogs'
        fetch(apiURL, {
            method: 'POST',
            headers : new Headers(),
            body: JSON.stringify(payloadData)
        }).then((response) => {
        }).catch((err) => {
            console.log('Error updating', err)
        })
    }
    renderLocationServiceMessage() {
        this.locationErrorlogs();
        this.locationErrorUsers();
        const getUrl = window.location;
        var baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
        var browserName = this.browserName()
        return(
            <div className="location-service-explain">
                <div className="location-header">
                    <h1 className="location-title">
                        Oops!
                    </h1>
                    <h2 className="issue">
                        This {browserName} does not have an access to location services
                    </h2>
                </div>
                <div className="nowrap">
                {
                    this.isIOS() == "Unknown browser" ?
                    <img src={"/assets/images/default-error.png"} className="browser-pic"/>
                    :
                    <img src={"/assets/images/location_service_disabled_" + browserName.toLowerCase() + ".jpg"} className="browser-pic"/>
                }
                    
                <h2 className="details">
                    <div className="detail-inst">
                        <b>Note: </b>CicleMesh requires access to location to find events near you.
                    </div>
                <hr/>
                <b>Please Confirm If</b>
                <ul>
                    <li>Location services are turned <b>ON</b> & </li>
                    <li><b>{browserName}</b> has access to location services</li>
                </ul>
                <div className="link-instructions">
                    <Link to={"instructions"}>See instructions ></Link>
                </div>
                </h2>
                <hr/>

                <p/>
                <div className="button-button">
                        <Link to={"mailto:team@circlemesh.com"} className="btn-btn-one">Report Error</Link>
                        <Link to={"/"} onClick={() => {this.UpdateLocationErrorUsers()}} className="btn-btn-two">Done</Link>
                </div>

                <div className="hr-instr">
                    <hr/>
                </div>
                    <div className="contact-instruction">
                        contact us
                    </div>
                </div>
                    


           </div>
        )
    }
  
    render(props) {
        return this.renderLocationServiceMessage()
    }
}

export default withRouter(LocationInstructions);
