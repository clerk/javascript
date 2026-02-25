// @ts-ignore ignore types
import * as jwt from 'jsonwebtoken';
// @ts-ignore ignore types
import * as uuid from 'uuid';

const rsaPairs = {
  a: {
    private: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAlRVgJiQJ0nfuctIVSLnFJlAC76YPKly8Y5xrY36ADo472G1w
FpeiykQRyDdGOwrkJBEVmLpAybV4yTgQFpQ0A4YzeDlKKkOxBhCmuANZXluAm2MW
3ehNAm0svievMfKtG6UjjYz6v67U9Om/oMt1ehsOmR8MrDYvs3Wy+dxYpZaxyn6w
ajL7GkICHxc8cGsI/MBZr9jKtKyzFY++r8TQKAJwn9TcSQljRivomz1wQvjtdLnq
ZSLP3BFQB7e7DuM6SBsodIHhkVEVK2EaGVLOY+ifAITt7MqEcvast14AP0rICBSq
vbQQjZuwLgIrlJgqvJ4YBRfIaIx/qQzs0+eFtwIDAQABAoIBAD1H4xTqfWsZR1fF
SWBylDqSaxKNRPCZ3ApqEq58IjFZf/oPyiJPRGg2IMUXC3RbnrnAmAsGjHkdcj/s
HpjZZKQKNv/1NKo41vxyPcWoAsVJgYzd51liEr2rmNe1QkuawFN7xyh5Sd0fBYSC
zPVQjMKbep2waKolP+hZui8AxyORLtu6aUQawaCdWFyiyHtqEnlcb/YSTtGl/3W/
/LqYyv60dG0QdcAO37MAE42vp3R4GGcJelsFo/lxSKg+KiLn7NdsNr7bCJrqbVXz
93Fu5jgHQD9+BeVyvHJ/R2yg+utYEvIMiFvwX7z4MLh9PsWJbf9vbDNlw9ErWpf5
r1xUiqECgYEA/lLJP+qla0vd+ocYNe3ufOG4kaUFsrqRoChiS1JxwQr/WGTmV8sT
ZyTPwyxnsHtbzn4lwuI6CpAeyvd9O6G3FfTzUqsyPaknsGlymf8LEwL4AVo0BVY0
YGodRnDISBBU/yPQ2kvq6c72ouq5cQxWF45f8Z/Z+fFDjuHG6Q44hYcCgYEAlhD6
sm8wTWVklMAxOnhQJoseWQ1vcl6VCxRVv4QBiX9CQm/4ANVOWun4KRC5qqTdoNHc
RyuiWpZVgGblqUu4sWSQgi3CZyyLbHOJ9wTPTeo0oDVaFa9MMwS8rq35HXjpgREz
JtTRi6c9WVsjBygYiE5IYO0FGbEjI9qIiD5CClECgYA+wtVRRamu0dkk0yPhYycg
gF+Y6Z1/XtVDLdQb/GuAFSOwf63sanwOTyJKavHntnmQesb80fE63BgNRIgOKDlT
XNCTTRYn60+VFGCoqizkcy4av1TpID3qsSUqVfjG9+jR0dffly6Qpnds+vnqcP3p
8EOzEByttqFSaFs69jxyjwKBgFCQbQa+isACXy08wTESxnTq2zAT9nEANiPsltxq
kiivGXNxiUNpQNeuJHxnbkYenJ1qDUhoNJFNhDmbBFEPReh2hN5ekq+xSmi+3qKv
AlxiED6yZdqecdoyANoGrGcWMsYH5d5DAvxmnJkMRJHjBMiovlLK7KIOZz8oY4RB
aFMBAoGBAJ8UoGHwz7AdOLAldGY3c0HzaH1NaGrZoocSH19XI3ZYr8Qvl2XUww9G
UC1OG4e2PtZ8PINQGIYPacUaab5Yg1tOmxBoAx4gUkpgyjtSm2ZPd4EUVOdylU3E
aFa08+0FF7mqqJTgz5XlvHMrCcUTsJ9u+e05rr1G1PHsATuuMD9m
-----END RSA PRIVATE KEY-----`,
    public: {
      kty: 'RSA',
      n: 'lRVgJiQJ0nfuctIVSLnFJlAC76YPKly8Y5xrY36ADo472G1wFpeiykQRyDdGOwrkJBEVmLpAybV4yTgQFpQ0A4YzeDlKKkOxBhCmuANZXluAm2MW3ehNAm0svievMfKtG6UjjYz6v67U9Om_oMt1ehsOmR8MrDYvs3Wy-dxYpZaxyn6wajL7GkICHxc8cGsI_MBZr9jKtKyzFY--r8TQKAJwn9TcSQljRivomz1wQvjtdLnqZSLP3BFQB7e7DuM6SBsodIHhkVEVK2EaGVLOY-ifAITt7MqEcvast14AP0rICBSqvbQQjZuwLgIrlJgqvJ4YBRfIaIx_qQzs0-eFtw',
      e: 'AQAB',
    },
  },
  b: {
    private: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAt9zSYl1hFhFKXvv8uJcT2X15iOqi1mTtxqVxNDnzPQSj1RSa
Jryjhkzpyd16c+PDo+FFtMgZTUv6Z2hr5QYMuAjlsM+apHmfE8MRMQRQHXNF0+sE
Bd1241W0mL7fId2ZChaGgufFOGFl2Obby56FH4Z86lCFi7Z4Ow7TBSpVSN598OKH
oVKwbYOVPKtmWBar0JeCPVpng4Ntx7kvuHGdFSoJ8z8+Uy5ybLlk1qSlQ5lsymfW
hxs0C9j7/x/h24n9jUbq51pzx2URcsEi0Wbuv26Ba0Q4v1ySl0I6IM5Xemwrzjo1
H6kz6IYldqPtTwkzhJSnJvJFzKJZn3hH9N+rGwIDAQABAoIBAGLGdx/xGp9IWrP8
nCBuyXMmPYyYwTJ8tmDpsI9mMo6tV3a5wrbc0NztpQuVuJtZ2VjJRTGB7lXgY336
UzyOq3aTERKT9Xg2/ocXXL0AnCm2K+VVdKvR9nTbLlKA+E6xRe5te4YIDaPkb1q/
a4VQfCQblDAtYhFUzfKsXCGCRJ8IPlhZxiA9RHfQTmQUSoBW+12IovyMdMxVLoPT
qjdnwL1TS3iARim+eV+buHW+8Drn8eldeSFoTJd0B9eRf7pMpRH/X8G7X0YYdDjF
ADWI770CQj45QQeuVsZYIuONIPmzai4nGiNQ85v+Yy0L47lYUp5XsDvwYO5tMCQK
v1og8cECgYEA7zIfBWM1AIY763FGJ6F5ym41A4i7WSRaWusfQx6fOdGTyHJ3hXu9
+1kQS97IKElJ1V7oK69dJGxq+aupsd/AaRJb4oVZCBSby4Fo6VeJoKyJSdNSCks6
tonT3hGUsJO1ER2ItWcgiCxgGY+vrK0rkacX/VgNZKGIjlGv8pQUpaUCgYEAxMeL
2jyx+5odGM51e/1G4Vn6t+ffNNC/03NbwZeJ93+0NPgdagIo1kErZQrFPEfoExOr
KMkwnAsnR/xfn4X21voK1pUc7VhzzoODb8l9LA9kB7efWtRZA79gcsbOH5wNkp9Z
i76AtaVU/p1grFKNcnes1lbFfcRUnO880g5dsb8CgYBacuuEEAWk0x2pZEYRCmCR
iacGVRfzF2oLY0mJCfVP2c42SAKmOSqX9w/QgMfTZBNFWgQVMNTZxx2Ul7Mtjdym
XsjcGWyXP6PCCodvZSin11Z60iv9tIDZMbkqCh/dvZ0EgdSGNB77HzyfrdPSShFl
nHfX1woJeYO3vW/5HMHJ+QKBgQCNema7pq3Ulq5a2n2vgp9GgJn5RXW+lGOG1Mbg
vmJMlv1qpAUJ5bmUqdBYWlEKkSxzIs4JifUwC/jXEcVyfS/GyommVBkzMEg672U9
pyEe34Xs4oFpHYlOX3cprnQeV+WOSJFqHrKNZuxgD6ik3MmjxhV3GXXugYzQNFWH
NRr6IwKBgH9aN5mY4fcVL76mMEVZ5BIHE+JpPMZ6OOamOHAiA5jrWRX4aRMICq3t
cKVfcj/M4dyBuRV5EW1y1m2QhRECFPSKpScykpD9nyCb+XqbMSLH+f+j1BGfLKWl
t5o8u/dlwJ1fGGday48gs/hA4V/F9zDjecNkYWUB/wUwVStqZljn
-----END RSA PRIVATE KEY-----`,
    public: {
      kty: 'RSA',
      n: 't9zSYl1hFhFKXvv8uJcT2X15iOqi1mTtxqVxNDnzPQSj1RSaJryjhkzpyd16c-PDo-FFtMgZTUv6Z2hr5QYMuAjlsM-apHmfE8MRMQRQHXNF0-sEBd1241W0mL7fId2ZChaGgufFOGFl2Obby56FH4Z86lCFi7Z4Ow7TBSpVSN598OKHoVKwbYOVPKtmWBar0JeCPVpng4Ntx7kvuHGdFSoJ8z8-Uy5ybLlk1qSlQ5lsymfWhxs0C9j7_x_h24n9jUbq51pzx2URcsEi0Wbuv26Ba0Q4v1ySl0I6IM5Xemwrzjo1H6kz6IYldqPtTwkzhJSnJvJFzKJZn3hH9N-rGw',
      e: 'AQAB',
    },
  },
};

