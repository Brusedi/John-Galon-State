import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import  *  as fromStore from '../../store'   //TODO!!!
import { debug } from 'util';


const SUB_SOURCE_PARAM_DATA_KEY = 'ServiceLocation';

@Component({
  selector: 'app-jn-root-page',
  templateUrl: './jn-root-page.component.html',
  styleUrls: ['./jn-root-page.component.css']
})
export class JnRootPageComponent implements OnInit {

  constructor(
    //private route: ActivatedRoute,
    //private store: Store<fromStore.State>
    ) {
      
      //this.route.data
        //.map( x=> x.data[SUB_SOURCE_PARAM_DATA_KEY] )
        //.subscribe( x => console.log(x) )
  }

  ngOnInit() {
    
  }

}
