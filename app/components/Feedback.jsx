import React,{Component} from 'react';

class FeedbackBtn extends Component {

    render() {
        return(
            <a className={"feedback-btn "+(this.props.className||"")} href={this.props.url || "#"}>feedback</a>
        )
    }
}

export default FeedbackBtn;