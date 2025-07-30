import { IResult, UAParser } from 'ua-parser-js';

export const uaParserService = {
  async parse(ua: string): Promise<IResult> {
    return new UAParser(ua).getResult();
  },
};
