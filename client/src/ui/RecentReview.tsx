import React, { Component} from 'react';
import moment from 'moment';
import { Meteor } from "../meteor-shim";
import { Review, Class } from 'common';
import './css/Review.css';

type Props = { info: Review, reportHandler: (review: Review) => void };
type State = { shortName: string; longName: string; link: string };

/*
  Recent Review Component.

  Simple styling component that renders a single review (an li element)
  to show on the homepage. Homepage reivews will include:
   - the name of the course the reivew was for (which takes the user to the course's ClassView onclick)
   - how long ago the reivew was Added
   - all review content
   - report button
*/

export default class RecentReview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // state of app will contain details about the class this reivew is for,
    // and generate the url link to the class's ClassView
    this.state = {
      shortName: "",
      longName: "",
      link: "",
    };

    // Get details about the course this review belongs to, using the courseId
    // assigned to this review.
    Meteor.call('getCourseById', props.info.class, (error: any, result: Class) => {
      if (!error) {
        this.setState({
          shortName: result.classSub.toUpperCase() + " " + result.classNum,
          longName: result.classTitle || '',
          link: '/course/'+ result.classSub.toUpperCase() + "/" + result.classNum,
        });
      } else {
        console.log(error)
      }
    });
  }

  // Function to get the color of the quality color box based on the quality value.
  getQualColor(value: number) {
    const colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value],
    };
  }

  // Function to get the color of the difficulty color box based on the diffiiculty value.
  getDiffColor(value: number) {
    const colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    return {
      backgroundColor: colors[value],
    };
  }


  render() {
    const review: any = this.props.info;

    return (
        <li>
            <div className="row">
              <div className="col-sm-12">
                <a className="classNameLink" href={this.state.link}>
                  <b><u>{this.state.shortName}</u></b>: {this.state.longName}
                </a>
                <p id="date"><i>{moment(review.date.toISOString()).fromNow()}</i></p>
              </div>
            </div>
            <div className="review">
                <div className="panel-body-3">
                    <div className="row reviewNumbers">
                        <div className="col-md-2 col-xs-2 col-xs-2">
                            <div className="container" id="box" style={this.getQualColor(review.quality)}>
                                <div id="text">{review.quality}</div>
                            </div>
                        </div>
                        <div className="col-md-4 col-sm-4 col-xs-4">
                            <p id="label">Overall Quality</p>
                        </div>
                        <div className="col-md-2 col-sm-2 col-xs-2" >
                            <div className="container" id="box" style={this.getDiffColor(review.difficulty)}>
                                <div id="text">{review.difficulty}</div>
                            </div>
                        </div>
                        <div className="col-md-2 col-sm-2 col-xs-2">
                            <p id="label">Difficulty</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="review-text" id="review_text">{review.text}</div>
                    </div>
                    <div className="col-sm-12">
                            <button id="button_text" onClick={() => {this.props.reportHandler(review); alert('This post has been reported and will be reviewed. Course metrics will not change until the post has been reviewed')}}>Report</button>
                    </div>
                </div>
            </div>
        </li>
    );
  }
}
