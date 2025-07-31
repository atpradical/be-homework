type Params = {
  ip: string;
  url: string;
};

export class IpRestricted {
  ip: string;
  url: string;
  createdAt: Date;

  constructor(params: Params) {
    const { ip, url } = params;
    this.ip = ip;
    this.url = url;
    this.createdAt = new Date();
  }

  static create(params: Params) {
    return new IpRestricted(params);
  }
}
