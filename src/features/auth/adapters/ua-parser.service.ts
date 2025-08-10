import { IResult, UAParser } from 'ua-parser-js';
import { injectable } from 'inversify';

@injectable()
export class UaParserService {
  async parse(ua: string): Promise<IResult> {
    return new UAParser(ua).getResult();
  }
}
