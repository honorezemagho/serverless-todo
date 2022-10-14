import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev--nf202gv.us.auth0.com/.well-known/jwks.json';
const authCert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJD+gEv1MQkz1eMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0tbmYyMDJndi51cy5hdXRoMC5jb20wHhcNMjIxMDA5MDQxMDM4WhcN
MzYwNjE3MDQxMDM4WjAkMSIwIAYDVQQDExlkZXYtLW5mMjAyZ3YudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArQ0KX7CaqxwhcANj
9HYDlFuiz4YpQ0x6j4KdIyXzPIFRXkZ2AQgKmb/hPZ+mH/nIVV3xU97VXH5tODnu
SAKpiqyFl+W9jKSoVO6EcI5AfOlof4WOhK0I26/YFETRrAsztPmbJ0Ch29vyKW4y
Ycs6Vu9CcpWLi0fAY3l97R6NzhRq2Fl1t3wh2X7UM2k9/IG8wnz9jslWKlxhdkvG
Yp3aCAwPSrwScLf4oZA/LSZx6pRt/IEwqG+6MRf4MG0L/J2JD17LBsJZiMdlEdhF
NsJuzzriFDUqgKuY/hy5EX+XTzimF+hfz4Pf7AtWxYcG/OZDx/Vz04R2buMNSoIq
pCxElQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ4XL/QI6V/
sFSnDR2ffjYwlB+6KzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AAKPnMLeXSwAs8PNkOS0Le4DgwSBhcFwe8H3yShGR6QxOjySWRyDWD76nhHHl/Mo
BxfHwcmk5C9inHBrf4emPn+8Sfj2T24hFTt1l+0w8K8rjPbJDLEnal8v71huMTuo
xTWkdJN5ogpHm+EbzpM8Uy/GtqpTn+/KG2fpwMmaiHwS0T7ubVWOVWdXn2jcw7gg
Nv4xWdzzNRQ37M/e9sIcPkuYG0TS8sTwxMiFYyDpRcxAziTf0nnF4SNi4wePSQoj
91G/DzIJSGdEpcsVvRDag7QCJQACBxzJU+FMb34qDz1xV1KftL6c7lGWCAqHJnD6
lp8vZcU/tKFV2wA5UQ6qgtA=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, authCert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
