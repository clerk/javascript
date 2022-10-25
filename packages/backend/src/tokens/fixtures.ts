export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

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
