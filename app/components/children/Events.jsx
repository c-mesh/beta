import React,{Component} from 'react';
import {Link} from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import {withRouter} from "react-router-dom";
import axios from 'axios';
import Moment from 'react-moment';;

class Events extends Component {
    constructor(props){
        super(props)
    }
    updateEvent(eventId, checked, event){
        if(!checked){
        axios.delete(`/api/events/${eventId}`).then((result) => {
            //that.setState({ events: result.data, showLoader: false });
        })
    }else{
        axios.post(`/api/events`, event).then((result) => {
            //that.setState({ events: result.data, showLoader: false });
        })
    }
    }
    render() {
        let that = this;
        var geocoder = new google.maps.Geocoder();
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        if(!this.props.events || this.props.events.length == 0){
             return(<div>
                 <div className="mesh-header">
     {this.props.meshName}
     <span> 
         <a>
    <img className="img img-responsive pull-right settings-image" style={{display:"inline"}}
    src={baseUrl+"assets/images/settings-icon.png"} onClick={()=>{
        that.props.history.push("form")
    }}/>
    </a>
    </span>
    </div>
    <hr />
    <div className="no-events">
                No upcoming events
                
                
                </div>
</div>
                )
        }
         let elements = this.props.events.map((elem, index) => {
            return(<div>
                <div className="event-import-header" key={elem.eventId}>
                {elem.meshName}
                </div>
                <div className="event-import-details">
                <div><u>Date: </u>
                <Moment format="MMMM DD, YYYY">
                {elem.meshStartTime}
            </Moment>
            </div>
            <div><u>Time: </u>
                <Moment format="h:mm a">
                {elem.meshStartTime} 
            </Moment>
            <span> to </span>
            <Moment format="h:mm a">
                {elem.meshEndTime}
            </Moment>
            </div>
            <div><u>Location: </u>
{(()=>{
    if(!elem.meshCoordinate.lat || !elem.meshCoordinate.lng){
        return(
            <span> Not Specified</span>
        )
    }else{
    let latlng = {lat: elem.meshCoordinate.lat, lng: elem.meshCoordinate.lng}
    geocoder.geocode({'location': latlng}, function(results, status) {
        return(
            <span> results[0].formatted_address </span>
        )
    })
    }
})()}
            </div>
                </div>
                <div className="event-check">
                <input type="checkbox" defaultChecked={true}
                            onChange={(e)=>{
                                this.updateEvent(elem.eventId, e.target.checked, elem)
                            }}/> <span> Create mesh network for this event</span>
                </div>
                </div>
            )
                })
            
return(
 <div>
     <div className="mesh-header">
     {this.props.meshName}
     <span> 
         <a>
    <img className="img img-responsive pull-right" style={{display:"inline"}}
    src={baseUrl+"assets/images/settings-icon.png"} onClick={()=>{
        that.props.history.push("form")
    }}/>
    </a>
    </span>
     </div>
{elements}
</div>
)
    }
}
export default withRouter(Events)