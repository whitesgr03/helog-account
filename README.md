# HeLog Account

HeLog-Account is the HeLog blog's authenticator built with React. Allows users to sign in with SSO (google, facebook) or email address and sign up. Hosted on Vercel.

![website screenshots](https://i.meee.com.tw/0rbkFqL.png)

## Links

- Live Demo: [https://helog.whitesgr03.me](https://helog.whitesgr03.me)
- Frontend Repository: [https://github.com/whitesgr03/helog](https://github.com/whitesgr03/helog)
- Backend Repository: [https://github.com/whitesgr03/heLog-api](https://github.com/whitesgr03/heLog-api)

## Features:

- Google and Facebook social authentication.
- Post any content and images.
- Comment on any post.
- Responsive design for mobile devices.

## Usage:

You can access posts or comment messages on the [Live Demo](https://helog.whitesgr03.me) through your web browser.

<details>

- Sign in with SSO (Google, Facebook).

  <img src="https://i.meee.com.tw/pkMFCg5.png" alt="Sign in page"/>

- Sign up with your email address.

   <img src="https://i.meee.com.tw/1OChRHL.png" alt="Sign up page"/>

</details>

## Technologies:

1. [React Context](https://react.dev/learn/passing-data-deeply-with-context) to sharing App component data deeply thought the tree and preventing rerender all components when the state of app component is changed.

2. [React Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) to extract the all the state logic of context and preventing rerender the event handles of context when state of context is changed.

3. [Typescript](https://www.typescriptlang.org/) used to save considerable amounts time in validating that project have not accidentally broken.

4. [React Router](https://reactrouter.com/) to keep the user interface in sync with the URL. In addition, it allows defining which component to display for a specified URL.

5. [Yup](https://github.com/jquense/yup) to validate any form's data and make sure that it matches the schemas that define how the data should look and the values expected to conform to them.

## Additional info:

- This project consists of a backend for API and three different front-ends for authentication, accessing and editing blog posts.

- The backend's authentication is cookie-based to prevent the need to log in again when switching between three different front-ends.

## Source folder structure

```
src/
│
├─── assets/                            # Static assets (icons, images)
│
├─── components/                        # Each React component is placed in a folder with its associated CSS modules and tests
│     ├── layout/
│     │    ├── Footer/
│     │    │    └── Footer.tsx
│     │    │
│     │    └── Header/
│     │         └── Header.tsx
│     ├── pages/
│     │    ├── Account/
│     │    │    ├── AccountCreate.tsx
│     │    │    ├── Federation.tsx
│     │    │    ├── RequestResetPasswordModal.tsx
│     │    │    ├── ResendVerificationCodeButton.tsx
│     │    │    ├── ResetPasswordModal.tsx
│     │    │    ├── SignIn.tsx
│     │    │    ├── SignUp.tsx
│     │    │    └── VerificationCodeModal.tsx
│     │    ├── Alert.tsx
│     │    ├── App.tsx
│     │    ├── AppContext.tsx
│     │    └── Modal.tsx
│     ├── utils/
│     │    ├── Error/
│     │    │    ├── Error.tsx
│     │    │    ├── NotFound.tsx
│     │    │    └── Offline.tsx
│     │    └── Loading.tsx
│     │
│     └── useFetchUser.tsx
│
├─── lib/                               # Generic function
│     ├── handleAccount.ts              # Handle authentication API
│     ├── handleFetch.ts
│     ├── handleUser.ts                 # Handle user info API
│     └── verifySchema.ts               # Handle yup package validation values
│
├─── styles/                            # Generic CSS Modules
│     ├── button.module.css
│     ├── form.module.css
│     ├── image.module.css
│     ├── modal.module.css
│     └── index.css                     # Index CSS include main custom properties and type selectors styles
│
├─── main.tsx
└──  Router.tsx                         # React router config
```
