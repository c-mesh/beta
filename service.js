//import { setInterval } from 'timers';

//import { join } from 'path';
var https = require('https');
var Mesh = require('./models/Mesh.js');
let mongoose
module.exports = function () {
    setInterval( function(){
    let list = []
    let data = []
    try {
        Mesh.find(function (err, meshes) {
            if (err) {
                console.log('error')
            }
            console.log('I got meshes')
            console.log(meshes)
            let requestUrl;
            meshes.forEach((key) => {
                list.push(key.eventId)

            });
            requestUrl = `${process.env.MEETUP_API_URL}2/events?sign=true&key=${process.env.MEETUP_API_SECRET}&event_id=${list.join(',')}&fields=event_hosts`
            console.log(requestUrl)
            https.get(requestUrl, (resp) => {
                console.log('statusCode:', resp.statusCode);
                console.log('headers:', resp.headers);

                resp.on('data', (chunk) => {
                    console.log('chunk occoured')
                    //console.log(chunk)
                    data.push(chunk)
                    //process.stdout.write(d);
                });
                resp.on('end', () => {

                    let buffer = Buffer.concat(data);
                    let datas = buffer.toString('utf8');
                    let jsonResp = JSON.parse(datas).results;

                    let meshEvent = null;
                    list.forEach((key) => {
                        meshEvent = null;
                        jsonResp.every((latestObj, index) => {
                            if (latestObj.id == key && latestObj.status == "upcoming") {
                                meshEvent = latestObj;
                                return false;
                            }
                            else {
                                return true;
                            }

                        })

                        if (!meshEvent) {
                            Mesh.remove({ eventId: key }, function (err) {
                                if (!err) {
                                    console.log('removed mesh successfully')
                                }
                                else {
                                    console.log('Their was error removing mesh event');
                                    console.log(err)
                                }
                            });
                        }
                        else {
                            let meshModel = {
                                eventId: meshEvent.id,
                                meshName: meshEvent.name,
                                meshStartTime: new Date(meshEvent.time),
                                meshEndTime: new Date(meshEvent.time + (meshEvent.duration ? meshEvent.duration : 3 * 60 * 60 * 1000)),
                                meshCreatedAtTime: new Date(meshEvent.created),
                                meshCoordinate: {
                                    lat: meshEvent.venue && meshEvent.venue.lat ? meshEvent.venue.lat : null,
                                    lng: meshEvent.venue && meshEvent.venue.lon ? meshEvent.venue.lon : null
                                }
                            };
                            let meshQuery = {
                                'eventId': meshEvent.id
                            };
                            Mesh.update(meshQuery, meshModel, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    //reject(err)
                                }
                                else {
                                    console.log(
                                        'Mesh Successfully updated data');
                                    //resolve(data)
                                }
                            })
                        }
                    })
                    console.log('Data FUll recieved')



                })
            })
        })
    } catch (err) {
        console.log('reci err')
    }
    }, 300000)
}()