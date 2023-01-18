export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export const mockInvalidSignatureJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLnRhbXBlcmVkLWRvbWFpbi5kZXYiLCJleHAiOjE2NjY2NDgzMTAsImlhdCI6MTY2NjY0ODI1MCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5pbnNwaXJlZC5wdW1hLTc0LmxjbC5kZXYiLCJuYmYiOjE2NjY2NDgyNDAsInNpZCI6InNlc3NfMkdiREI0ZW5OZENhNXZTMXpwQzNYemc5dEs5Iiwic3ViIjoidXNlcl8yR0lwWE9FcFZ5Snc1MXJrWm45S21uYzZTeHIifQ.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export const mockMalformedJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2NjY2NDgyNTB9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

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
