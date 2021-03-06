import { Component, OnInit, ViewChild , EventEmitter, Input,  Output, OnDestroy} from '@angular/core';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
import '@angular/material/prebuilt-themes/deeppurple-amber.css';
import { environment } from 'src/environments/environment';
// import { MatDialog } from '@angular/material/dialog';
import { GlobalDialogComponent } from 'src/app/global-dialog/global-dialog.component';
import { MatSort } from '@angular/material/sort';
import { ApiInfoService } from 'src/app/services/api-info.service';
import {ActivatedRoute,Router, ParamMap} from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';
import{LocationService} from '../../services/location.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material/dialog';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import { VolunteersComponent } from '../volunteers.component';
import { identifierModuleUrl } from '@angular/compiler';
import { SubscriptionsContainer } from 'src/app/subscriptions-container';

export interface DeboarededVolunteers {
  name: string; 
  position: number;  
  rating: number;
  contactNumber: number;
  state:string;
  district:string;
  block:string;
  assignedSrCitizen:any;
  
}
export interface sortObjectInterface {
  key: string; 
  type: string; 
}
/**
 * @title Basic use of `<mat-table>` (uses display flex)
 */


@Component({
  selector: 'app-volunteers-list',
  templateUrl: './volunteers-list.component.html',
  styleUrls: ['./volunteers-list.component.scss']
})
export class VolunteersListComponent implements OnInit,  OnDestroy {
  createFilterGroup: FormGroup;
  states: {};
  districts: {};
  blocks:{};

  // filterState:string;
  // filterDistrict:string;
  // filterBlock:string;
  statesList:string[];
  districtsList:string[];
  blocksList:string[];
  selectedState:string='';
  selectedDistrict:string='';
  selectedBlock:string='';
  selectedSort:any;
  sortBy;
  sortBys: string[] = [
    'SortBy','rating','assignedSrCitizen'
  ];

 




  dataSource:any[];
  displayedColumns: string[] = [ 'firstName','rating' ,'phoneNo', 'state','district','block', 'count_SrCitizen','actions'];
  deboardedDataSource; 
  deboardedColumns: string[] = [  'firstName', 'rating','phoneNo', 'state','district','block','count_SrCitizen'];
  // dataSource1 = new MatTableDataSource(this.DEBOARDED_VOLUNTEER);
  
  links = ['Active Volunteers', 'Deboarded Volunteers'];
  activeLink = this.links[0];

  actions:any[]=[];
 


  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  // startIndex=0;
  // endIndex=12;
  // length;
  // pageSize;
//  config:any;
//  collection = [];

data:Array<any>;
totalRecords: String;
page:Number=1;
//pageSize:Number=7;
itemsPerPage:Number=7;
  
 public base_url;
 public selectedId;
  exampleDatabase: any;
  active_total;
 p2;
 p1;
 public subs = new SubscriptionsContainer();
 public noData={message:''};
 public noDeboardData={message:''};
 public loadingSpinner:boolean=true;
 public deboarded_total;
 public sortObj:sortObjectInterface={'key':'',type:''};
 constructor(public dialog:MatDialog,private apiInfoService:ApiInfoService, private route:ActivatedRoute, private router:Router,private locationService:LocationService) {
   this.data=Array<any>();
 }
//  private dialogRef:MatDialogRef<VolunteersComponent>
//  private dialogRef:MatDialogRef<VolunteersComponent>
 @ViewChild(MatSort,{static:true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  
  openDialog(): void {
    const dialogRef = this.dialog.open(VolunteersComponent, {
      width: '250px',
      // data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
    });
  }

  ngOnInit(): void {
    this.base_url=environment.base_url;
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = parseInt(params.get('id'));
      this.selectedId = id;
    });
    let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0};
    this.selectedSort="SortBy";

