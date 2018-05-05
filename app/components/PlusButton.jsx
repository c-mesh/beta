import React,{Component} from 'react';

class PlusButton extends Component {

   
    render() {
        return (
            <div className="text-center" onClick={this.props.onClick}>
                <div className="box-button">
                    <div className="box-button-text">
                        <h3>+ CREATE</h3>
                    </div>
                </div>
            </div>
        );
    }
}

export default PlusButton;