import React, { Component} from 'react';
import PropTypes from 'prop-types';
import "./css/Course.css";
import { Redirect } from 'react-router';

/*
  Course Component.

  Simple styling component that represents a single course (an li element).
  Used to list courses in the results of a search in SearchBar.

  If a query is provided as a prop, the component is a seach result, so we underline
  and boldface the query text within the title of the course.

  Clicking this component will change the route of the app to render the course's ClassView.
*/

export default class Course extends Component {

  constructor(props){
    super(props);

    this.setCourseOnSearchBar.bind(this);
  }

  setCourseOnSearchBar(classInfo){
    this.props.handler(classInfo._id, classInfo.classSub, classInfo.classNum, classInfo.classTitle, classInfo.classProfessors);
  }


  render() {
    // generate full human-readable name of class
    const classInfo = this.props.info;
    let text = classInfo.classSub.toUpperCase() + " " + classInfo.classNum + ": " + classInfo.classTitle;
    //if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
    if(this.props.active && this.props.enter == 1 && this.props.useRedirect){
       return <Redirect push to={`/course/${classInfo.classSub.toUpperCase()}/${classInfo.classNum}`}></Redirect>
      }
    // check if a query was provided, if so underline parts of the class name
    if (this.props.query) {
      if (text.toLowerCase().indexOf(this.props.query) != -1) {
        const startIndex = text.toLowerCase().indexOf(this.props.query);
        const endIndex = startIndex + this.props.query.length;
        text = <span className="ellipsis">{text.substring(0,startIndex)}<span className='found'>{text.substring(startIndex,endIndex)}</span>{text.substring(endIndex)}</span>
      } else {
        // based on search technique in server/publications, results without a contains match
        // must be of the form "CS21" or "CS 21". The subject must be a 'match', as well as some
        // text in the substring of query after the subject.

        // substring of query after the subject, without trailing spaces
        const queryWithoutSubject = this.props.query.substring(classInfo.classSub.length).trim();
        // search substring of text after subject for substring of query.
        const textWithoutSubject = classInfo.classNum + ": " + classInfo.classTitle;
        const startIndex = textWithoutSubject.toLowerCase().indexOf(queryWithoutSubject);
        const endIndex = startIndex + queryWithoutSubject.length;

        // underline the subject and any other matching text
        if(!this.props.useRedirect)
        text =
        <span className="ellipsis">
          <span className='found'>{classInfo.classSub.toUpperCase() + " "}</span>
          {textWithoutSubject.substring(0,startIndex)}<span className='found'>{textWithoutSubject.substring(startIndex,endIndex)}</span>{textWithoutSubject.substring(endIndex)}
        </span>
        else text=
          <span className="ellipsis">
          <span>{classInfo.classSub.toUpperCase() + " "}</span>
          {textWithoutSubject.substring(0,startIndex)}<span className='found'>{textWithoutSubject.substring(startIndex,endIndex)}</span>{textWithoutSubject.substring(endIndex)}
        </span>

      }
    }

    //return classname as a list element
    if(this.props.useRedirect)
      return (
      //highlight the element if the indexes matched up (the active prop is true)
      //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
      //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
      <a className={this.props.active && this.props.mouse != 1 ? 'active resultbutton' : 'resultbutton'} 
          id={classInfo.classSub.toUpperCase() + "_" + classInfo.classNum } 
          href={`/course/${classInfo.classSub.toUpperCase()}/${classInfo.classNum}`}>
          <p className="result-label-course">
            Course
          </p>
          <p className="result-text">
              {text}
          </p>
      </a>
    );
    else return(
      //highlight the element if the indexes matched up (the active prop is true)
      //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
      //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
      <li onClick={()=>this.setCourseOnSearchBar(classInfo, this)} className={this.props.active && this.props.mouse != 1 ? 'active classbutton-popup' : 'classbutton-popup'} id={classInfo.classSub.toUpperCase() + "_" + classInfo.classNum }>
        <p className="text-style-3">{text}</p>
      </li>
    );
  }
}

// Requres course informaiton (database object) to generate course title, and uses the query to
// determine styling of output
Course.propTypes = {
  info: PropTypes.object.isRequired,
  query: PropTypes.string, //optional
  active: PropTypes.bool,
  enter: PropTypes.number,
  mouse: PropTypes.number,
  handler: PropTypes.func.isRequired,
  key: PropTypes.string,
  useRedirect: PropTypes.bool
};
