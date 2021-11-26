/*
 *  Copyright 2021 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {BFFConfiguration} from './lib'
import {CookieSerializeOptions} from 'cookie'

export const config: BFFConfiguration = {
    clientID: process.env.CLIENT_ID || 'spa-client',
    clientSecret: process.env.CLIENT_SECRET || 'Password1',
    redirectUri: process.env.REDIRECT_URI || 'http://www.example.local/',
    postLogoutRedirectURI: process.env.POST_LOGOUT_REDIRECT_URI || 'http://www.example.local/',
    scope: process.env.SCOPE || 'openid profile',

    encKey: process.env.COOKIE_ENCRYPTION_KEY || 'NF65meV>Ls#8GP>;!Cnov)rIPRoK^.NP', // 32-character long string,
    cookieNamePrefix: process.env.COOKIE_NAME_PREFIX || 'example',
    bffEndpointsPrefix: '/tokenhandler',
    cookieOptions: {
        httpOnly: true,
        sameSite: true,
        secure: false,
        domain: process.env.COOKIE_DOMAIN || 'api.example.local',
        path: '/',
    } as CookieSerializeOptions,

    trustedWebOrigins: [process.env.TRUSTED_WEB_ORIGIN || 'http://www.example.local'],
    authorizeEndpoint: process.env.AUTHORIZE_ENDPOINT || 'http://login.example.local:8443/oauth/v2/oauth-authorize',
    logoutEndpoint: process.env.LOGOUT_ENDPOINT || 'http://login.example.local:8443/oauth/v2/oauth-session/logout',
    tokenEndpoint: process.env.TOKEN_ENDPOINT || 'http://login.example.local:8443/oauth/v2/oauth-token',
}
