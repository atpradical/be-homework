import { IResult, UAParser } from 'ua-parser-js';

export class UaParserService {
  async parse(ua: string): Promise<IResult> {
    return new UAParser(ua).getResult();
  }
}
