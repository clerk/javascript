import { base64url } from '../util/rfc4648';

export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export const mockInvalidSignatureJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLnRhbXBlcmVkLWRvbWFpbi5kZXYiLCJleHAiOjE2NjY2NDgzMTAsImlhdCI6MTY2NjY0ODI1MCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5pbnNwaXJlZC5wdW1hLTc0LmxjbC5kZXYiLCJuYmYiOjE2NjY2NDgyNDAsInNpZCI6InNlc3NfMkdiREI0ZW5OZENhNXZTMXpwQzNYemc5dEs5Iiwic3ViIjoidXNlcl8yR0lwWE9FcFZ5Snc1MXJrWm45S21uYzZTeHIifQ.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export const mockMalformedJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2NjY2NDgyNTB9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

const mockJwtSignature =
  'n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export const mockJwtHeader = {
  alg: 'RS256',
  kid: 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD',
  typ: 'JWT',
};

export const mockJwtPayload = {
  azp: 'https://accounts.inspired.puma-74.lcl.dev',
  exp: 1666648310,
  iat: 1666648250,
  iss: 'https://clerk.inspired.puma-74.lcl.dev',
  nbf: 1666648240,
  sid: 'sess_2GbDB4enNdCa5vS1zpC3Xzg9tK9',
  sub: 'user_2GIpXOEpVyJw51rkZn9Kmnc6Sxr',
};

export const mockRsaJwkKid = 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD';

export const mockRsaJwk = {
  use: 'sig',
  kty: 'RSA',
  kid: mockRsaJwkKid,
  alg: 'RS256',
  n: 'u0tNUitBZmcGYMWcqvaRBaJe0XmTQ738RHYoHjhYANyeOkysuu4L_Rqr-fmTXsbebrTp7_OewIqsJXImEWB_WQ3HN9lAkOMCCGDU1udsz_sl1Kwy5JZ7x8Nr4ghXJagQzEF0Ovsj7_TPsBJGkVJ-OiZsTXCe7EAmG5gNGGPBE5Gu14Rwb-eZ5r9RCAaPfhxR1yHYTAvCrku_6i2os7RLpT6UockKtX4QQSH2CMveNwqd6LdwhV8USZrczB2VYkAImngJC745-EWek1sVExYkqheGvC3J8O7D9H4JtaKD2zaq0rJzsIU0zb_wwax5-La-uRuPYvTXlO8B8IK4jjNMCQ',
  e: 'AQAB',
};

export const mockJwks = {
  keys: [mockRsaJwk],
};

export const mockPEMKey =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8Z1oLQbaYkakUSIYRvjmOoeXMDFFjynGP2+gVy0mQJHYgVhgo34RsQgZoz7rSNm/EOL+l/mHTqQAhwaf9Ef8X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki+m55zftO7pkOoXDtIqCt+5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO/FzfYpWu7+691q+ZRUGxWvGc0ays4ACa7JXElCIKXRv/yb3Vc1iry77HRAQ28J7Fqpj5Cb+sxfFI+Vhf1GB1bNeOLPR10nkSMJ74HB0heHi/SsM83JiGekv0CpZPCC8jcQIDAQAB';

export const mockPEMJwk = {
  kid: 'local',
  kty: 'RSA',
  alg: 'RS256',
  n: '8Z1oLQbaYkakUSIYRvjmOoeXMDFFjynGP2-gVy0mQJHYgVhgo34RsQgZoz7rSNm_EOL-l_mHTqQAhwaf9Ef8X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki-m55zftO7pkOoXDtIqCt-5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO_FzfYpWu7-691q-ZRUGxWvGc0ays4ACa7JXElCIKXRv_yb3Vc1iry77HRAQ28J7Fqpj5Cb-sxfFI-Vhf1GB1bNeOLPR10nkSMJ74HB0heHi_SsM83JiGekv0CpZPCC8jcQ',
  e: 'AQAB',
};

export const mockPEMJwtKey =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8Z1oLQbaYkakUSIYRvjm\n' +
  'OoeXMDFFjynGP2+gVy0mQJHYgVhgo34RsQgZoz7rSNm/EOL+l/mHTqQAhwaf9Ef8\n' +
  'X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki+m55zftO7pkOoXDtI\n' +
  'qCt+5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO\n' +
  '/FzfYpWu7+691q+ZRUGxWvGc0ays4ACa7JXElCIKXRv/yb3Vc1iry77HRAQ28J7F\n' +
  'qpj5Cb+sxfFI+Vhf1GB1bNeOLPR10nkSMJ74HB0heHi/SsM83JiGekv0CpZPCC8j\n' +
  'cQIDAQAB\n' +
  '-----END PUBLIC KEY-----';

