import React,{Component} from 'react';
import termsAndConditions from '../TermsAndConditions.js'

class TermsAndConditions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            termsAndConditionsAccepted: true,
            isMeetup: true,
            postSignInText: "Or manually create a mesh network",
            preLoginText: "Import all upcoming events:",
            signInLogoSrc: "/assets/images/meetup_signin.png",
            btnClass: "btn-meetup",
            loginUrl: "/auth/meetup/page/form"
        };
    }

    setLinkedInState() {
        this.setState({ preLoginText: "Sign in with LinkedIn:" }),
        this.setState({ signInText: "Sign in with Linkedin" })
        this.setState({ signInLogoSrc: "/assets/images/linkedin_trans.png" })
        this.setState({ isMeetup: false })
        this.setState({ btnClass: "btn-primary btn-linkedin" })
        this.setState({ loginUrl:"/auth/linkedin/page/form"})
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
                        <h2 style={{fontStyle:"italic"}}>{this.state.preLoginText}</h2>
                        <hr/>
                    </div>
                </div>
                <div className="info col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                {(() => {
                        if (!this.state.isMeetup) {
                            return (
                                <img className="img img-responsive" src={imgUrl} />
                            )
                        }
                        else {
                            return (
                                []
                            )
                        }
                    })()}
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
                        <a href={baseUrl + this.state.loginUrl}
                            className={this.state.termsAndConditionsAccepted ?
                                "btn " + this.state.btnClass : "btn disabled " + this.state.btnClass}>
                            <img src={this.state.signInLogoSrc} />,
                            <span>{this.state.signInText}</span>
                        </a>
                    </div>
                    {(() => {

                        if (this.state.isMeetup) {
                            return (
                                <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 text-center">
                                    <hr />
                                    <a onClick={() => {
                                        this.setLinkedInState();

                                    }}><span> {this.state.postSignInText} </span></a>
                                </div>
                            )
                        }
                        else {
                            return (
                                []
                            )
                        }
                    })()}
                </div>
            </div>
        )
    }
}

export default TermsAndConditions;