    this.getPageData(postData);
    this.getStates();
    let deboardedPostData={status:"Deboarded",limit:this.itemsPerPage,pagenumber:0};
    this.getdeboardedPageData(deboardedPostData);
  }
  getPaginationData(e){
    let postData={status:"Active",limit:this.itemsPerPage,pagenumber:e-1};
    if(this.selectedState){
      postData['filterState']=this.selectedState;
    }
    if(this.selectedDistrict){
      postData['filterDistrict']=this.selectedDistrict;
    }
    if(this.selectedBlock){
      postData['filterBlock']=this.selectedBlock;
    }
    // postData.status="Active";
    this.getPageData(postData);
  }
  getPageData(postData){
    this.loadingSpinner=true;
    this.subs.add=this.apiInfoService.postVolunteersList(postData).subscribe((data) => {
      console.log(data);
      this.dataSource=data.volunteers;
      this.active_total=data.totalVolunteers?data.totalVolunteers:0;
      this.noData.message='';
      this.loadingSpinner=false;
      if(postData.pagenumber===0 || postData.pagenumber==='0'){
        this.p1=1;
      }
     },
     errorResponse=>{
       console.log("error:",errorResponse);
       if(errorResponse.error.statusCode ==1){
        this.dataSource=[];
        this.active_total=0;
        this.noData.message="No Records Found";
        this.loadingSpinner=false;
       }
     });
  }
  getdeboardedPageData(postData){
    this.loadingSpinner=true;
    this.subs.add=this.apiInfoService.getDeboardedVolunteersList(postData).subscribe(data=>{
      this.deboardedDataSource=data.volunteers;
      this.deboarded_total=data.totalVolunteers?data.totalVolunteers:0;
      this.noDeboardData.message='';
      this.loadingSpinner=false;
      if(postData.pagenumber===0 || postData.pagenumber==='0'){
        this.p2=1;
      }
    },errorResponse=>{
      console.log("error:",errorResponse);
      if(errorResponse.error.statusCode ==1){
       this.deboardedDataSource=[];
       this.deboarded_total=0;
       this.noDeboardData.message="No Records Found";
       this.loadingSpinner=false;
      }
    })
  }
  getDeboardedPaginationData(e){
    let postData={status:"Deboarded",limit:this.itemsPerPage,pagenumber:e-1};
    this.getdeboardedPageData(postData);
  }
  getStates(){
    this.statesList=this.locationService.getStates();
    console.log(this.statesList);
    // this.locationService.getStates();
    // this.getDistricts(selectedState);
    
  }

  getDistricts(){
    this.districtsList=this.locationService.getDistricts(this.selectedState);
    console.log(this.districtsList);
  }

getBlocks(){
  this.blocksList=this.locationService.getBlocks(this.selectedState,this.selectedDistrict);
    console.log(this.blocksList);
}


onChangeState(selectedState) {
    if(selectedState=="State" || selectedState=='' || !selectedState){
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0};
      selectedState=null;
      this.getPageData(postData);
      // this.states=data.volunteers.states;
      // this.totalRecords=data.volunteers.length;
      // this.resultsLength=data.volunteers.length;
      this.blocksList=null;
        // this.filterState=null;
  // else{
  //   console.log("abc");
  //   }
  this.districtsList=null;
      }
     
    if (selectedState) {
      this.getDistricts();
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0,filterState:this.selectedState};
      this.getPageData(postData);
    }
  }

  onChangeDistrict(selectedDistrict) {
    if(selectedDistrict=="District" || selectedDistrict=='' || !selectedDistrict){
      this.getDistricts();
      selectedDistrict=null;
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0};
      if(this.selectedState!=''){
        postData['filterState']=this.selectedState;
      }
      this.getPageData(postData);
      this.blocksList=null;
   
    }

    if (selectedDistrict) {
      this.getBlocks();
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0,filterState:this.selectedState,filterDistrict:this.selectedDistrict};
      this.getPageData(postData);
    };
    
  }


  onChangeBlock(selectedBlock) {
    if(selectedBlock=="Block" || selectedBlock=='' || !selectedBlock){
      this.getBlocks();
      selectedBlock=null;
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0};
      if(this.selectedState!=''){
        postData['filterState']=this.selectedState;
      }
      if(this.selectedDistrict!=''){
        postData['filterDistrict']=this.selectedDistrict;
      }
      this.getPageData(postData);
  }
    if (selectedBlock) {
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0,filterState:this.selectedState,filterDistrict:this.selectedDistrict,filterBlock:this.selectedBlock};
      this.getPageData(postData);
    };
  }
  

  onChangeSort(selectedSortBy) {
    // if (selectedSortBy=="SortBy") {
    //   let postData={status:"Active",sortType:"ASC"}
    //   this.subs.add=this.apiInfoService.postVolunteersList(postData).subscribe((data) => {
    //     this.dataSource=data.volunteers;
    //     // this.dataSource.sort=this.sort;
    //     // this.filterState=data.volunteers.state;
    //     // this.filterDistrict=data.volunteers.district;
    //     // this.filterBlock=data.volunteers.block;
        
    //             }
    //   )};
    let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0};
    if (selectedSortBy) {
        postData['sortBy']=selectedSortBy;
        postData['sortType']="ASC";
    };
    if(this.selectedState!=''){
      postData['filterState']=this.selectedState;
    }
    if(this.selectedDistrict!=''){
      postData['filterDistrict']=this.selectedDistrict;
    }
    if(this.selectedBlock!=''){
      postData['filterBlock']=this.selectedBlock;
    }
    this.getPageData(postData);
  }
  sortColumn(sortColumn){
      if(this.sortObj.key && this.sortObj.key==sortColumn){
        this.sortObj.type=this.sortObj.type=='ASC'?this.sortObj.type='DESC':'ASC'
      }
      else{
        this.sortObj.type='ASC';
      }
      this.sortObj.key=sortColumn;
      let postData={status:"Active",limit:this.itemsPerPage,pagenumber:0,sortBy:this.sortObj.key,sortType:this.sortObj.type};
      if(this.selectedState!=''){
        postData['filterState']=this.selectedState;
      }
      if(this.selectedDistrict!=''){
        postData['filterDistrict']=this.selectedDistrict;
      }
      if(this.selectedBlock!=''){
        postData['filterBlock']=this.selectedBlock;
      }
      this.getPageData(postData);
  }

