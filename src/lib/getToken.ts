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

import fetch from 'node-fetch'
import {decryptCookie, getEncryptedCookie} from './cookieEncrypter'
import BFFConfiguration from './BFFConfiguration'
import {BFFException, InvalidRequestException, InvalidStateException, MissingTempLoginDataException, AuthorizationServerException} from './exceptions'
import {getATCookieName, getAuthCookieName, getCSRFCookieName, getIDCookieName} from './cookieName'
import {getTempLoginDataCookieForUnset} from './pkce'

function getTokenEndpointResponse(config: BFFConfiguration, code: string, state: string, tempLoginData: string | undefined | null, ): Promise<any> {
    if (!tempLoginData) {
        return Promise.reject(new MissingTempLoginDataException())
    }

    const parsedTempLoginData = JSON.parse(decryptCookie(config.encKey, tempLoginData))

    if (parsedTempLoginData.state !== state) {
        return Promise.reject(new InvalidStateException())
    }

    return fetch(
        config.tokenEndpoint,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.clientID+ ":" + config.clientSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=authorization_code&redirect_uri=' + config.redirectUri + '&code=' + code + '&code_verifier=' + parsedTempLoginData.codeVerifier
        }).then(res => {
            // TODO Errors should be logged
            if (res.status >= 500) {
                throw new AuthorizationServerException()
            }

            if (res.status >= 400) {
                throw new InvalidRequestException()
            }

            return res.json()
    }).catch(err => {
        if (!(err instanceof BFFException)) {
            throw new AuthorizationServerException(err)
        } else {
            throw err
        }
    })
}

function refreshAccessToken(refreshToken: string, config: BFFConfiguration): Promise<any>
{
    console.log('*** in refreshAccessToken')
    console.log('Sending clientID: ' + config.clientID)
    console.log('Sending clientSecret: ' + config.clientSecret)
    console.log('Sending refreshToken: ' + refreshToken)
    console.log('Token endpoint: ' + config.tokenEndpoint)

    return fetch(
        config.tokenEndpoint,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.clientID+ ":" + config.clientSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=refresh_token&refresh_token='+refreshToken
        }).then(res => {

            console.log('*** error')
            console.log(res.text())

        // TODO Errors should be logged
        if (res.status >= 500) {
            console.log('*** Refresh token status 500')
            throw new AuthorizationServerException()
        }

        if (res.status >= 400) {
            console.log('*** Refresh token status 400')
            throw new InvalidRequestException()
        }

        return res.json()

    }).catch(err => {

        if (!(err instanceof BFFException)) {
            throw new AuthorizationServerException(err)
        } else {
            throw err
        }
    })
}

function getCookiesForTokenResponse(tokenResponse: any, config: BFFConfiguration, unsetTempLoginDataCookie: boolean = false, csrfCookieValue?: string): string[] {
    const cookies = [
        getEncryptedCookie(config.cookieOptions, tokenResponse.access_token, getATCookieName(config.cookieNamePrefix), config.encKey)
    ]

    if (csrfCookieValue) {
        cookies.push(getEncryptedCookie(config.cookieOptions, csrfCookieValue, getCSRFCookieName(config.cookieNamePrefix), config.encKey))
    }

    if (unsetTempLoginDataCookie) {
        cookies.push(getTempLoginDataCookieForUnset(config.cookieOptions, config.cookieNamePrefix))
    }

    if (tokenResponse.refresh_token) {
        cookies.push(getEncryptedCookie(config.cookieOptions, tokenResponse.refresh_token, getAuthCookieName(config.cookieNamePrefix), config.encKey))
    }

    if (tokenResponse.id_token) {
        cookies.push(getEncryptedCookie(config.cookieOptions, tokenResponse.id_token, getIDCookieName(config.cookieNamePrefix), config.encKey))
    }

    return cookies
}

export { getTokenEndpointResponse, getCookiesForTokenResponse, refreshAccessToken }
