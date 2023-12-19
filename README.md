# Heat Map

## Getting started

```
git clone https://github.com/brothersdw/heatmap.git
```

### Installing dependencies

- You will first need to make sure that you have also cloned the `heatmap-api` and have it running before starting this frontend.
- To install all dependencies for frontend run `npm install` while in the `heatmap` parent directory.

### Mapbox Token

- You will need to retreive a public key from https://mapbox.com.
- Here there are two options:

  - You can create a `tokens.json` file in the `src` directory:

  - `{"publicToken": "<your token>"}`
  - Or you can replace the `publicToken` value in the `/src/components/heat-map/heat-map.js` file with your token directly.

### Start Heatmap frontend

- All you need to do to bring up frontend is run the following command `npm start`
- After you run that command you should have a working heatmap for the state of Florida as seen below:

![image](./public/heatmapexample.png)
