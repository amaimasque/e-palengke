# E-Palengke

E-commerce mobile app for public markets. Consist of buyer and seller dashboards.

Made with React Native & Firebase

[![My Skills](https://skillicons.dev/icons?i=react,firebase)](https://skillicons.dev)

Integrated with **third-party libraries** like:
- [Native Base](https://nativebase.io/)
- [FB SDK](https://github.com/facebookarchive/react-native-fbsdk)
- [Google Signin](https://www.npmjs.com/package/react-native-google-signin)

This project was made on 2020-2021.


## Run Locally

Clone the project

```bash
  git clone git@github.com:amaimasque/e-palengke.git
```

Go to the project directory

```bash
  cd e-palengke
```

Install dependencies

```bash
  yarn install
```

### Firebase

On `App.js` file, specify Firebase credentials
```bash
    firebase.initializeApp({
        projectId: '',
        apiKey: '',
        storageBucket: '',
      });
```

### Android

Go to `android` folder and add `local.properties` file.
Specify the SDK location.

```bash
  sdk.dir = <SDK location>
```

Start the server

```bash
  yarn start
```

Run app on device

```bash
  yarn android
```

## TODO
- [ ]   Update to latest version
- [ ]   Remove deprecated packages
