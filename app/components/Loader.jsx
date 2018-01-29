import React,{Component} from 'react';

class Loader extends Component {

    render(){
        return(
            <div>
                {
                    this.props.showLoader ? 
                    <div className="loader"></div>:
                    <div></div>
                }
            </div>
        )
    }
}

export default Loader;