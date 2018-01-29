import React from 'react';
import {Link, Route} from 'react-router-dom';

class Header extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        return (

                <div className="back">
                    <Link className="" to="/">
                        <img src="/assets/images/back.png"/>
                    </Link>
                </div>
        )}
}

export default Header;