export const pemEncodedSignKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpjLcxjx86d4TL
M0O72WnqIZcqQ1QX6791SeuWRp1ljIHfl5/MoUkSv19+2Za/k9SPW5EdNDduHpfV
xx45iwiPLTTx0dZkmwqEY7GB1ON4r3WuNqSXG3u3IVcSIocg6vUtKArOikKU58Ii
PEr+g9Q5/fylWHtad6RxIFCZTl+oD4TMoyLqT1XC9vOoqVkzhdCyIXKfbx31W5sl
aNNTyc2i3SfU0T72TpPEzyeCUzhHCQEfg2LgHQuEoo45X4Aby0E2JlWKXjXl2kGV
2Yn+PTCTsB3hUWL16fdnXugIqv4r7O5Pu8owpJvXnjx2TS+eaLS+PZAZdKj7rXAz
nJBamTqxAgMBAAECggEAB/SNR+sCORkQhwRBwleiK5Ul5ZrBIFo0Yol0X1my2ufr
1BTmL5DFv/ZwwZ/t/dEu4QcX2PnxO959m087cNHANg+V8164I4JOzQVsd74Iako5
SFJSCLEGbgJHdpdeJcJAfLzrPOOp2hjBuB+CGU0QMSRkrVFogEcq1RACGB9gR59X
Kft9GC+iZowLUwwlUWpUpPK94ZIfxFflJdBSl9DPSjUq9lNPWhy2/qwjkDluKIG1
9p4gmRRNT1vSwBmwfq74jrB+rSYL6+IpmSw0PX41pSkuuNPQ0LgrtM7+9dr9tNVP
Wxc1HVZYj8r0FF3Yr5JFlHy9nxf/XMzQxNhZpaNRXQKBgQDirp04vgu3TB08UoKo
jovEzMT/jBwGkP1lV48MsjM9iiNZZ2mz01T4mvE70GwuMBwOwtjUuNPogoJT+i6I
dnaPCinr3JwMW1UUFSa/4b15nDsPxFZit1nficJXKMc0c5VxFn2Xpbcq6aeif/ny
a6bI1vh5N/CYIroZXqays4XbuwKBgQC/enY3H/clEVRGGytnqz/5JBncskCU0F/A
RsbYBPUg3tPZoBURTcLRPsCDWZKXCl2MLzP8h0ia1hMQiz88tsZl8PS5IYB4eEfy
iEpwuU7q4pNJDgiZzMIs7h7KlKJOGv56HCQfWW/9HUpyZA634IIN+TnCD5YCoNLo
IoqYoz++gwKBgFHZmwuSE8jrwuK1KFiUoAM/rSJZBQWZ9OVS6GQ9NCNUbc8qeBBm
jpf12oUujOFgncD2ujSVSG78MPMBsyuzGrwrf1ebIP2VPPMzb/p5GGGA+BKJYmfi
rKD6rSGrp8JYue1Loa3QOINWOyGB9E6EcIS0mqOqf0VvxKLEeoysJflhAoGAMPYp
gFMGKU5TFFIiOTIK+7QFgO97oBHgShRPCDHMVIll9oH+oRwXMtYu9+dRmpml7hCr
5GjbYexXl6VjmCzMcoi4qxYr+aIYE6ZSEpzv1xP0wXt7K4i2JjMFYJu9HOe+Jo9H
lVSTVE/HF5UKRm58EwKliD/gBfAFviIG+pzT0e0CgYBjVfmflnceTDiWGUqZB/6K
VemEqCD+L3Pf6FIGI0h2RfFcLowvyOC3qwINTrYXdNUHtLI1BDUkMYBv6YJdI4E/
EJa5L6umCqdlL4+iL3FKgnsVSkb7io8+n1XLF+qrbRjWpEDuSn8ICC+k/fea/mvj
5gTPwKCFpNesz5MP8D2kRg==
-----END PRIVATE KEY-----`;

export const pemEncodedPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqYy3MY8fOneEyzNDu9lp
6iGXKkNUF+u/dUnrlkadZYyB35efzKFJEr9fftmWv5PUj1uRHTQ3bh6X1cceOYsI
jy008dHWZJsKhGOxgdTjeK91rjaklxt7tyFXEiKHIOr1LSgKzopClOfCIjxK/oPU
Of38pVh7WnekcSBQmU5fqA+EzKMi6k9VwvbzqKlZM4XQsiFyn28d9VubJWjTU8nN
ot0n1NE+9k6TxM8nglM4RwkBH4Ni4B0LhKKOOV+AG8tBNiZVil415dpBldmJ/j0w
k7Ad4VFi9en3Z17oCKr+K+zuT7vKMKSb1548dk0vnmi0vj2QGXSo+61wM5yQWpk6
sQIDAQAB
-----END PUBLIC KEY-----`;

