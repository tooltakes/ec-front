export interface IHeadUptokenResponse {
  HeadToken: string;
}

export class HeadUptoken {
  token: string;
  deadline: number;

  constructor(res: IHeadUptokenResponse) {
    this.token = res.HeadToken;
    let putPolicy = JSON.parse(atob(res.HeadToken.split(':', 3)[2]));
    this.deadline = (putPolicy.deadline - 10) * 1000;
  }

  valid(): boolean {
    return this.token && this.deadline && Date.now() < this.deadline;
  }
}
