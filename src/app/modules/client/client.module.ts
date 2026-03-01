import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ClientRoutingModule } from './client-routing.module';
import { ReservationComponent } from './reservation/reservation.component';
import { ClientSettingsComponent } from './settings/settings.component';
import { ClientDashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [ReservationComponent, ClientSettingsComponent, ClientDashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ClientRoutingModule
  ]
})
export class ClientModule {}
