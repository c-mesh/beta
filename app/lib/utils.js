/**
 * Get geolocation from the browser API
 * @param  {[function]} getPositionCallbak This callback function will either receive null or the position object
 * @return {[undefined]}                   It is Async API, no return value
 */
export function getCurrentPositionAsync(getPositionCallbak) {

    if (!navigator.geolocation) {
        console.log('Geolocation Error: not supported');
        getPositionCallbak(null);
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        var position = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        getPositionCallbak(position)

    }, function(failure) {
        console.log('Geolocation Error: ' + failure.message);
        getPositionCallbak(null);
    });
}
