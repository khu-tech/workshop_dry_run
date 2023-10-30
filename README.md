# Workshop Part Three: rendering your 3D assets from Cloud

In the previous parts of the workshop, you might notice that the assets is managed locally, and this part of workshop we will teach you how to render assets from S3 using S3 pre-signed URL, and why we are using S3? 

__Supercharged Scalability__: Amazon S3 is like the trusty steed of cloud storage. Whether it's a handful of users or a whole carnival, S3 delivers without a hiccup. Local hosting, while charming, might stumble a bit with a big crowd.

__Secured Access__: Think of pre-signed URLs as special passes. They make sure our assets stay exclusive, keeping them away from prying eyes.

__Safety First__: With S3's stellar backup and redundancy, our assets are tucked in safe and sound. It's like having a digital safety net!

__Swift and Smooth__: WebXR apps can be chunky, and we want you diving into the action, not waiting. By hosting on S3, we cut down those yawn-worthy load times.

Always Updated: Keeping things fresh is easier with S3. We can spruce up our assets, ensuring you always get the best and brightest without endless app updates.


## Step one: 

1.1 Go to infra/lib/main.ts, and uncomment this code 
```javascript
const getAssetLambda = new LambdaStack(scope, "getAssetLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/getAsset', 'handler', cdk.Duration.minutes(5), 512, 512, storageEnvs);

```
1.2 Also uncomment 

```javascript
apiGateway.AddMethodIntegration(getAssetLambda.MethodIntegration(), "assets", "GET", apiAuthorizer);

```
1.3 And then go to lambdaScript and uncomment 

```javascript 
export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const key = event.queryStringParameters.assetKey;
        const expires = event.queryStringParameters.expires;

        if (!key) {
            return jsonResponse(400, { message: "Key parameter is required" });
        }

        const psUrl = await getPresignedUrl(key, expires);
        console.log('ps_url:', psUrl);

        const response = jsonResponse(200, { "ps_url": psUrl });
        console.log('Response:', JSON.stringify(response, null, 2));


        return response;
    } catch (error) {
        console.error(error);
        return jsonResponse(500, { "message": error.toString() });
    }
};

```
After that run ```CDK deploy```, this will deploy a Lambda function and API Gateway endpoint, the lambda function will take the asset key which is the folder path and generate a pre-signed URL. 

## Step two: 
2.1 Go under web/src/fetchurl and uncomment these lines of code:

```javascript
export async function loadAsset(assetType, assetKey, processAsset, retryCount = 0) {
    try {
        const preSignedUrl = await fetchPreSignedUrl(assetKey);

        const loader = LOADERS[assetType];
        if (!loader) {
            throw new Error(`No loader defined for asset type: ${assetType}`);
        }

        console.log("presignedURL" + preSignedUrl);

        return loader.load(preSignedUrl, processAsset, undefined, (err) => {
            console.error(`Failed to load the asset: ${assetKey}`, err);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying to load asset: ${assetKey}. Attempt ${retryCount + 1}`);
                loadAsset(assetType, assetKey, processAsset, retryCount + 1);
            } else {
                console.error(`Failed to load asset: ${assetKey} after ${MAX_RETRIES} attempts.`);
            }
        });
    } catch (err) {
        console.error(`Failed to load the asset: ${assetKey}`, err.message);
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying to load asset: ${assetKey}. Attempt ${retryCount + 1}`);
            loadAsset(assetType, assetKey, processAsset, retryCount + 1);
        } else {
            console.error(`Failed to load asset: ${assetKey} after ${MAX_RETRIES} attempts.`);
        }
    }
}

```

You can use this function to replace the orginal local loaders from the code. Now let's go! 

First asset: 

2.2 go to flap.js and comment out 

```javascript
`import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';`
```
and uncomment

```javascript
`import { loadAsset } from './fetchurl';`
```

2.3 comment out

```javascript
new GLTFLoader().load('assets/wing.glb', (gltf) => {
			const rightWing = gltf.scene;
		 	const leftWing = rightWing.clone(true);
		    leftWing.scale.set(-1, 1, 1);
			playerSpace.add(rightWing, leftWing);
			this._wings.left = leftWing;
		this._wings.right = rightWing;
		});
```
and uncomment 

```javascript
loadAsset('gltf', 'assets/wing.glb', (gltf) => {
			const rightWing = gltf.scene;
			const leftWing = rightWing.clone(true);
			leftWing.scale.set(-1, 1, 1);
			playerSpace.add(rightWing, leftWing);
			this._wings.left = leftWing;
			this._wings.right = rightWing;
		});

```

Second and third asset could follow the same step in game.js and scene.js. In game.js it's a little different, because the game might load first than the actual assets, so we load the asset in the prepare() function and make sure it get load before the main game function executate() starts. More information please check out the docs: https://lastolivegames.github.io/becsy/guide/architecture/systems.html#defining-systems 
