import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  /*{
    path: '', pathMatch: 'full', redirectTo: 'volunteers'
  },*/
  { 
    path: 'volunteers', 
    loadChildren: () => import('./volunteers/volunteers.module').then(m => m.VolunteersModule)
  }, 
  { path: 'seniorCitizens', 
   loadChildren: () => import('./senior-citizens/senior-citizens.module').then(m => m.SeniorCitizensModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
