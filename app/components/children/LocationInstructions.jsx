import React from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router-dom";
import history from '../../history.js';
import { Button, Modal } from 'react-bootstrap';

class LocationInstructions extends React.Component {
    constructor(props){
        super(props);
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
    
    renderLocationServiceMessage() {
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
                    <a className="btn-btn-one"><Link to="mailto:team@circlemesh.com"></Link>Report Error</a>
                    <a className="btn-btn-two"><Link to={baseUrl}></Link>Done</a>
                </div>

                <div className="hr-instr">
                    <hr/>
                </div>
                    <div className="contact-instruction">
                        <p>contact us</p>
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