export const someOtherPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5wdNEDm/HUAO6xarLs6e
cS0/J8GencMs5I6rYS825knb8jsNbfoukYfBiK81vQy1/eK5gdWrEprpXQrmIcwG
akdeUhybYlK68UhHNA5+TAmZ+ReLTJ2QDk5YU4I1NlRRq/bqtEhWsBDOCCkpVsC4
OLnUpsZKGUwpCrE/8stMSJ6Xx+TzBlDe21cV1j0gn5CWswrrXo7m8OIZ9xkRnNn4
fTNypMSCbx6BS7fgmer6Efx9HOu9UIKgXD/29q3pEpFXiHRdQRbVoAc9vEZl0QIw
PSNjILVJLKvb6MhKoQMyaP5k0c1rEkVJr9jQk5Z/6WPklCNK3oT5+gh2lgi7ZxBd
oQIDAQAB
-----END PUBLIC KEY-----`;

// These should be identical to the pem encoded keys above
export const signingJwks = {
  key_ops: ['sign'],
  ext: true,
  kty: 'RSA',
  n: 'qYy3MY8fOneEyzNDu9lp6iGXKkNUF-u_dUnrlkadZYyB35efzKFJEr9fftmWv5PUj1uRHTQ3bh6X1cceOYsIjy008dHWZJsKhGOxgdTjeK91rjaklxt7tyFXEiKHIOr1LSgKzopClOfCIjxK_oPUOf38pVh7WnekcSBQmU5fqA-EzKMi6k9VwvbzqKlZM4XQsiFyn28d9VubJWjTU8nNot0n1NE-9k6TxM8nglM4RwkBH4Ni4B0LhKKOOV-AG8tBNiZVil415dpBldmJ_j0wk7Ad4VFi9en3Z17oCKr-K-zuT7vKMKSb1548dk0vnmi0vj2QGXSo-61wM5yQWpk6sQ',
  e: 'AQAB',
  d: 'B_SNR-sCORkQhwRBwleiK5Ul5ZrBIFo0Yol0X1my2ufr1BTmL5DFv_ZwwZ_t_dEu4QcX2PnxO959m087cNHANg-V8164I4JOzQVsd74Iako5SFJSCLEGbgJHdpdeJcJAfLzrPOOp2hjBuB-CGU0QMSRkrVFogEcq1RACGB9gR59XKft9GC-iZowLUwwlUWpUpPK94ZIfxFflJdBSl9DPSjUq9lNPWhy2_qwjkDluKIG19p4gmRRNT1vSwBmwfq74jrB-rSYL6-IpmSw0PX41pSkuuNPQ0LgrtM7-9dr9tNVPWxc1HVZYj8r0FF3Yr5JFlHy9nxf_XMzQxNhZpaNRXQ',
  p: '4q6dOL4Lt0wdPFKCqI6LxMzE_4wcBpD9ZVePDLIzPYojWWdps9NU-JrxO9BsLjAcDsLY1LjT6IKCU_ouiHZ2jwop69ycDFtVFBUmv-G9eZw7D8RWYrdZ34nCVyjHNHOVcRZ9l6W3Kumnon_58mumyNb4eTfwmCK6GV6msrOF27s',
  q: 'v3p2Nx_3JRFURhsrZ6s_-SQZ3LJAlNBfwEbG2AT1IN7T2aAVEU3C0T7Ag1mSlwpdjC8z_IdImtYTEIs_PLbGZfD0uSGAeHhH8ohKcLlO6uKTSQ4ImczCLO4eypSiThr-ehwkH1lv_R1KcmQOt-CCDfk5wg-WAqDS6CKKmKM_voM',
  dp: 'UdmbC5ITyOvC4rUoWJSgAz-tIlkFBZn05VLoZD00I1Rtzyp4EGaOl_XahS6M4WCdwPa6NJVIbvww8wGzK7MavCt_V5sg_ZU88zNv-nkYYYD4EoliZ-KsoPqtIaunwli57UuhrdA4g1Y7IYH0ToRwhLSao6p_RW_EosR6jKwl-WE',
  dq: 'MPYpgFMGKU5TFFIiOTIK-7QFgO97oBHgShRPCDHMVIll9oH-oRwXMtYu9-dRmpml7hCr5GjbYexXl6VjmCzMcoi4qxYr-aIYE6ZSEpzv1xP0wXt7K4i2JjMFYJu9HOe-Jo9HlVSTVE_HF5UKRm58EwKliD_gBfAFviIG-pzT0e0',
  qi: 'Y1X5n5Z3Hkw4lhlKmQf-ilXphKgg_i9z3-hSBiNIdkXxXC6ML8jgt6sCDU62F3TVB7SyNQQ1JDGAb-mCXSOBPxCWuS-rpgqnZS-Poi9xSoJ7FUpG-4qPPp9Vyxfqq20Y1qRA7kp_CAgvpP33mv5r4-YEz8CghaTXrM-TD_A9pEY',
  alg: 'RS256',
};

export const publicJwks = {
  key_ops: ['verify'],
  ext: true,
  kty: 'RSA',
  n: 'qYy3MY8fOneEyzNDu9lp6iGXKkNUF-u_dUnrlkadZYyB35efzKFJEr9fftmWv5PUj1uRHTQ3bh6X1cceOYsIjy008dHWZJsKhGOxgdTjeK91rjaklxt7tyFXEiKHIOr1LSgKzopClOfCIjxK_oPUOf38pVh7WnekcSBQmU5fqA-EzKMi6k9VwvbzqKlZM4XQsiFyn28d9VubJWjTU8nNot0n1NE-9k6TxM8nglM4RwkBH4Ni4B0LhKKOOV-AG8tBNiZVil415dpBldmJ_j0wk7Ad4VFi9en3Z17oCKr-K-zuT7vKMKSb1548dk0vnmi0vj2QGXSo-61wM5yQWpk6sQ',
  e: 'AQAB',
  alg: 'RS256',
};

// this jwt has be signed with the keys above. The payload is mockJwtPayload and the header is mockJwtHeader
export const signedJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.j3rB92k32WqbQDkFB093H4GoQsBVLH4HLGF6ObcwUaVGiHC8SEu6T31FuPf257SL8A5sSGtWWM1fqhQpdLohgZb_hbJswGBuYI-Clxl9BtpIRHbWFZkLBIj8yS9W9aVtD3fWBbF6PHx7BY1udio-rbGWg1YAOZNtVcxF02p-MvX-8XIK92Vwu3Un5zyfCoVIg__qo3Xntzw3tznsZ4XDe212c6kVz1R_L1d5DKjeWXpjUPAS_zFeZSIJEQLf4JNr4JCY38tfdnc3ajfDA3p36saf1XwmTdWXQKCXi75c2TJAXROs3Pgqr5Kw_5clygoFuxN5OEMhFWFSnvIBdi3M6w';

export const pkTest = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
export const pkLive = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

type CreateJwt = (opts?: { header?: any; payload?: any; signature?: string }) => string;
export const createJwt: CreateJwt = ({ header, payload, signature = mockJwtSignature } = {}) => {
  const encoder = new TextEncoder();

  const stringifiedHeader = JSON.stringify({ ...mockJwtHeader, ...header });
  const stringifiedPayload = JSON.stringify({ ...mockJwtPayload, ...payload });

  return [
    base64url.stringify(encoder.encode(stringifiedHeader), { pad: false }),
    base64url.stringify(encoder.encode(stringifiedPayload), { pad: false }),
    signature,
  ].join('.');
};

export function createCookieHeader(cookies: Record<string, string>): string {
  return Object.keys(cookies)
    .reduce((result: string[], cookieName: string) => {
      return [...result, `${cookieName}=${cookies[cookieName]}`];
    }, [])
    .join('; ');
}
