import React from "react";
import axios from 'axios';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router-dom";
import history from '../../history.js';
import { Button, Modal } from 'react-bootstrap';


class Instructions extends React.Component {
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

    renderLocationServiceExp() {
        const getUrl = window.location;
        var baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
        var browserName = this.browserName()
        return(
            <div className="location-service">
            {
                this.isIOS() ?
                    <div className="instructions">
                    <h2>For your IOS phone</h2>
                    <div className="phone-img">
                        <img src="/assets/images/iosLogo.png" className="ios-phone"></img>
                        <img src="/assets/images/androidLogo.png" className="android"></img>
                    </div>
                    <h2>Step 1</h2>
                    <ul><li>-Settings > Privacy > Location</li></ul>
                    <h2>Step 2</h2>
                    <ul><li>-Turn location services: <b>ON</b></li></ul>
                    <h2>Step 3</h2>
                    <ul><li>-Select your browser ({browserName})</li>
                    <li>-Select <b>'While using the app'</b></li></ul>
                    <div className="button-button">
                    <button className="btn-btn-one"><a href="email:team@circlemesh.com"></a>Report Error</button>
                        <button className="btn-btn-two"><a href={baseUrl}></a>Done</button>
                    </div>
                    </div>
                    :
                    <div>
                        <h2>For your Android phone</h2>
                        <div className="phone-img">
                            <img src="/assets/images/iosLogo.png" className="ios"></img>
                            <img src="/assets/images/androidLogo.png" className="android-phone"></img>
                        </div>
                        <h2>Step 1</h2>
                        <ul><li><h4>Settings > Apps</h4></li></ul>
                        <h2>Step 2</h2>
                        <ul><li><h4>Select your browser app ({browserName})</h4></li></ul>
                        <h2>Step 3</h2>
                        <ul><li><h4>Browser app > permissions</h4></li>
                        <li><h4>Turn location services: <b>ON</b></h4></li></ul>
                    </div>

            }
            <div className="button-button-instruction">
                <a className="btn-btn-one"><Link to="mailto:team@circlemesh.com"></Link>Report Error</a>
                <a className="btn-btn-two"><Link to={baseUrl}></Link>Done</a>
            </div>
            <hr/>
                <div className="contact-instruction">
                    <p>contact us</p>
                </div>
           </div>
        )
    }
  
    render(props) {
        return this.renderLocationServiceExp()
    }
}

export default withRouter(Instructions);