const allConfigs: any = [];

export function generateConfig({ mode, matchedKeys = true }: { mode: 'test' | 'live'; matchedKeys?: boolean }) {
  const ins_id = uuid.v4();
  const pkHost = `clerk.${uuid.v4()}.com`;
  const pk = `pk_${mode}_${btoa(`${pkHost}$`)}`;
  const sk = `sk_${mode}_${uuid.v4()}`;
  const rsa = matchedKeys
    ? rsaPairs.a
    : {
        private: rsaPairs.a.private,
        public: rsaPairs.b.public,
      };
  const jwks = {
    keys: [
      {
        ...rsa.public,
        kid: ins_id,
        use: 'sig',
        alg: 'RS256',
      },
    ],
  };

  type Claims = {
    sub: string;
    iat: number;
    exp: number;
    nbf: number;
  };
  const generateToken = ({
    state,
    extraClaims,
  }: {
    state: 'active' | 'expired' | 'early';
    extraClaims?: Map<string, any>;
  }) => {
    const claims = { sub: 'user_12345', azp: 'http://localhost' } as Claims;

    const now = Math.floor(Date.now() / 1000);
    if (state === 'active') {
      claims.iat = now;
      claims.nbf = now - 10;
      claims.exp = now + 60;
    } else if (state === 'expired') {
      claims.iat = now - 600;
      claims.nbf = now - 10 - 600;
      claims.exp = now + 60 - 600;
    } else if (state === 'early') {
      claims.iat = now + 600;
      claims.nbf = now - 10 + 600;
      claims.exp = now + 60 + 600;
    }

    // Merge claims with extraClaims
    if (extraClaims) {
      for (const [key, value] of extraClaims) {
        claims[key] = value;
      }
    }

    return {
      token: jwt.sign(claims, rsa.private, {
        algorithm: 'RS256',
        header: { kid: ins_id },
      }),
      claims,
    };
  };
  const config = Object.freeze({
    pk,
    sk,
    generateToken,
    generateHandshakeToken(payload: string[]) {
      return jwt.sign({ handshake: payload }, rsa.private, {
        algorithm: 'RS256',
        header: { kid: ins_id },
      });
    },
    jwks,
    pkHost,
  });
  allConfigs.push(config);
  return config;
}

export function getJwksFromSecretKey(sk: any) {
  return allConfigs.find((x: any) => x.sk === sk)?.jwks;
}
