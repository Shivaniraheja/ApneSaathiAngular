import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from 'src/environments/environment';
import {ApiInfoService} from 'src/app/services/api-info.service';
import { GlobalDialogComponent } from 'src/app/global-dialog/global-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-volunteer-detail-view',
  templateUrl: './volunteer-detail-view.component.html',
  styleUrls: ['./volunteer-detail-view.component.scss']
})
export class VolunteerDetailViewComponent implements OnInit {

  // @Input() progress: number;
  // @Input() total: number;
  // color: string;

  public volunteerId;
  public base_url;
  public volunteerDetailsDataSource;
  public assignedCitizensDataSource: object[];
  public ratingsDataSource: object[];
  public volunteerCallListDataSource: object[];
  public volunteerCallListLength;
  //public volunteersListDataSource;
  public width;

  // owl carousel code here
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ["<span class='material-icons'>navigate_before</span>", "<span class='material-icons'>navigate_next</span>"],
    responsive: {
      0: {
        items: 1 
      },
      400: {
        items: 3
      },
      740: {
        items: 4
      },
      940: {
        items: 5
      }
    },
    nav: true
  }
  constructor(private route: ActivatedRoute, private router: Router, private apiInfoService: ApiInfoService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.width = 80;
    this.base_url=environment.base_url;
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = parseInt(params.get('id'));
      this.volunteerId = id;
    });
    this.fetchDetails();
    //this.fetchVolunteersList();
  }
  getFullStarsArray(volunteer){
    let reviewsArray=[];
    if(Math.floor(volunteer.rating) > 0){
      let arraySize= Math.floor(volunteer.rating);
      let isHalfStar=false;
      let planeStars=arraySize >=5?0:(5-arraySize);
      if((volunteer.rating%1) >= 8){
        arraySize+=1;
      }
      else{
        isHalfStar=true;
        planeStars-=1;
      }
      for (let index = 1; index <= arraySize; index++) {
        let temp_obj={starType:'star',startColor:arraySize>=3?'rating-icon-yellow':'rating-icon-red'};
        reviewsArray.push(temp_obj);
      }
      if(isHalfStar){
        let temp_obj={starType:'star_half',startColor:arraySize>=3?'rating-icon-yellow':'rating-icon-red'};
          reviewsArray.push(temp_obj);
      }
      if(planeStars > 0){
        for (let index = 1; index <= planeStars; index++) {
          let temp_obj={starType:'star_outline',startColor:''};
          reviewsArray.push(temp_obj);
        }
      }
    }
    else{
      for (let index = 1; index <= 5; index++) {
        let temp_obj={starType:'star_outline',startColor:''};
        reviewsArray.push(temp_obj);
      }
    }
    return reviewsArray;
  }
  fetchDetails() {
    this.apiInfoService.getVolunteerDetails({id: this.volunteerId}).subscribe((data) => {
      this.volunteerDetailsDataSource = data.volunteerVO;
      this.assignedCitizensDataSource = data.volunteerVO.srCitizenList;
      this.ratingsDataSource = data.volunteerVO.volunteerRatingList;
      this.volunteerCallListDataSource = data.volunteerVO.volunteercallList;
    })
  }

  // fetchVolunteersList() {
  //   this.apiInfoService.postVolunteersList({"status": "Active"}).subscribe((data) => {
  //     this.volunteersListDataSource = data.volunteers;
  //     console.log(this.volunteersListDataSource);
  //   })
  // }

  totalCalls() {
    this.volunteerCallListLength = this.volunteerCallListDataSource.length;
  }

  volunteerRating(){
    return {
      'rating-icon-red': this.volunteerDetailsDataSource.rating > 0 && this.volunteerDetailsDataSource.rating <= 3,
      'rating-icon-yellow': this.volunteerDetailsDataSource.rating > 0  && this.volunteerDetailsDataSource.rating > 3
    }
  }

  gotoVolunteerList() {
    this.router.navigate(['volunteers/voluntersList',{id: this.volunteerId}]);
  }

  openGlobalPopup(configurationObject){
    const dialogRef = this.dialog.open(GlobalDialogComponent,configurationObject);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.fetchDetails();
      //this.fetchVolunteersList();
    });
  }

  opensrCitizenAssign(volunteer){
    let configObject ={
      data:{
        heading:"Assign Sr.citizens",
        feature: "assignCitizensSingleVolunteer",
        volunteerObj: volunteer
      },
      disableClose:true,
      width: "70%",
      autoFocus: false,
    };
    this.openGlobalPopup(configObject);
  }

  transferVolunteer(volunteer) {
    let configObject ={
      data:{
        heading:"Transfer Location of Volunteer",
        feature: "transferVolunteer",
        volunteerObj: volunteer
      },
      disableClose:true,
      width: "60%",
      height:"60%",
      autoFocus: false,
    };
    this.openGlobalPopup(configObject);
  }
  
}
