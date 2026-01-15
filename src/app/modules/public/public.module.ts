import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PublicRoutingModule} from './public-routing.module';
import {HomeComponent} from './home/home.component';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    HomeComponent,  
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule
  ],

})
export class PublicModule {
}
