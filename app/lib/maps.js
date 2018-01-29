/**
 * Get Driving distance between twop points
 * @param  {[object]} positionA {lat: 0, lng: 0}
 * @param  {[object]} positionB {lat: 0, lng: 0}
 * @param  {[function]} getDistanceCallback A callback function which receives the distance object
 * @return {[undefined]}
 */
export function getDistanceBetweenAsync(positionA, positionB, getDistanceCallback) {

    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix({
        origins: [positionA],
        destinations: [positionB],
        travelMode: 'DRIVING'
      }, callback);

    function callback(response, status) {
      const distance = response.rows[0].elements[0].distance || null;
      getDistanceCallback(distance)
    }
}


/**
 * Get straight-line distance between two points
 * @param  {[object]} positionA {lat: 0, lng: 0}
 * @param  {[object]} positionB {lat: 0, lng: 0}
 * @return {[number]}           Distance in meters
 */
export function getStraightDistanceBetween(positionA, positionB) {
    var R = 6371e3;
    var lat1 =  positionA.lat;
    var lon1 =  positionA.lng;
    var lat2 = positionB.lat;
    var lon2 = positionB.lng;
    var φ1 = (lat1)/180*Math.PI;
    var φ2 = (lat2)/180*Math.PI;
    var Δφ = (lat2-lat1)/180*Math.PI;
    var Δλ = (lon2-lon1)/180*Math.PI;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return parseInt(d); // Distance in meter
}
