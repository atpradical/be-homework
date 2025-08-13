import { IpRestrictionRepository } from '../repositories/ip-restriction.repository';
import { ObjectResult } from '../../../core/result/object-result.entity';
import { ResultStatus } from '../../../core/result/resultCode';
import { REQUESTS_LIMIT } from '../../../core';
import { IpRestrictionModel } from '../../../db/models/ip-restriction.model';
import { inject, injectable } from 'inversify';

@injectable()
export class IpRestrictionService {
  constructor(
    @inject(IpRestrictionRepository) private ipRestrictionRepository: IpRestrictionRepository,
  ) {}

  async create(ip: string, url: string) {
    const newRecord = new IpRestrictionModel();

    newRecord.ip = ip;
    newRecord.url = url;

    const result = await this.ipRestrictionRepository.save(newRecord);

    if (!result) {
      return ObjectResult.createErrorResult({
        status: ResultStatus.InternalServerError,
        errorMessage: 'InternalServerError',
        extensions: 'Oops, something went wrong',
      });
    }

    return ObjectResult.createSuccessResult(null);
  }

  async checkRequestsLimit(ip: string, url: string): Promise<ObjectResult> {
    // проверить кол-во созданных документов в БД за последние 10 сек
    const documentCount = await this.ipRestrictionRepository.countByLastTenSeconds(ip, url);

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
  }
}
