import React,{Component} from 'react';
import termsAndConditions from '../TermsAndConditions.js'

class TermsAndConditions extends Component {

    constructor() {
        super();
        this.state = {
            termsAndConditionsAccepted: true
        };
    }

    render () {
        const getUrl = window.location;
        const baseUrl = getUrl .protocol + "//" + getUrl.host + "";
        const imgUrl = this.props.logoOnTop ?
        "/assets/images/Why_linkedin_create_form_v1.png" :
        "/assets/images/Why_linkedin_v2.png"
        return (
            <div className="terms-conditions">
                <div>
                    <div className="title col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <h2 style={{fontStyle:"italic"}}>Sign in with LinkedIn:</h2>
                        <hr/>
                    </div>
                </div>
                <div className="info col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                    <img className="img img-responsive" src={imgUrl}/>
                </div>
                <div className="confirmation col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 text-left">
                    <div className="col-sm-1 col-xs-1 col-md-1">
                        <input type="checkbox" className="form-control" 
                            defaultChecked={this.state.termsAndConditionsAccepted}
                            onChange={(e)=>{
                                this.setState({termsAndConditionsAccepted: e.target.checked})
                            }}
                        />
                    </div>
                    <div className="col-sm-11 col-xs-11 col-md-11">
                        <strong>By clicking on the sign in button you agree with our
                            <a href="https://circlemesh.com/termsAndConditions.html">
                            {'\u00A0'} terms and conditions</a></strong>
                    </div>
                </div>
                <div className="fixed-absolute" style={{backgroundColor:"white"}}>
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 text-center">
                        <hr/>
                        <a href={baseUrl + this.props.linkedInUrl}
                            className={this.state.termsAndConditionsAccepted ?
                                "btn btn-primary btn-linkedin" : "btn btn-primary btn-linkedin disabled" }>
                            <img src="/assets/images/linkedin_trans.png"/>
                            <span>Sign in with Linkedin</span>
                        </a>
                    </div>
                </div>
            </div>
        )
    }
}

export default TermsAndConditions;