import axios from 'axios';

export function leaveMeshAsync(meshId, leaveMeshCallback) {
    return axios.post(`/api/leave_mesh/${meshId}`)
        .then( (res) => {
            leaveMeshCallback();
            return res.data;
        })
        .catch( (err) => {
            leaveMeshCallback();
            console.log(err);
        });
}
