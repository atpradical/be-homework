export class EmailExamples {
  registrationEmail(code: string) {
    return `<h1>Thanks for your registration</h1>
               <p>To finish registration, please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`;
  }
  registrationEmailResending(code: string) {
    return `<h1>Confirm email</h1>
               <p>We've sent you a new verification code. Please use it to complete your registration:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>Confirm</a>
              </p>`;
  }
  passwordRecoveryEmail(code: string) {
    return `<h1>Password recovery</h1>
        <p>To finish password recovery, please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
  }
}
