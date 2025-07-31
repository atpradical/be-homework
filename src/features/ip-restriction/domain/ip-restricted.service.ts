import { IpRestricted } from './ip-restricted.entity';
import { ipRestrictedRepository } from '../repositories/ip-restricted.repository';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { REQUESTS_LIMIT } from '../../../core';

export const ipRestrictedService = {
  async create(ip: string, url: string) {
    const newRecord = IpRestricted.create({ ip, url });

    const result = await ipRestrictedRepository.create(newRecord);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },

  async checkRequestsLimit(ip: string, url: string): Promise<ObjectResult> {
    // проверить кол-во созданных документов в БД за последние 10 сек
    const documentCount = await ipRestrictedRepository.countByLastTenSeconds(ip, url);

    if (documentCount === undefined) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    // max 5 попыток за 10 секунд
    if (documentCount >= REQUESTS_LIMIT) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.TooManyRequests,
        errorMessage: 'TooManyRequests',
        extensions: 'Rate limit exceeded: 5 attempts per 10 seconds',
      });
    }

    return ObjectResult.createSuccessResult(null);
  },
};
