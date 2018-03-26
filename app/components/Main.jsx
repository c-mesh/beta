import React from "react";
import { Route, BrowserRouter, Switch } from "react-router-dom";

// import Header from "./Header.jsx";
import RoutesR from "./RoutesR.jsx";

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <RoutesR />
                {/* <a href="/logout" >Logout</a> */}
                <img src="/assets/images/Why_linkedin_create_form_v1.png" style={{display:"none"}} />
                <img src="/assets/images/Why_linkedin_v2.png" style={{display:"none"}} />
                <img src="/assets/images/mesh_tutorial_1.png" style={{display:"none"}} />
                <img src="/assets/images/mesh_created.png" style={{display:"none"}} />
            </div>

        )
    };
}

export default Main;