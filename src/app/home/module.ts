import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule } from '../core.module';

import { homeRouting } from './routes';

import { HomePageComponent } from './home-page.component';
import { HomeTopBarComponent } from './1.top-bar';
import { HomeNavBarComponent } from './2.nav-bar';
import { HomeGroupBuyComponent } from './3.group';
import { HomeSpecialOfferComponent } from './4.special-offer';
import { HomeFeaturedComponent } from './5.featured';
import { HomeLifeComponent } from './6.life';
import { HomeRecommendComponent } from './7.recommend';
import { HomeAdSlideComponent } from './ad-slide';

@NgModule({
  declarations: [
    HomePageComponent,
    HomeTopBarComponent,
    HomeNavBarComponent,
    HomeGroupBuyComponent,
    HomeSpecialOfferComponent,
    HomeFeaturedComponent,
    HomeLifeComponent,
    HomeRecommendComponent,
    HomeAdSlideComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,

    homeRouting,
  ],
  exports: [
    HomePageComponent,
  ],
})
export class HomeModule { }
