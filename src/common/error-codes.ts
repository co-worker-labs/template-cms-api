export class ErrorCode {
  constructor(
    readonly code: number,
    readonly message: string,
  ) {}

  static of(code: number, message: string) {
    return new ErrorCode(code, message);
  }
}

export class Errs {
  static readonly SUCCESS = ErrorCode.of(200, 'success');
  static readonly NOT_FOUND = ErrorCode.of(404, 'not_found');
  static readonly UNAUTHORIZED = ErrorCode.of(401, 'unauthorized');
  static readonly FORBIDDEN = ErrorCode.of(401, 'forbidden');

  static readonly MISSING_PARAMETER = ErrorCode.of(400_01, 'parameter_missing');
  static readonly INVALID_PARAMETER = ErrorCode.of(400_02, 'parameter_invalid');
  static readonly INVALID_ID = ErrorCode.of(400_03, 'invalid_id');
  static readonly DUPLICATED = ErrorCode.of(400_04, 'duplicated');
  static readonly NOT_SUPPORTED = ErrorCode.of(400_05, 'not_supported');
  static readonly INCORRECT_USERNAME_OR_PASSWORD = ErrorCode.of(
    400_06,
    'incorrect_username_or_password',
  );
}
