import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';
import { config, URLS, IProfile, ProfileService, WxCodeResult } from '../profile';
import { Jwt } from '../jwt';
import { nonce, removeURLParameter } from '../util';
import { IUserInfo, IUserTokenResponse, IRefreshTokenResponse } from './user';

@Injectable()
export class TokenService {

  private _userinfo: Observable<IUserInfo>;
  private headSrc: Observable<string>;
  private headNonce: string = nonce(8);

  constructor(
    private router: Router,
    private rawHttp: Http,
    private http: AuthHttp,
    private profileService: ProfileService,
    private jwt: Jwt) { }

  isLoggedIn(): boolean {
    return this.jwt.notExpired();
  }

  exchange(query: WxCodeResult): Observable<string> {
    return query.code && query.state && query.state === this.jwt.getOauth2State() ?
      this.rawHttp.get(config.wxExchangeCode(query.code)).map(res => this._parseAuthResult(<IUserTokenResponse>res.json())) :
      new Observable<string>((obs: any) => { obs.error(new Error()); });
  }

  _parseAuthResult(res: IUserTokenResponse) {
    let claims = this.jwt.decodeToken(res.AccessToken);
    let user = res.User;
    user.ID = +claims.uid;
    user.OpenId = claims.oid;
    user.Phone = claims.mob;
    user.User1 = +claims.us1;
    this.jwt.accessToken = res.AccessToken;
    this.jwt.refreshToken = res.RefreshToken;
    this._userinfo = Observable.of(user).publishReplay(1).refCount();
    return res.AccessToken;
  }

  // parseAuthResult(): Observable<string> {
  //   return this.jwt.getAuthResult().map(result => this._parseAuthResult(<IUserTokenResponse>JSON.parse(result)));
  // }

  // used to update token after bootstrap, will trigger login
  mustUpdateToken(): Observable<string> {
    return this.updateToken().catch((err, caught) => {
      // TODO remove
      if (ENV === 'development') {
        return this.rawHttp.get(URLS.FAKE_TOKEN).map(res => this._parseAuthResult(<IUserTokenResponse>res.json()));
      }
      return this.profileService.getProfile().flatMap(profile => {
        // clean url
        let {url: u, value: user1} = removeURLParameter(this.router.url, 'u');
        let query = (+user1) ? `?user1=${user1}` : '';
        let state = nonce(8);
        this.jwt.setOauth2State(state);
        this.jwt.setCurrentUrl(u);
        // return this.jwt.setOauth2State(state).flatMap(_ => this.jwt.setCurrentUrl()).flatMap(_ => {
        let codeEndpoint = 'https://open.weixin.qq.com/connect/oauth2/authorize';
        let {WxAppId: appId, WxScope: scope} = profile;
        let redirectUri = encodeURIComponent(`${URLS.WX_OAUTH2_LOCAL}${query}`);
        location.href = `${codeEndpoint}?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
        return caught;
        // });
      });
    });
  }

  updateToken(): Observable<string> {
    // return this.parseAuthResult().catch((err, caught) => {
    return this.jwt.canUpdate() ?
      this.http.get(URLS.UserRefreshToken(this.jwt.refreshToken)).map(res => this._updateToken(res.json())) :
      new Observable<string>((obs: any) => {
        obs.error(new Error('Refresh token expired'));
      });
    // });
  }

  _updateToken(res: IRefreshTokenResponse): string {
    if (res.OK) {
      this.jwt.accessToken = res.AccessToken;
    }
    return this.jwt.accessToken;
  }

}