import { Auth } from 'aws-amplify';
import { LOADERS } from './loaders';

const API_GATEWAY_URL = 'https://k89hffdyy4.execute-api.us-east-1.amazonaws.com/dev';

export async function fetchPreSignedUrl(assetKey) {
    try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        const response = await fetch(`${API_GATEWAY_URL}?assetKey=${assetKey}`, {
          headers: {
            Authorization: idToken,
            'Content-Type': 'application/json',
            },
           method: 'GET',
        });
        const responseData = await response.json();
        console.log("response is" + JSON.stringify(responseData, null, 2));
        return responseData.ps_url;
    } catch (err) {
        console.error('Failed to fetch the pre-signed URL:', err.message);
        throw err;
    }
}

export async function loadAsset(assetType, assetKey, processAsset) {
    try {
        const preSignedUrl = await fetchPreSignedUrl(assetKey);

        // Utilizing LOADERS and other logic to load the asset if it is defined
        // Assume LOADERS is a map where keys are assetTypes and values are relevant Three.js loaders
        const loader = LOADERS[assetType];
        if (!loader) {
            throw new Error(`No loader defined for asset type: ${assetType}`);
        }

        loader.load(preSignedUrl, processAsset, undefined, (err) => {
            console.error(`Failed to load the asset: ${assetKey}`, err);
        });
    } catch (err) {
        console.error(`Failed to load the asset: ${assetKey}`, err.message);
    }
}


