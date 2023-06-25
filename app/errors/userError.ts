export const userErrorMessage = {
  userInfoError: {
    error: 101001,
    message: '账号或者密码输入错误,请检查后重试',
  },
  userAlreadyCreateError: {
    error: 101002,
    message: '该邮箱已注册,请进行登录操作',
  },
  tokenError: {
    error: 101003,
    message: '登录已过期，请登录后操作',
  },
  phoneValidateError: {
    error: 101004,
    message: '手机号格式错误',
  },
  sendCodeIsMoreError: {
    error: 101005,
    message: '请勿频繁发送短信',
  },
  codeValidateError: {
    error: 101006,
    message: '验证码错误',
  },
  userIdIsNullError: {
    error: 101007,
    message: '未查询到用户信息',
  },
  giteeOauthLoginError: {
    error: 101008,
    message: 'gitee 授权登录失败',
  },
};
