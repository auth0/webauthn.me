# WebAuthn.me

![A screenshot of webauthn.me](https://cdn.auth0.com/blog/webauthn/screenshot.png)

Web Authentication is a new standard enabling the creation and use of strong, attested, scoped, public key-based credentials by web applications, for the purpose of strongly authenticating users using hardware authenticators.

[WebAuthn.me](https://webauthn.me) contains a visual walkthrough of each step of the process of registering new credentials and authenticating using these credentials. There's also a debugger to play around with different configurations and an introduction page with some more information.

## Sponsor

|||
|-|-|
|![auth0 logo](https://user-images.githubusercontent.com/83319/31722733-de95bbde-b3ea-11e7-96bf-4f4e8f915588.png)|If you want to quickly add secure token-based authentication to your projects, feel free to check Auth0's documentation and free plan at [auth0.com/developers](https://auth0.com/developers?utm_source=GHsponsor&utm_medium=GHsponsor&utm_campaign=webauthnme&utm_content=auth)|

### How to build

First, install the required dependencies:

```
npm install
```

Spin up a development server:

```
npm run start:dev
```

Build the project:

```
npm run build
```

Run the tests:

```
npm run test
```

## What is Auth0?

Auth0 helps you to:

- Add authentication with [multiple authentication sources](https://auth0.com/docs/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
- Add authentication through more traditional [username/password databases](https://auth0.com/docs/connections/database/custom-db).
- Add support for [linking different user accounts](https://auth0.com/docs/link-accounts) with the same user.
- Support for generating signed [JSON Web Tokens](https://auth0.com/docs/jwt) to call your APIs and **flow the user identity** securely.
- Analytics of how, when, and where users are logging in.
- Pull data from other sources and add it to the user profile, through [JavaScript rules](https://auth0.com/docs/rules/current).

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com/developers/)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