transferVolunteer(element){
  // const dialogConfig=new MatDialogConfig();
  // dialogConfig.disableClose=true;
  // dialogConfig.autoFocus=true;
  // dialogConfig.maxWidth="950px";
  // this.dialog.open(VolunteersComponent,dialogConfig);


  // this.apiInfoService.populateForm(element);
  console.log(element);
  // const dialogConfig= new MatDialogConfig();
  // dialogConfig.disableClose= true;
  // dialogConfig.autoFocus= true;
  // dialogConfig.width="50%";
  // dialogConfig.height="50%";
  
  // this.dialog.open(VolunteersComponent,dialogConfig);



  let congigObject ={
    data:{
      heading:"Transfer Location of Volunteer",
      feature: "transferVolunteer",
      
    },
    disableClose:true,
    width: "50%",
    height:"50%",
    autoFocus: false,
    //position:{top:"50px"},
    //height:"500px"
  };
  this.openGlobalPopup(congigObject);

  // let postData={status:"Active",filterState:this.selectedState,filterDistrict:this.selectedDistrict,filterBlock:this.selectedBlock}
  // this.apiInfoService.postVolunteersList(postData).subscribe((data) => {
  //   this.dataSource=data.volunteers;
    // console.log("abc");
  // });
}


// getArrayFromNumber(length){
//   return new Array(length/10);
// }

// updateIndex(pageIndex){
//   this.startIndex=pageIndex*10;
//   this.endIndex=this.startIndex+10;
//   console.log(pageIndex);
// }

// pageChange1(pagenumber){
//     this.base_url=environment.base_url;
//     let postData={status:"Active",pagenumber=1};
//     this.apiInfoService.postVolunteersList(postData).subscribe((data) => {
//       console.log(data);
//       this.dataSource=data.volunteers;
//       this.states=this.dataSource;
//       this.districts=this.dataSource;
//       this.blocks=this.dataSource;
  
//   }
// }

  opensrCitizenAssign(volunteer){
    let congigObject ={
      data:{
        heading:"Assign Sr.citizens",
        feature: "assignCitizensSingleVolunteer",
        volunteerObj: volunteer
      },
      disableClose:true,
      width: "70%",
      autoFocus: false,
      //position:{top:"50px"},
      //height:"500px"
    };
    this.openGlobalPopup(congigObject);
  }
  addVolunteers(){
    let congigObject ={
      data:{
        heading:"Add Volunteer",
        feature: "addVolunteer"
      },
      disableClose:true,
      width: "50%",
      autoFocus: false,
      //position:{top:"50px"},
      //height:"500px"
    };
    this.openGlobalPopup(congigObject);
  }
  openGlobalPopup(configurationObject){
    this.dialog.open(GlobalDialogComponent,configurationObject);
  }
 


  ngOnDestroy(){
    this.subs.dispose();
  }
  volunteerDetails(element){
    this.router.navigate(['volunteers/VolunteerDetailView',{id: element.idvolunteer}]);
  }

}