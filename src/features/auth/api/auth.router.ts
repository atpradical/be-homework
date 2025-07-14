import { Router } from 'express';
import { loginHandler } from './handlers/login-handler';
import { inputValidationResultMiddleware } from '../../../core';
import { authInputValidation } from './middleware/auth.input-dto.validation';
import { accessTokenGuard } from './guards/access-token.guard';
import { meHandler } from './handlers/me.handler';
import { registrationHandler } from './handlers/registration.handler';
import { registrationInputValidation } from './middleware/registration.input-dto.validation';
import { registrationEmailResendingInputValidation } from './middleware/registration-email-resending.input-dto.validation';
import { registrationEmailResendingHandler } from './handlers/registration-emai-resending.handler';
import { codeValidation } from './middleware/registration-confirmation.input-dto.validation';
import { registrationConfirmationHandler } from './handlers/registration-confirmation.handler';
import { refreshTokenGuard } from './guards/refresh-token.guard';
import { refreshTokenHandler } from './handlers/refresh-token.handler';
import { logoutHandler } from './handlers/logout.handler';

export const authRouter = Router({});

authRouter.post('/login', authInputValidation, inputValidationResultMiddleware, loginHandler);

authRouter.get('/me', accessTokenGuard, meHandler);

authRouter.post(
  '/registration',
  registrationInputValidation,
  inputValidationResultMiddleware,
  registrationHandler,
);

authRouter.post(
  '/registration-email-resending',
  registrationEmailResendingInputValidation,
  inputValidationResultMiddleware,
  registrationEmailResendingHandler,
);

authRouter.post(
  '/registration-confirmation',
  codeValidation,
  inputValidationResultMiddleware,
  registrationConfirmationHandler,
);

authRouter.post('/refresh-token', refreshTokenGuard, refreshTokenHandler);

authRouter.post('/logout', refreshTokenGuard, logoutHandler);
