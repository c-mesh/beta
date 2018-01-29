import React,{Component} from 'react';

class PlusButton extends Component {

   
    render() {
        return (
            <div className="text-center" onClick={this.props.onClick}>
                <div id="plusbtn" className="plus-btn">
                   <span className="round-btn">
                       <span style={{left: '1px'}} className="glyphicon glyphicon-plus"></span>
                   </span>
                </div>
            </div>
        );
    }
}

export default PlusButton;