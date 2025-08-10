import { Router } from 'express';
import { inputValidationResultMiddleware, ipRestrictionMiddleware } from '../../../core';
import { authInputValidation } from './middleware/auth.input-dto.validation';
import { accessTokenGuard } from './guards/access-token.guard';
import { registrationInputValidation } from './middleware/registration.input-dto.validation';
import { registrationEmailResendingInputValidation } from './middleware/registration-email-resending.input-dto.validation';
import { codeValidation } from './middleware/registration-confirmation.input-dto.validation';
import { refreshTokenGuard } from './guards/refresh-token.guard';
import { passwordRecoveryInputValidation } from './middleware/password-recovery.input-dto.validation';
import { newPasswordInputValidation } from './middleware/new-password.input-dto.validation';
import { container } from '../../../composition-root';
import { AuthController } from './auth.controller';

export const authRouter = Router({});

const authController = container.get(AuthController);

authRouter.post(
  '/login',
  ipRestrictionMiddleware,
  authInputValidation,
  inputValidationResultMiddleware,
  authController.loginHandler.bind(authController),
);

authRouter.get('/me', accessTokenGuard, authController.meHandler.bind(authController));

authRouter.post(
  '/registration',
  ipRestrictionMiddleware,
  registrationInputValidation,
  inputValidationResultMiddleware,
  authController.registrationHandler.bind(authController),
);

authRouter.post(
  '/registration-email-resending',
  ipRestrictionMiddleware,
  registrationEmailResendingInputValidation,
  inputValidationResultMiddleware,
  authController.registrationEmailResendingHandler.bind(authController),
);

authRouter.post(
  '/registration-confirmation',
  ipRestrictionMiddleware,
  codeValidation,
  inputValidationResultMiddleware,
  authController.registrationConfirmationHandler.bind(authController),
);

authRouter.post(
  '/refresh-token',
  refreshTokenGuard,
  authController.refreshTokenHandler.bind(authController),
);

authRouter.post('/logout', refreshTokenGuard, authController.logoutHandler.bind(authController));

authRouter.post(
  '/password-recovery',
  ipRestrictionMiddleware,
  passwordRecoveryInputValidation,
  inputValidationResultMiddleware,
  authController.passwordRecoveryHandler.bind(authController),
);

authRouter.post(
  '/new-password',
  ipRestrictionMiddleware,
  newPasswordInputValidation,
  inputValidationResultMiddleware,
  authController.newPasswordHandler.bind(authController),
);
